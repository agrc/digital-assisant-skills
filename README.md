# AGRC Innovation Grant Vote Skill

## Getting Started

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions from `.vscode/extensions.json`. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`. This will show you `Workspace Recommendations`. Install those.

### npm

Install the [ask cli](https://www.npmjs.com/package/ask-cli). The Amazon Skills Kit CLI will help you deploy and test your skill.

`npm install -g ask-cli`.

1. Initialize the cli with `ask init` and follow the instructions to authorize the cli.
   - The credentials are in google team drive. _⚠️ Our accounts do not have access to create the required roles._
1. Edit your `~/.aws/credentials` to pin your region to `us-west-2`. eg: `region=us-west-2`

_⚠️ The rest of the readme assumes that you are using the `default` profile, otherwise you will need to append `-p|--profile` to your `ask` commands._

Install the `votecli` from this project. The vote CLI will help you bootstrap your project, switch between local and lambda development, and generate the utterances.

`npm install -g ./votecli`

⚠️ If you are running this project for the first time, run the vote cli and select the bootstrap the project command.

`votecli`

### python 3

Execute `alexa-vote-skill/hooks/post_new_hook.sh alexa-vote-skill true` to create the python virtual environment. _⚠️ Execute the command from one level outside the alexa-vote-skill directory._

To activate the virtual environment outside of VS Code run `source ./.venv/skill_env/bin/activate`. Use `deactivate` to get out of the virtual environment.

`pip install -r requirements.dev.txt`

Use the command pallet to select `Python: Select Interpreter`. Select the python with the `./.venv/skill_env` path. This will generate the following in your `settings.json`.

```json
{
  "python.pythonPath": ".venv/skill_env/bin/python"
}
```

Start the flask server that is acting as a lambda function `python lambda/py/vote_skill.py`. You are now ready to handle requests coming from alexa.

### localhost tunnel

For the alexa skill to reach the flask server and our skill code, we must create an secure tunnel using ngrok.

Start ngrok: `./dev/ngrok http 5000` to access port 5000 of the local flask server with an https url.

You can install [ngrok](https://dashboard.ngrok.com/get-started) if you need a version other than the bundled osx version. Follow the instructions to connect and use ngrok.

### alexa

Use the `votecli` to swap between ngrok and lambda deployments.

Use the `ask` cli to deploy your skill. `ask deploy`

_You may need to use the `-f|--force` option._

After deploying to lambda, be sure to use the vote cli to add the tags.

### testing

#### ask-cli

The `ask` cli has a `simulate` and `dialog` method for testing this skill. Ask dialog will open a REPL that you can interact with your alexa skill.

`ask dialag -l en-us`

There are pregenerated converstaion paths in the `/recordings` folder. These speed up the dialog process.

`ask dialog -r recordings/launch.json`

As far as I can tell you cannot store a location when using the simulator. Therefore, you will need to hardcode an address if you are not using an actual device.

```py
#: uncomment for local development
# addr.address_line1 = STREET
# addr.city = CITY
```

#### alexa developer console

Login to the [alexa console](https://developer.amazon.com/alexa/console/ask).

Click on this skill to view and edit the settings.

Click on the `Test` menu item and enable skill testing in `Development`.

Speak or type `alexa open utah voting assistant` into the Alexa Simulator.

### documetation

To access the skill using a physical device, you add a second person to your household in the amazon companion app or if you don't have a personal account sign in with the companion app and skip the rest of this. If you are already using this slot you would have to make room in order to add your work account. I suggest renaming your developer account to something like `work` since when switching accounts (`switch accounts`) the device will read `switching to works account` instead of having two identically named accounts.

#### Links

- [alexa developer console](https://developer.amazon.com/alexa/console)
- [developer forums](https://forums.developer.amazon.com)
- [alexa skill kit sdk for python](https://alexa-skills-kit-python-sdk.readthedocs.io/en/latest/)
- [Designing for voice guidelines](https://developer.amazon.com/docs/alexa-design/design-voice.html)
- [Utterance docs](https://developer.amazon.com/docs/custom-skills/create-intents-utterances-and-slots.html)
- [Utterance generator](https://github.com/alexa-js/alexa-utterances#readme)
- [Conversation flow diagram](https://docs.google.com/document/d/1TLqm82sRaVhT0VZiNSkF7g0l6N9Du89rHg-WZMqT2m0/)
