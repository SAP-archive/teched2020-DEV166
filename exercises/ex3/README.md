# Exercise 3 - Connect Your Project to SAP Cloud Platform Continuous Integration and Delivery 

In this exercise, we will create a project in a public GitHub repository in which to store your source code, enable SAP Cloud Platform Continuous Integration and Delivery, and configure and run a predefined continuous integration and delivery (CI/CD) pipeline that automatically tests, builds, and deploys your code changes.

## Exercise 3.1 Create a GitHub Repository

After completing these steps, you will have created a public GitHub repository, in which you can store the source code of your project. **Note:** For this execise, you need to have a GitHub user.

1. Open and sign in to https://github.com/.

2. In the **Repositories** tab, choose **New** to create a new repository.
![Create Github Repo](./images/GH_newRepository.png)
   
3. As **Repository name**, enter *RiskManagement*. Don't tick any of the **Initialize this repository with** checkboxes.

4. Choose **Create repository**.
![Create Github Repo](./images/GH_createGitRepo.png)

5. Copy the HTTPS URL of your newly created GitHub repository.
![Copy GitHub URL](./images/GH_copyGitHubURL.png)


## Exercise 3.2 Create a Personal Access Token for GitHub

After completing these steps, you will have created a personal access token to authenticate against GitHub.

To create a personal access token, which you can use instead of a password, follow the steps described in [Creating a personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).


## Exercise 3.3 Connect Your GitHub Repository with Your CAP Project

After completing these steps, you will have added your CAP project sources to your GitHub repository.

1. If you have Business Application Studio still open from the former exercises, return to ot. If you haven't, open your [SAP Cloud Platform Trial](https://cockpit.hanatrial.ondemand.com/) and click on the Quick Tool Access icon **SAP Business Application Studio**.

![Welcome SCP Trial](../ex0/images/00_00_0020.png)

2. Open the previously created workspace with your CAP application.

3. Open a new terminal and navigate to your project root folder.
![Open Terminal](./images/openTerminal.png)

4. Enter your email address and username. You can use the email address that you've used to register your GitHub account:
   ```
   git config --global user.email "you@example.com"
   git config --global user.name "Your Name"
   ```
5. To initialize a GitHub repository and add the project sources to it, execute the following commands:
    ```
    git init
    git add .
    git commit -m "Push project content to GitHub"
    git branch -M main
    ```

6. Now, add your copied GitHub repository URL from exercise 3.1 as remote repository:
   ```
   git remote add origin <copied Git repository url.git>
   ```

7. Push the commit with your project content to this GitHub repository:
    ```
    git push -u origin main
    ```

8. When prompted, enter your GitHub username and the personal access token, created in exercise 3.2.


## Exercise 3.4 Enable SAP Cloud Platform Continuous Integration and Delivery

After completing these steps, you will have subscribed to SAP Cloud Platform Continuous Integration and Delivery and assigned the *Administrator* role to your user.


