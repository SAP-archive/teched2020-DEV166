# Exercise 2  Prepare for Cloud Platform Deployment

Up to this point, the whole application, its data model, its service and its UI application was running locally in you Business Application Studio workspace. Even though we don't cover it in this tutorial, the same would have been possible on you laptop / PC with extensions for Microsoft's Visual Code. 

In this exercise, we will prepare the application for a deployment to the SAP Cloud Platform. In [Exercise 3](../ex3/README.md) a Continuous Integration / Continuous Delivery (CI/CD) Service is introduced that takes care of the deployment every time there is a change in the source code.

## ###############################################################

## Exercise 2.1 Prepare for SAP HANA deployment

While the locally running application uses an in memory SQLite data base, the deployed version will use SAP HANA. CAP helps you with the creation of the database and the deployment of the test data. At runtime it knows which data base to connect to.

In order for this to work, please carry out these steps:

1. Open a new terminal in BAS (**Terminal**->**New Terminal**)
2. In the terminal, run the following, to install the hdb modle and automatically add it as a dependency into the `package.json` file of your project:

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
```
```diff
+      "db": {
+        "kind": "sql"
+      },
```
```json
      "API_BUSINESS_PARTNER": {
        "kind": "odata",
        "model": "srv/external/API_BUSINESS_PARTNER",
        "credentials": {
          "destination": "cap-api098"
        }
      }
```
```diff
-    }
+    },
+    "hana": {
+      "deploy-format": "hdbtable"
+    }
```
```json
  }
}
```


## Exercise 2.2 Prepare User Authentication and Authorization (XSUAA) Setup

### Enable Authentication Support

The enable authentication support in CAP for SAP CP, the `xssec` and `xsenv` modules need to be installed. In your project folder carry out:

```bash
npm i --save  @sap/xssec  @sap/xsenv
```

### Add UAA service

We need to tell CAP that XSUAA is used. For this open the `package.json` folder in your `cpapp` project and add the following lines:

<!-- cpes-file package.json:$.cds.requires -->
```json hl_lines="9-12"
{
  "name": "cpapp",
  ...
  "cds": {
    "requires": {
      "db": {
        "kind": "sql"
      },
      "uaa": {
        "kind": "xsuaa",
        "credentials": {}
      },
      "API_BUSINESS_PARTNER": {
        "kind": "odata",
        "model": "srv/external/API_BUSINESS_PARTNER",
        "credentials": {
          "destination": "cap-api098"
        }
      }
    }
  }
}
```

### Roles and Scopes

In the context of Cloud Foundry a single authorization is called scope, for example there could be a scope "Read" and a scope "Write", that allows a user to read or write a certain business object. Scopes cannot be assigned to users directly. They are packaged into roles. For example, there could a role "Editor" consisting of the "Read" and "Write" scopes, while the role "Viewer" consists only of the "Read" scope.

However, CAP recommends to use roles only and do a one to one mapping. In [Roles and Authorization Checks in CAP](https://github.wdf.sap.corp/pages/cap/guides/authorization#roles) we defined two roles.

### XSUAA Security Configuration

Create the file `xs-security.json` by executing:

```
cds compile srv --to xsuaa >xs-security.json
```

The file contains the configuration of the XSUAA (XS User Authentiation and Authorization service).

CAP takes the authorization parts ```@(restrict ... )``` from our service definiton form [here](../../Roles_CAP/#adding-cap-role-cf-scope-restrictions-to-entities) and creates scopes and role templates from it.

For example, it finds the roles `RiskViewer` and `RiskManager` in the `srv/risk-service.cds` file:

```javascript hl_lines="4 8"
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

And created scopes and roles for both:

```json
{
  "xsappname": "cpapp",
  ...
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




Continue to - [Exercise 3](../ex3/README.md)

