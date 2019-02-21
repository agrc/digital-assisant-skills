# AGRC Innovation Grant Vote Skill

## Installation Parade

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions in `.vscode/extensions.json` if you like to use the command pallet. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`.

### ios/android/etc

Install the Amazon Alexa app or maybe you can get away with logging into the [website](https://alexa.amazon.com/spa/index.html).

_it seems that if you don't have any actual devices associated with your account you will need to use the mobile app as the website get's stuck on configuring a device._

### npm

This project uses nodejs and npm to make certain tasks easier. Please install the required packages.

#### required npm packages

1. ask-cli `npm install -g ask-cli`
   - The Amazon Skills Kit CLI will help you deploy and test your skill.
1. votecli `npm install -g ./cli`
   - The votecli will help you bootstrap your project, switch between local and lambda development, tag lambda functions to DTS standards, and generate utterances.

### python 3

This skill runs on 🐍. Please configure the environment and install the required packages.

#### virtual environments

Execute `alexa-vote-skill/hooks/post_new_hook.sh alexa-vote-skill true` to create the python virtual environment. _⚠️ Execute the command from one level outside the alexa-vote-skill directory._

To activate the virtual environment outside of VS Code run `source ./.venv/skill_env/bin/activate`. Use `deactivate` to get out of the virtual environment.

#### required python packages

Install the python packages from `requirements.dev.text` into the `skill_env` virtual environment.

`pip install -r requirements.dev.txt`

#### extra packages

The [aws-cli](https://github.com/aws/aws-cli) is a helpful tool for working with aws items, in our instance lambda functions.

I used brew `brew install awscli` but their docs say `pip install awscli`. _You may need to use the `--ignore-installed six` if you get an error._

## Configuration March

### ask-cli

1. Initialize the cli with `ask init` and follow the instructions to authorize the cli.
   - The credentials are in google team drive, search for `amazon information`. _⚠️ Our accounts do not have access to create the required roles._
1. Edit your `~/.aws/credentials` to pin your region to `us-west-2`. eg: `region=us-west-2`

_⚠️ The rest of the readme assumes that you are using the `default` profile, otherwise you will need to append `-p|--profile` to your `ask` commands._

### vote-cli

On the first clone of this project the `.ask/config` and the `skill.json` need to be created. Use the `votecli` to generate those by selecting the `I just cloned and I want to set things up!` option. Follow the instructions to generate those files. Choose `lambda` and a name like `ask-voting-assistant-dev-{name}` so it is unique. Execute `ask deploy` to publish the skill and the lambda function.

_After deploying to lambda, be sure to use the vote cli to add the DTS required tags. This requires the aws cli or access to the aws console._

### consent token

Just to ask for a users address, whether or not they have one, you need a consent token. In order to make the alexa skill generate a consent token, you need to login to the alexa companion mobile app or you can try the [website](https://alexa.amazon.com/spa/index.html).

#### mobile app

In the mobile app, login as your `@utah.gov` user

1. select skills & games
1. select your skills
1. select dev
1. select the utah voting skill
1. select settings
1. select manage permissions
1. check device address
1. save permissions

#### website app

1. select skills
1. select your skills
1. select dev skills
1. select the utah voting skill
1. select settings
1. select manage permissions
1. check device address
1. save permissions

### devices

#### physical

To access the skill using a physical device, you can add a second person to your household in the amazon companion app or if you don't have a personal account sign in with the companion app and skip the rest of this. If you are already using this slot you would have to sign out of your personal account and into the work account. You could then add yourself as a household adult. I suggest renaming your developer account to something like `work` since when switching accounts (`switch accounts`) the device will read `switching to works account` instead of having two identically named accounts.

#### companion app

The companion app

1. select devices
1. select all devices
1. alexa on this phone
1. location

You are able to set a location for the alexa on this phone. When testing through the companion app, you should be able to use the stored address.

## Development Ceremony

There are two ways to run the back end for this skill. A flask server running locally or via an aws lambda function.

### local flask

Start the flask server that is acting as a lambda function `python lambda/py/vote_skill.py`. You are now ready to handle requests coming from alexa.

For the alexa skill to reach the flask server and our skill code, we must create a secure tunnel using `ngrok`. _If you are vpn'd into the state network you will need to mount a network share to authenticate. It's weird... I don't understand it. But it works sometimes._

Start ngrok: `./dev/ngrok http 5000` to access port 5000 of the local flask server with an https url.

_You can install [ngrok](https://dashboard.ngrok.com/get-started) if you need a version other than the bundled osx version. Follow the instructions to connect and use ngrok._

Use the `votecli` to swap between ngrok and lambda deployments. Paste the **https** url into the vote cli and accept the changes.

The setting for where alexa send requests is stored in the `skill.json`. An `ask deploy -t skill` is required after making a `skill.json` change to update the alexa skill.

Updates to the `models\*.json` also require a deploy. Updates to the `vote_skill.py` when running locally, **do not** require a deployment.

You can now proceed to the testing ritual or if you want the instructions for a lambda deployment, keep reading.

### lambda

Use the `votecli` to swap between ngrok and lambda deployments. Paste the lambda function name into the cli and accept the changes.

`ask deploy` to publish the lambda function as well as update the skill.

Every modification to `vote_skill.py` requires an `ask deploy` when running in lambda.

After deploying to lambda, be sure to use the vote cli to add the DTS required tags. This requires the aws cli or access to the aws console.

### skill model

Intents require samples or utterances to know what part of the skill code to invoke. To update the model, open the `model.mjs` file and edit the templates. We are using the [alexa-js](https://github.com/alexa-js/alexa-utterances#readme) project to expand our templates. The grammer they use to define their templating is terse. Read about it in their project documents.

Any time the `model.mjs` file is modified, the `votecli` will need to be used to update the model for the skill. Finally, the `ask` cli will need to be used to deploy the updated model. `ask deploy -t model`.

## Testing Ritual

As far as I can tell you cannot store an address when using the terminal simulator or the website. Therefore if you are running locally or on a device without an address stored, you will need to hardcode a Utah address to test.

The recordings save the skill id in the data. Use the votecli to update the recordings for your skill.

```py
#: uncomment for local development
# addr.address_line1 = STREET
# addr.city = CITY
```

### terminal

The `ask` cli has a `dialog` method for testing skills. `ask dialog` will open a REPL that you can interact with your alexa skill.

`ask dialog -l en-us`

You can type things like `open utah voting assistant` and then all of the other utterances that the skill understands. These items can be found in the `models\en-US.json`

There are pregenerated converstaion paths in the `/recordings` folder. These speed up the dialog typing process.

`ask dialog -r recordings/launch.json`

In order to use/generate the recordings, use the `votecli` to generate the recordings with your skill id. Any modifications you make to the recordings, please do so in the `*.template` files.

#### alexa developer console

Login to the [alexa console](https://developer.amazon.com/alexa/console/ask).

Click on this skill to view and edit the settings.

Click on the `Test` menu item and enable skill testing in `Development`.

Speak or type `alexa open utah voting assistant` into the Alexa Simulator.

## Links

- [alexa developer console](https://developer.amazon.com/alexa/console)
- [developer forums](https://forums.developer.amazon.com)
- [alexa skill kit sdk for python](https://alexa-skills-kit-python-sdk.readthedocs.io/en/latest/)
- [Designing for voice guidelines](https://developer.amazon.com/docs/alexa-design/design-voice.html)
- [Utterance docs](https://developer.amazon.com/docs/custom-skills/create-intents-utterances-and-slots.html)
- [Utterance generator](https://github.com/alexa-js/alexa-utterances#readme)
- [Conversation flow diagram](https://docs.google.com/document/d/1TLqm82sRaVhT0VZiNSkF7g0l6N9Du89rHg-WZMqT2m0/)
