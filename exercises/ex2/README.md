# Exercise 2  Prepare for Cloud Platform Deployment

Up to this point, the whole application, its data model, its service and its UI application was running locally in your Business Application Studio workspace. Even though we don't cover it in this tutorial, the same would have been possible on your laptop / PC with extensions for Microsoft's Visual Code. 

In this exercise, we will prepare the application for a deployment to the SAP Cloud Platform. In [Exercise 3](../ex3/README.md) a Continuous Integration / Continuous Delivery (CI/CD) Service is introduced that takes care of the deployment every time there is a change in the source code.

## ###############################################################

## Exercise 2.1 Prepare for SAP HANA deployment

While the locally running application uses an in memory SQLite data base, the deployed version will use SAP HANA. CAP helps you with the creation of the database and the deployment of the test data. At runtime it knows which data base to connect to.

In order for this to work, please perform these steps:

1. Open a new terminal in BAS (**Terminal**->**New Terminal**)
2. In the terminal, run the following command to install the hdb module and automatically add it as a dependency into the `package.json` file of your project:

```
npm install hdb --save
```

3. In you project, open the `package.json` file and add the following lines:

```json
{
  "name": "cpapp",
  ...
  "cds": {
    "requires": {
//### BEGIN OF INSERT
      "db": {
        "kind": "sql"
      },
//### END OF INSERT
      "API_BUSINESS_PARTNER": {
        "kind": "odata",
        "model": "srv/external/API_BUSINESS_PARTNER"
      }
//### BEGIN OF DELETE
    }
//### END OF DELETE
//### BEGIN OF INSERT
    },
    "hana": {
      "deploy-format": "hdbtable"
    }
//### END OF INSERT
  }
}
```

## ###############################################################

## Exercise 2.2 Prepare User Authentication and Authorization (XSUAA) Setup

### Enable Authentication Support

To enable authentication support in CAP for SAP Cloud Platform, the `xssec` and `xsenv` modules need to be installed. 

1. Open a new terminal in BAS (**Terminal**->**New Terminal**)
2. In the terminal, run the following command to install the hdb module and automatically add it as a dependency into the `package.json` file of your project:

```bash
npm i --save  @sap/xssec  @sap/xsenv
```

### Add UAA service

We need to tell CAP that the security component XSUAA (XS User Authentiation and Authorization service) is used. For this open the `package.json` folder in your project and add the following lines:

```json 
{
  "name": "cpapp",
  ...
  "cds": {
    "requires": {
      "db": {
        "kind": "sql"
      },
//### BEGIN OF INSERT
      "uaa": {
        "kind": "xsuaa",
        "credentials": {}
      },
//### END OF INSERT
      "API_BUSINESS_PARTNER": {
        "kind": "odata",
        "model": "srv/external/API_BUSINESS_PARTNER"
      }
    }
  }
}
```

### Roles and Scopes

In the context of Cloud Foundry within the Cloud Platform a single authorization is called scope, for example there could be a scope "Read" and a scope "Write", that allows a user to read or write a certain business object. Scopes cannot be assigned to users directly. They are packaged into roles. For example, there could a role "Editor" consisting of the "Read" and "Write" scopes, while the role "Viewer" consists only of the "Read" scope.

