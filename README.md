# AGRC Innovation Grant Vote Skill

This project is the result of an innovation grant [awarded](/docs/award.md) by the DTS Technology Advisory Board to institutionalize and create a process for other divisions and agencies to follow that are interested in developing voice enabled digital assistants for the state of utah. This project is a example of how to develop a digital assistant skill as well as a knowledge base of what to expect and what is required during the entire process. This was the [proposal](/docs/proposal.md).

The goal of this project is to make voting information more accessible to Utah citizens and, ultimately, increase engagement in the voting and political process. This effort aligns with the Innovation Fund’s mission to support projects that promote a “greater efficiency in a government process or a cost saving in the delivery of a government service, or both”.

## Navigation

- [Installation](#installation-parade)
  - [vs code](#vs-code)
  - [google assistant](#google-assistant)
  - [node.js](#node.js)
  - [command line tools](#cli)
- [Configuration](#configuration-march)
  - [permissions](#google-permissions)
  - [firebase cli](#firebase-cli)
- [Development](#development-ceremony)
  - [cloud project](#google-cloud-project)
  - [actions](#google-actions)
  - [dialogflow](#dialogflow)
  - [firebase](#firebase)
- [Testing](#testing-ritual)

## Installation Parade

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions in `.vscode/extensions.json` if you like to use the command pallet. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`.

### Google Assistant

Install the Google Assistant [app](https://assistant.google.com/). Sign in with your google.gov account.

### Node.js

The tools for this project require nodejs and npm. Google functions currently support version 8. We recommend using [nvm](http://nvm.sh) to manage your nodejs versions. After installation, run `nvm use` in this project and the correct version of node and npm will activate.

### Command Line Tools (CLI)

To test and update google actions, download [gactions cli](https://developers.google.com/actions/tools/gactions-cli) and add it to your path.

To manage, view, and deploy to firebase cloud functions, install the [firebase cli](https://firebase.google.com/docs/cli/).

`npm install -g firebase-tools`

## Configuration March

### Google Permissions

Go to your google account [Activity Controls](https://myaccount.google.com/activitycontrols)

At the very least you need `Device Information` enabled.

Google suggests the following but I do not think they are _all_ necessary:

- Web & App Activity (you should also enable the option to ‘Include - Chrome history')
- Device Information
- Voice & Audio Activity

### firebase cli

`firebase login`

## Development Ceremony

### Google Cloud Project

Ask DTS to provide you with a GCP project for a voice assistant.

#### Google Actions

Create a new project in the [Actions on Google](https://console.actions.google.com). When you select `Add/Import project` a new project dialog will pop up. Where you would type in a new `Project Name`, a drop down will appear with projects you have access to. Choose the project name DTS provided you.

Select the `Conversational` card and click the `BUILD` button.

#### Dialogflow

You will now be in the [Dialogflow Console](https://console.dialogflow.com/). Create an agent and click `CREATE`.

Dialogflow is the machine learning tool that you train to handle the input from your users. Intents are questions and statements that can be processed. In this project the responses to intents are fullfilled by a web hook request to a firebase function. Entities are parts of a intent sentence that can be parameterized.

_Dialogflow will create a lien on a project when you try to delete the project. The Dialogflow agent will need to be deleted first to be able to shut down the project._

#### Firebase

Firebase functions require an elevated account from the free spark tier to make http requests to external services. If your action will make web requests outside of google services, the blaze plan is most likely the best option.

The [Firebase Console](https://console.firebase.google.com) will show you a list of your functions as well as the functions logs which are useful for debugging.

#### Starting a local server

Local development is a bit less useful with firebase functions. I could not find a way to debug the firebase functions started with the firebase cli. I think an express server would be an option but not one I was willing to invest in.

To start a local server

- `npm run serve`
- `firebase serve --only functions`

To create a public url with ngrok

- `npm run tunnel`
- `ngrok http 5000`

Update your Dialogflow agents filfillment webhook url with the generated ngrok url

To update the firebase functions in the cloud

- `npm run deploy`
- `firebase deploy --only functions`

## Testing Ritual

The [google actions](https://console.actions.google.com) simulator is the place to test your action. You are able to select a location to test the location permissions and GIS integration.

You can also use the google assistant app on your mobile device. To get started say or type `talk to utah voting info` or whatevcer you set the innvocation display name to be.
