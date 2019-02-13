# AGRC Innovation Grant Vote Skill

## Getting Started

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions from `.vscode/extensions.json`. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`. This will show you `Workspace Recommendations`. Install those.

### npm

Install the [ask cli](https://www.npmjs.com/package/ask-cli). The Amazon Skills Kit CLI will help you deploy and test your skill.

`npm install -g ask-cli`.

1. Initialize the cli with `ask init` and follow the instructions to authorize the cli.
1. Edit your `~/.aws/credentials` to pin your region to `us-west-2`. eg: `region=us-west-2`

_The rest of the readme assumes that you are using the `default` profile, otherwise you will need to append `-p|--profile` to your `ask` commands._

Install the [alexa-utterances](https://github.com/alexa-js/alexa-utterances) package. This package helps manage the skill intent utterances. If you need to update or create new utterances update ...

`npm install alexa-utterances --production`

```js
// TODO document how to generate and update the skill.json from an utterance file
```

### python 3

Execute `alexa-vote-skill/hooks/post_new_hook.sh alex-vote-skill true` to create the python virtual environment. _run from one level outside the alexa-vote-skill directory_

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

Use the `ask` cli to deploy your skill. `ask deploy`

_You may need to use the `-f|--force` option._

Update the `apis.custom.endpoint.uri` in `skill.json` to the generated ngrok https url.

If you want to use a lambda function, replace the `apis.custom.endpoint` with

```json
"uri": "ask-voting-assistant-dev-{your-name}",
"sourceDir": "lambda/py"
```

### testing

#### ask-cli

The `ask` cli has a `simulate` and `dialog` method for testing this skill. Ask dialog will open a REPL that you can interact with your alexa skill.

`ask dialag -l en-us`

There are pregenerated converstaion paths in the `/recordings` folder. These speed up the development process.

`ask dialog -r recordings/launch.json`

#### alexa developer console

Login to the [alexa console](https://developer.amazon.com/alexa/console/ask).

Click on this skill to view and edit the settings.

Click on the `Test` menu item and enable skill testing in `Development`.

Speak or type `alexa open utah voting assistant` into the Alexa Simulator.

### documetation

[Flask-Ask: A New Python Framework for Rapid Alexa Skills Kit Development](https://developer.amazon.com/blogs/post/Tx14R0IYYGH3SKT/Flask-Ask-A-New-Python-Framework-for-Rapid-Alexa-Skills-Kit-Development)

### Links

- [alexa developer console](https://developer.amazon.com/alexa/console)
- [developer forums](https://forums.developer.amazon.com)
- [alexa skill kit sdk for python](https://alexa-skills-kit-python-sdk.readthedocs.io/en/latest/)
- [Designing for voice guidelines](https://developer.amazon.com/docs/alexa-design/design-voice.html)
- [Utterance docs](https://developer.amazon.com/docs/custom-skills/create-intents-utterances-and-slots.html)
- [Utterance generator](https://github.com/alexa-js/alexa-utterances#readme)
- [Conversation flow diagram](https://docs.google.com/document/d/1TLqm82sRaVhT0VZiNSkF7g0l6N9Du89rHg-WZMqT2m0/)
