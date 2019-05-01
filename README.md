# AGRC Innovation Grant Vote Skill

This project is the result of an innovation grant [awarded](/docs/award.md) by the DTS Technology Advisory Board to institutionalize and create a process for other divisions and agencies to follow that are interested in developing voice enabled digital assistants for the state of utah. This project is a example of how to develop a digital assistant skill as well as a knowledge base of what to expect and what is required during the entire process. This was the [proposal](/docs/proposal.md).

The goal of this project is to make voting information more accessible to Utah citizens and, ultimately, increase engagement in the voting and political process. This effort aligns with the Innovation Fund’s mission to support projects that promote a “greater efficiency in a government process or a cost saving in the delivery of a government service, or both”.

## Navigation

- [Installation](#installation-parade)
  - [vs code](#vs-code)
  - [command line tools](#cli)
- [Configuration](#configuration-march)

## Installation Parade

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions in `.vscode/extensions.json` if you like to use the command pallet. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`.

### Command Line Tools (CLI)

To test and update google actions, download [gactions cli](https://developers.google.com/actions/tools/gactions-cli) and add it to your path.

To manage, view, and deploy to firebase cloud functions, install the [firebase cli](https://firebase.google.com/docs/cli/). This requires nodejs and npm.

`npm install -g firebase-tools`

## Configuration March

### firebase cli

`firebase login`

## Development Ceremony

### Firebase

`firebase serve --only functions`
`npm run serve`

starts localhost server

ngrok again

update webhook with ngrok url

`firebase deploy --only functions`
`npm run deploy`
