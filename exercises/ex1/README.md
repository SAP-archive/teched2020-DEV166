# Exercise 1 - Exercise 1 Description

In this exercise, we will create an application based on a data model and service created using the Cloud Application Programming Model (CAP) and a UI based on Fiori elements (FE) which in turn is based on UI5.


## Exercise 1.1 Create a CAP-Based Service

In this part, you create a new CAP-based service, which exposes the OData V4 protocol. To do so, you use CAP's tooling `cds init` and `cds watch` in a terminal.

### Create and Initialize the Project

1. Open a terminal.
2. Create a directory ```<myDirectory>``` on your computer, where you want to develop the app.
3. Navigate to that directory.
```
cd <myDirectory>
```
4. Create an initial CAP project by executing the command `cds init`. It creates the project in a new folder called ```cpapp```.
```
cds init cpapp
```
5.  Enter the project folder.
```
cd cpapp
```
6. Open the project in VS Code.
```
code .
```
The project looks like this in VS Code:
![VS Code](markdown/images/vscode.png "VS Code")

6. In VS Code choose ```Terminal -> New Terminal``` from its menu.

    A new terminal opens in the lower right part of the VS Code screen.

7. In the VS Code terminal, start a CAP server.
    ```
    cds watch
    ```
    The CAP server serves all the CAP sources from your project. It also "watches" all the files in your projects and conveniently restarts the server whenever you save a file. Changes you've made, will immediately be served without you having to do anything.

    The screen now looks like this:
    ![CDS Watch](markdown/images/cdswatch.png "CDS Watch")
    Cds watch tells you that there’s no model yet that it can serve. You add one in the next steps.

### Add Files to the Project

1. Open a Finder on Mac or an Explorer on Windows and navigate to ```<mySourceDirectory>``` where you’ve cloned the sources to.

2. Open the folder ```templates```and keep it open, as you copy a number of files from there. For this part of the tutorial and others it’s probably best if you place it next to your VS Code instance like this:

    ![Windows](markdown/images/codeandfinder.png "Windows")

    Alternatively, you can open it as a second folder in your VS Code project: `File -> Add Folder to Workspace...`. Later in the tutorial you need to drag and drop files. Make sure to copy the files instead of moving them.

3. Copy the file `schema.cds` from `templates/cap/create-service/db` to the `db` folder of your app.

    The code that you add by dropping the file looks like this:

    ![DB Schema](markdown/images/dbschema.png "DB Schema")

    This is the code:

    ```javascript
    namespace sap.ui.riskmanagement;
    using { managed } from '@sap/cds/common';

      entity Risks : managed {
        key ID      : UUID  @(Core.Computed : true);
        title       : String(100);
        prio        : String(5);
        descr       : String;
        miti        : Association to Mitigations;
        impact      : Integer;
        //bp          : Association to BusinessPartners;
        criticality : Integer;
      }

      entity Mitigations : managed {
        key ID       : UUID  @(Core.Computed : true);
        description  : String;
        owner        : String;
        timeline     : String;
        risks        : Association to many Risks on risks.miti = $self;
      }
    ```

    It creates 2 entities in the namespace ```sap.ui.riskmanagement```, ```Risks```, and ```Mitigations```. Each of them have a key called ```ID``` and several other properties. a Risk has a mitigation and therefore, the property ```miti``` has an association to exactly one Mitigation. A Mitigation in turn can be used for many Risks, so it has a "too many" association. They key is automatically filled by CAP, which is exposed to the user of the service with the annotation `@(Core.Computed : true)`.

    At this point, you can neglect the commented property ```bp``` (as well as the other commented lines further down in the file). All the commented lines are later used and uncommented when you introduce a reference to a Business Partner entity. For now you don't need it, though.


    Notice how cds watch reacted to dropping the file. It now tells you that it has a model but there are no service definitions yet and thus it still can’t serve anything. So, you add a service definition.