1. Enter your [SAP Cloud Platform trial account](https://cockpit.hanatrial.ondemand.com/), press **Enter your trial account**, press on the **trial** tile and navigate to the **Subscriptions** tab.
Here, you can find the Continuous Integration & Delivery service:
![Service Tile](./images/CICD_ServiceTile.png)

2. Choose the service tile and then choose **Subscribe**.
![Service Tile](./images/CICD_subscribe_service.png)

3. In your SAP Cloud Platform subaccount, choose **Security** → **Trust Configuration**.

4. Choose the name of your identity provider.

5. Enter your email address.

6. Choose **Show Assignments**.
If your user is new to your subaccount, choose **Add User** in the confirmation dialog.

7. Choose **Assign Role Collection**.

8. From the drop-down list, choose **CICD Service Administrator**.


## Exercise 3.5 Configure Credentials in SAP Cloud Platform Continuous Integration and Delivery

After completing these steps, you will have configured credentials for connecting SAP Cloud Platform Continuous Integration and Delivery to other services.

1. In your SAP Cloud Platform subaccount, choose **Subscriptions**.

2. In the **Extension Suite - Development Efficiency** category, choose **Continuous Integration & Delivery**.

3. Choose **Go to Application**.

4. Use your credentials to log in to the application.
![CICD](./images/CICD_access.png)

5. If your GitHub repository is private, configure credentials for it, so that the Continuous Integration & Delivery service can connect to it. **Note:** If your GitHub repository isn't private, you can skip this step.

   - In the **Credentials** tab in SAP Cloud Platform Continuous Integration and Delivery, choose **+** *(Create Credentials)*.
  ![Credentials](./images/CICD_credentials.png)
   - For **Name**, enter a freely chosen name for your credential, which is unique in your SAP Cloud Platform subaccount. In this example, the name of the credential is *github*.

   - As **Type**, select **Basic Authentication**.

   - For **Username**, enter your Github username.

   - For **Password**, use the personal access token, which you've created in GitHub in exercise 3.3.
   ![Credentials GitHub](./images/CICD_credentials_github.png)

6. To create credentials for deploying to the SAP Cloud Platform Cloud Foundry environment, go to the **Credentials** tab and choose **+** *(Create Credentials)*.
![Credentials](./images/CICD_credentials.png)

7. For **Name**, enter a freely chosen name for your credentials, which is unique in your SAP Cloud Platform subaccount. In this example, the name of the credentials is *cfdeploy*.

8. As **Type**, select **Basic Authentication**.

9. For **Username**, enter your username for the SAP Cloud Platform cockpit.

10. For **Password**, use your password for the SAP Cloud Platform cockpit.
![Credentials GitHub](./images/CICD_credentials_cfdeploy.png)


## Exercise 3.6 Configure a CI/CD Job

After completing these steps, you will have configured a job in SAP Cloud Platform Continuous Integration and Delivery.

1. In the **Jobs** tab in SAP Cloud Platform Continuous Integration and Delivery, choose **+** *(Create Job)*.
![Jobs](./images/CICD_jobs.png)

2. For **Job Name**, enter a freely chosen name for your job, which is unique in your SAP Cloud Platform subaccount. In this example, the name of the job is *RiskManagment*.

3. For **Repository URL**, enter the URL of your GitHub repository.

4. If your GitHub repository is private, for **Repository Credentials**, enter the name of the credentials to access your GitHub Repository, which you've created in exercise 2.5. If your GitHub repository isn't private, leave this field empty.

5. For **Branch**, enter the GitHub branch from which you want to receive push events.

6. As **Pipeline**, choose **sap-cloud-sdk**.

7. Choose **Create**.
![CAP Job](./images/CICD_CAP_job.png)
Whenever you create the first job for a GitHub repository, the **Webhook Creation** pop-up appears, which provides you with the data needed to define a webhook in GitHub. Alternatively, you can open the detail view of an existing job in the **Jobs** tab and under **General Information**, choose **Webhook Data**.
![Webhook](./images/CICD_webhook.png)

8. In your project in GitHub, go to the **Settings** tab.

9. From the navigation pane, choose **Webhooks**.

10. Choose **Add webhook**.
![Webhook](./images/GH_webhook.png)

11. Enter the **Payload URL**, **Content type**, and **Secret** from the **Webhook Creation** pop-up in SAP Cloud Platform Continuous Integration and Delivery. For all other settings, leave the default values.

12. Choose **Add webhook**.
![Webhook Details](./images/GH_webhook_details.png)


## Exercise 3.7 Configure the Stages of Your CI/CD Pipeline

After completing these steps, you will have configured the stages of your pipeline in SAP Cloud Platform Continuous Integration and Delivery.

1. In the GitHub repository of your project (or in your still open Business Application Studio), create a folder named `.pipeline`, which contains a file named `config.yml`. In the `config.yml` file, add the following initial configuration:

```PipelineConfiguration
# Project configuration
general:
  projectName: 'RiskManagement'
  productiveBranch: 'main'

# Stage configuration
stages:
  productionDeployment:
    cfTargets:
    - org: '<YOUR ORG NAME>'
      space: '<YOUR SPACE NAME>'
      appName: '<NAME OF YOUR APPLICATION>'
      apiEndpoint: '<YOUR CLOUD FOUNDRY API ENDPOINT>'
      credentialsId: '<NAME OF YOUR CEDENTIAL>'
```

2. Replace the placeholders with the values of the space in the Cloud Foundry environment to which you want to deploy.
`<NAME OF YOUR APPLICATION>` is `RiskManagement` and `credentialId` is the name of the credntials you have created before for Cloud Platform access, in the example we used `cfdeploy`.
You can get the values for `<YOUR ORG NAME>`, `<YOUR SPACE NAME>`, and `<YOUR CLOUD FOUNDRY API ENDPOINT>` from your subaccount overview in the SAP Cloud Platform cockpit:
![Cockpit](./images/CP_API_Endpoint.png) 



3. Commit your changes to GitHub. If you have added the new folder and file in the Businss Application Studio, you can do so by opening a new terminal and then by

```
git add -A
git commit -m "new pipeline"
git push
```

## Exercise 3.8 Verify the Success of Your Build

After completing these steps, you will have monitored the outcome of your job in SAP Cloud Platform Continuous Integration and Delivery.

1. In the **Jobs** tab in SAP Cloud Platform Continuous Integration and Delivery, select your job and verify that a new tile appears in the **Builds** view. This tile should be marked as running.
![Job](./images/CICD_running_job.png)
**Note:** If no new tile appears, trigger the job manually by choosing the *Trigger Build* button.
![Trigger Job](./images/CICD_trigger_job.png)

2. Wait until the job has finished and verify that the build tile is marked as successful.
![Successful Build](./images/CICD_successful_build.png)


## Exercise 3.9 Access the Deployed Application

After completing these steps, you will have accessed your deployed application trough the SAP Cloud Platform cockpit.

1. In your trial account in the SAP Cloud Platform cockpit, navigate to the **Cloud Foundry** tab and choose **Spaces**.
![CP Spaces](./images/CP_cloudfoundry.png)

2. Select your space.

3. Verify that the *RiskManagment* application has been deployed and that the `cpapp-approuter` is running.
![RiskManagment App](./images/RiskManagment_running.png)

4. Choose the `cpapp-approuter`.

5. Choose the link under **Application Routes**.
![RiskManagment App](./images/RiskManagment_cpapp_running.png)

6. Verify that the deployed application is running and showing its home screen.
![RiskManagment Home](./images/RiskMngmt_home.png)

## Summary

You've created a project in GitHub to store your source code and successfully configured and run a predefined continuous integration and delivery pipeline that automatically builds, tests and deploys your code changes.