However, CAP recommends to use roles only and do a one to one mapping. In [Exercise 1.6 - Roles and Authorization Checks In CAP](../ex1#exercise-16--roles-and-authorization-checks-in-cap) we defined two roles.

### XSUAA Security Configuration

Create the file `xs-security.json` in your `RiskManagement` project by executing the following in a terminal in BAS:

```
cds compile srv --to xsuaa >xs-security.json
```

The generated file then contains the configuration of the XSUAA. Behind the scenes, CAP has taken the authorization parts ```@(restrict ... )``` from our service definiton form [here](../ex1#exercise-16--roles-and-authorization-checks-in-cap) and created scopes and role templates from it.

For example, it finds the roles `RiskViewer` and `RiskManager` in the `srv/risk-service.cds` file:

```javascript 
  entity Risks @(restrict : [
            {
                grant : [ 'READ' ],
                to : [ 'RiskViewer' ]
            },
            {
                grant : [ '*' ],
                to : [ 'RiskManager' ]
            }
      ]) as projection on my.Risks;
```

And created scopes and roles for both in the `xs-security.json` file in your project:

```json
{
  "xsappname": "RiskManagement",
  "tenant-mode": "dedicated",
  "scopes": [
    {
      "name": "$XSAPPNAME.RiskViewer",
      "description": "Risk Viewer"
    },
    {
      "name": "$XSAPPNAME.RiskManager",
      "description": "Risk Manager"
    }
  ],
  "role-templates": [
    {
      "name": "RiskViewer",
      "description": "Risk Viewer",
      "scope-references": [
        "$XSAPPNAME.RiskViewer"
      ],
      "attribute-references": []
    },
    {
      "name": "RiskManager",
      "description": "Risk Manager",
      "scope-references": [
        "$XSAPPNAME.RiskManager"
      ],
      "attribute-references": []
    },
    {
      "name": "Token_Exchange",
      "description": "UAA",
      "scope-references": [
        "uaa.user"
      ]
    }
  ]
}
```


## ###############################################################

## Exercise 2.3 Create a "Multi Target Application" (MTA) file for deployment

In this section we will create a "Multi Target Application" (MTA) file for deplyment. (See also the [documentation](https://help.sap.com/viewer/4505d0bdaf4948449b7f7379d24d0f0d/latest/en-US/ebb42efc880c4276a5f2294063fae0c3.html)). MTA is a way to create deployments consisting of multiple modules that can be implemented in different technologies. Advantages of this technology are that it comes with a build tool, automatically creates service instances, service keys and destinations, deploys content (HTML5, workflow, ...), and supports [blue-green deployment](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/7c83810c31d842938cbc39c135a2d99f.html).

### Generate MTA Deployment Descriptor (`mta.yaml`)

The MTA deployment is described in the MTA Deployment Descriptor, a file called  `mta.yaml`.
As the first step, let CAP generate an initial `mta.yaml` file.

1. Open a new terminal in BAS (**Terminal**->**New Terminal**)
2. In the terminal, run the following:

```
cds add mta
```

The `cds` Command Line Interface has generated the file based on your previously created settings in the `package.json` file.

3. Open the new `mta.yaml` file

The `mta.yaml` file consists of different modules, that are Cloud Foundry apps, and resources, that are Cloud Foundry services.

*Modules:*

* `RiskManagement-srv` - OData service
* `RiskManagement-db-deployer` - Deploy CAP schema and data (CSV files) to database

*Resources:*

The resources are generated from the `requires` section of `cds` in the `package.json`.

* `RiskManagement-db` - HANA DB HDMI container
* `RiskManagement-uaa` - XSUAA service

The resources are Cloud Foundry service instances, that are automatically created and updated during the MTA deployment.

4. Change the following:

```yaml
...
 # services extracted from CAP configuration
 # 'service-plan' can be configured via 'cds.requires.<name>.vcap.plan'
# ------------------------------------------------------------
 - name: RiskManagement-db
# ------------------------------------------------------------
   type: com.sap.xs.hdi-container
   parameters:
//### BEGIN OF DELETE
     service: hana  # or 'hanatrial' on trial landscapes
//### END OF DELETE
//### BEGIN OF INSERT
     service: hanatrial  
//### END OF INSERT
     service-plan: hdi-shared
   properties:
     hdi-service-name: ${service-name}
```

As the application will run on a HANA trial instance, the corresponding HANA service needs to be used.

## ###############################################################

## Exercise 2.4  Add Authorization and Trust Management Service (XSUAA)

The next step is to add the Authorization and Trust Management service to the `mta.yaml` to allow user login, authorization and authentication checks.

1. In your `mta.yaml` file change the following:


```yaml 
_schema-version: '3.1'
...
resources:
  ...
# ------------------------------------------------------------
 - name: RiskManagement-uaa
# ------------------------------------------------------------
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
//### BEGIN OF INSERT
      path: ./xs-security.json
//### END OF INSERT
      config:
//### BEGIN OF DELETE
       xsappname: -${space}    #  name + space dependency
       tenant-mode: dedicated
//### END OF DELETE
//### BEGIN OF INSERT
       xsappname: 'RiskManagement-${space}'
       role-collections:
         - name: 'RiskManager-${space}'
           description: Manage Risks
           role-template-references:
             - $XSAPPNAME.RiskManager
         - name: 'RiskViewer-${space}'
           description: View Risks
           role-template-references:
             - $XSAPPNAME.RiskViewer
//### END OF INSERT
```

The configuration for XSUAA is read from the `xs-security.json` file that was created in the step before.

But in the `config` element, values can be added and overwritten.

The value `xsappname` gets overwritten with a Cloud Foundry space-dependent value. The name has to be unique within a Cloud Platform subaccount.

This allows multiple deployments of this tutorial in different spaces of the same subaccount. For example, different people of a team that want to try it out and don't want to create a new subaccount for each team member.

For a productive application, the `xsappname` should be explicitly set to the desired value.

Further, you can add role collections using the `xs-security.json` file. Since role collections need to be unique in a Subaccount like the `xsappname`, you can add it here and use the `${space}` variable to make them unique like for the `xsappname`.

Alternatively, role collections can be manually added in the SAP Cloud Platform Cockpit.

## ###############################################################

## Exercise 2.5  Add an Application Router

In order for our application to run on the cloud, we need another component on top of the service and the UI. It will route the request from the browser either to the CAP service or to the provider of the UI sources. It also makes sure that authenticated and authorized users get a token from the XSUAA service which is also routed to the CAP service, that checks for this token. 
All of this is provided by another application (`module` in the MTA context). This application is a so-called AppRouter application.

### Create the AppRouter NPM Module

1. Using a terminal in BAS, create a folder `approuter` where you store all AppRouter artifacts and switch to the new folder:

    ```
    mkdir approuter
    cd approuter
    ```

(This of course could have also be done in BAS' file explorer instead of the terminal, but since there is a command line interface in the folder needed in the next step, we chose the terminal for creating the folder)

2. Initialize `npm` in this folder and install the latest version of AppRouter NPM module:

    ```bash
    npm init --yes
    npm install @sap/approuter
    ```

    The functionality of the AppRouter is provided by the `@sap/approuter` NPM module.

2. Check the required Node.js version for AppRouter

    This is declared in the `package.json` file the AppRouter. You can check it for example with this script:

    ```bash
    cat node_modules/@sap/approuter/package.json | grep '"node"'
    ```

    It outputs something like:

    ```
    "node": "^10.0.0 || ^12.0.0"
    ```

    In this example AppRouter supports Node.js 10.x.x and 12.x.x versions.

3. Add required Node.js version in `approuter/package.json` file. This depends on the supported versions of the AppRouter, like ^12.0.0 in this example. Also add the start script for the AppRouter.

```json 
{
  "name": "approuter",
  ...
  "scripts": {
//### BEGIN OF DELETE
    "test": "echo \"Error: no test specified\" && exit 1"
//### END OF DELETE
//### BEGIN OF INSERT
    "start": "node node_modules/@sap/approuter/approuter.js"
//### END OF INSERT
  },
  ...
  "dependencies": {
    "@sap/approuter": "^8.5.5"
//### BEGIN OF DELETE
  }
//### END OF DELETE
//### BEGIN OF INSERT
  },
  "engines": {
    "node": "^12.0.0"
  }
//### END OF INSERT
}
```

### AppRouter Configuration

Configure the AppRouter by creating a file `xs-app.json` in the `approuter` folder with the following content:

```json 
{
    "welcomeFile": "/app/risks/webapp/index.html",
    "authenticationMethod": "route",
    "sessionTimeout": 30,
    "logout": {
        "logoutEndpoint": "/do/logout",
        "logoutPage": "/"
    },
    "routes": [
        {
            "source": "^/app/(.*)$",
            "target": "$1",
            "localDir": "resources",
            "authenticationType": "xsuaa"
        },
        {
            "source": "^/service/(.*)$",
            "destination": "srv-binding",
            "authenticationType": "xsuaa"
        }
     ]
}
```

The configration in the `routes` array tells the AppRouter how to respond to requests.

- The files in the `resources` folder will be served for all requests to `/app`. Later, there’s an explanation how you get the "app" files into this resource folder.
- All requests starting with `/service` will be forwarded to the CAP service based on the URL we configured in the MTA using the destination `srv_app`. Remember, the risk service is reachable via `/service/risk`. Further services are automatically routed as long as they start with `/service/` as well.

Further, the AppRouter will automatically redirect to the `/app/launchpage.html` when accessed without a path, which will then serve the file `resources/launchpage.html`.

## ###############################################################

## Exercise 2.6 Add UI and AppRouter Module to `mta.yaml`

The automatic creation of the mta.yaml file added everthing that is needed from CAP side to the mta file, so the service, the database deployer, but also the dependency to the xsuaa and hana service. 
Our Fiori elements based UI application, however, is still missing, we need to manually add this module as unfortunately, there is no automation support for this 

The AppRouter of the previous chapter is also and application, like our CAP service and the UI. Like these two, the AppRouter also needs to be deployed, for this we need to add a configuration to the MTA file that we created before. 

1. Add the `RiskManagement-approuter` and the `RiskManagement-app` module for the AppRouter to the `mta.yaml`:

```yaml 
 # -------------------- SIDECAR MODULE ------------------------
 - name: cpapp-db-deployer
 # ------------------------------------------------------------
   type: hdb
   path: gen/db  
   parameters:
     buildpack: nodejs_buildpack
   requires:
    # 'hana' and 'xsuaa' resources extracted from CAP configuration
    - name: cpapp-db
    - name: cpapp-uaa
//### BEGIN OF INSERT
  # --------------------  APPROUTER -----------------------------
 - name: RiskManagement-approuter
  # ------------------------------------------------------------
   type: nodejs
   path: approuter
   requires:
     - name: RiskManagement-uaa
     - name: srv-api
       group: destinations
       properties:
         forwardAuthToken: true
         strictSSL: true
         name: srv-binding
         url: '~{srv-url}'
   build-parameters:
     requires:
       - name: RiskManagement-app
         artifacts:
           - ./*
         target-path: resources
  # --------------------  UI -----------------------------------
 - name: RiskManagement-app
  # ------------------------------------------------------------
   type: html5
   path: app
   build-parameters:
     supported-platforms: []
//### END OF INSERT
```

The AppRouter takes the UI resources of the `RiskManagement-app` and puts it in the `resources` directory. This is where the `xs-app.json` looks for the files requested for `/app/...`.

The `RiskManagement-uaa` binding adds our already existing XSUAA service instance to the AppRouter, which makes login and logout possible. By this the AppRouter forwards requests with the authentication token (`Authorization: Bearer <jwt-token>`) to the CAP service. The CAP service then uses it for authentication and authorization checks.

The `srv-binding` creates an environment variable `destinations` that contains a JSON array with one object containing the **destination** to the CAP service. This is required to forward requests to the CAP service.

The generated environment variable looks like this:
```sh
destinations='[{ "name": "srv-biding", "forwardAuthToken": true, "strictSSL": true, url: "https://..." }]
```

The URL is taken from the `RiskManagement-srv` module that needs to be enhanced to export this information.

## Exercise 2.7 Remove access for S/4 system

The steps until now have shown how to integrate an S/4 service into your application, how to run it locally with sample data and what you have to do to get the application including its access to the S/4 system deployed. However, for these exercises we don't have a real S/4 system at hand as mentioned in the [overview](../../../..#overview) for this tutorial!
If we deployed the application like it is up to now, the code would of course try to access a systen which does not exist. Therefore, we remove the code that is necessary in a real scenario and we hope it helps you there, but for this tutorial we remove / change some parts to prevent the S/4 call. We will instead create another local service with sample data for the business partner as we have done before for risks and mitigations.

1. In your project enter the `package.json` file and remove the folloing part which was generated by CAP when you imported the API definiton from API Hub. 

```JSON
  "cds": {
    "requires": {
      "db": {
        "kind": "sql"
      },
      "uaa": {
        "kind": "xsuaa",
        "credentials": {}
//### BEGIN OF DELETE
      },
      "API_BUSINESS_PARTNER": {
        "kind": "odata",
        "model": "srv/external/API_BUSINESS_PARTNER"
//### END OF DELETE
      }
```

2. In your `db` folder, open the `schema.cds` file again. Here the reference to the external service was created before. We leave this reference here, but change the name of the entity to `BusinessPartnersS4`. At the same time we add a new entity with the original name `BusinessPartners`, this is the one that is used by our service. So, you are replacing the original entity that pointed to S/4 with a local copy. 

```JS
namespace sap.ui.riskmanagement;
using { managed } from '@sap/cds/common';

  entity Risks : managed {
    key ID      : UUID  @(Core.Computed : true);
    title       : String(100);
    owner       : String;
    prio        : String(5);
    descr       : String;
    miti        : Association to Mitigations;
    impact      : Integer;
    bp          : Association to BusinessPartners;
    criticality : Integer;
  }

  entity Mitigations : managed {
    key ID       : UUID  @(Core.Computed : true);
    description  : String;
    owner        : String;
    timeline     : String;
    risks        : Association to many Risks on risks.miti = $self;
  }

// using an external service from S/4
  using {  API_BUSINESS_PARTNER as external } from '../srv/external/API_BUSINESS_PARTNER.csn';

//### BEGIN OF DELETE
  entity BusinessPartners as projection on external.A_BusinessPartner {
//### END OF DELETE
//### BEGIN OF INSERT
  entity BusinessPartnersS4 as projection on external.A_BusinessPartner {
//### END OF INSERT
     key BusinessPartner,
     LastName,
     FirstName
   }

//### BEGIN OF INSERT
// using a local service instead of the S/4 one with the same type of entity
   entity BusinessPartners  {
    key BusinessPartner:    String(10);
    LastName:               String(40);
    FirstName:              String(40);
  }
//### END OF INSERT
```

3. The last part that is missing is the bp data. Copy the `API_BUSINESS_PARTNER-A_BusinessPartner.csv` file in your `srv/external/data` folder and paste it into the `db/data` folder, next to the data files of risks and mitigations. Rename the copied file to `sap.ui.riskmanagement-BusinessPartners.csv`, reflecting the new local entity, so CAP can automatically assign this data to the entity.

4. Make sure that the application still runs locally. If not `cds watch` is still running from prior chapters, start it in a terminal and check the application.

You have now finished all the preparations to deploy the application to the Cloud Plaform!

Continue to - [Exercise 3](../ex3/README.md) where a CI/CD service will deploy the application.