4. Copy the file `risk-service.cds` from `templates/cap/create-service/srv` to the `srv` folder of your app.

    The contents of the file looks like this:

    ```javascript
    using { sap.ui.riskmanagement as my } from '../db/schema';

    @path: 'service/risk'
    service RiskService {
      entity Risks as projection on my.Risks;
        annotate Risks with @odata.draft.enabled;
      entity Mitigations as projection on my.Mitigations;
        annotate Mitigations with @odata.draft.enabled;
      //entity BusinessPartners as projection on my.BusinessPartners;
    }
    ```

    It creates a new service ```RiskService``` in the namespace ```sap.ui.riskmanagement```. This service exposes 2 entities (again just neglect the commented part for the business partner), ```Risks```and ```Mitigations```, which are both just exposing the entities of the data base schema you’ve created in the step before.

    If you again look at the terminal, you see that cds watch has noticed the new file and now tells us that it serves something under http://localhost:4004.

5. Open a browser with http://localhost:4004 and you see:

    ![Service](markdown/images/service.png " Service")

6. Press on the ```$metatdata``` link.

    You see the OData metadata document of your new service. So, with just the 2 files for the db schema and the service exposure you’ve added to your project, you have a running OData service!
    You might wonder why the service itself is called ```risk``` even though in the file it’s called ```RiskService```. This is a convention by CAP, it subtracts the service suffix from the name.

    If you now press on the ```Risks``` link, you only get this:

    ```javascript
    {
        @odata.context: "$metadata#Risks",
        value: [ ]
    }
    ```

    So, there’s no data yet. This is of course because so far your model doesn’t contain any data. You add some now.

7. Copy the folder `data` from `templates/cap/create-service/db` to the `db` folder of your app. If VS Code asks you whether to copy the folder confirm.

    You’ve now added 2 Comma-Separated Value (CSV) Files that contain local data for both the risk and the mitigation entities. A quick look into the ```sap.ui.riskmanagement-Risks.csv``` (the name consists of your namespace and the name of your DB entity from the ```schema.cds``` file) file shows data like this:

    ```csv
    ID;createdAt;createdBy;title;prio;descr;miti_id;impact
    20466922-7d57-4e76-b14c-e53fd97dcb11;2019-10-24;tim.back@sap.com;CFR non-compliance;Fred Fish;3;Recent restructuring might violate CFR code 71;20466921-7d57-4e76-b14c-e53fd97dcb11;10000
    ...
    ```
    The first line contains all the properties from your ```Risks```entity. While the other ones are straight forward, consider the ```miti_id```property. In your entity, you only have a ```miti``` property, so where does this come from? ```miti```is an association to ```Mitigations```, as ```Mitigations``` could have several key properties, the association on the data base needs to point to all of these, therefore CAP creates a property ```<AssocuiationProperty>_<AssociatedEntityKey>``` for each key.

    As always `cds watch` has noticed the change.

8. Revisit the risk entity http://localhost:4004/service/risk/Risks in your browser, you now see the data exposed:

    ![Service Data](markdown/images/servicedata.png " Service Data")

And that's it: You’ve now got a full blown OData service, which complies to the OData standard and supports the respective queries without having to code anything but the data model and exposing the service itself.

*Note:* The service is completely exposed without any authentication or authorization check. you extend the service later with such checks.




















## ###############################################################

## Exercise 1.1 Sub Exercise 1 Description

After completing these steps you will have created...

1. Click here.
<br>![](/exercises/ex1/images/01_01_0010.png)

2.	Insert this line of code.
```abap
response->set_text( |Hello World! | ). 
```



## Exercise 1.2 Sub Exercise 2 Description

After completing these steps you will have...

1.	Enter this code.
```abap
DATA(lt_params) = request->get_form_fields(  ).
READ TABLE lt_params REFERENCE INTO DATA(lr_params) WITH KEY name = 'cmd'.
  IF sy-subrc <> 0.
    response->set_status( i_code = 400
                     i_reason = 'Bad request').
    RETURN.
  ENDIF.

```

2.	Click here.
<br>![](/exercises/ex1/images/01_02_0010.png)


## Summary

You've now ...

Continue to - [Exercise 2 - Exercise 2 Description](../ex2/README.md)

