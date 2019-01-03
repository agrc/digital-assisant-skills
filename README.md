# AGRC Innovation Grant Vote Skill

## Getting Started

### VS Code

We use vs code. If you want to use vs code then great.

Install the recommended extensions from `.vscode/extensions.json`. You can use the command pallet (`cmd`+`shift`+`p`) to search for `Extensions: Show Recommended Extensions`. This will show you `Workspace Recommendations`. Install those and then reload vscode.

### npm

Install the [ask cli](https://www.npmjs.com/package/ask-cli) `npm install -g ask-cli`

Initialize the cli with `ask init` and follow the instructions to authorize the cli.

### python 3

Execute `../alexa-vote-skill/hooks/post_new_hook.sh alex-vote-skill true` to create the python virtual environment. _run from one level outside the alexa-vote-skill directory_

To activate the virtual environment outside of VS Code run `source ./.venv/skill_env/bin/activate`. Use `deactivate` to get out of the virtual environment.

`pip install -r requirements.txt`

_if you run into issues with flask-ask, I had to clone locally, then update the pyyaml version to `3.13`, and finally `pip install ./`._

Use the command pallet to select `Python: Select Interpreter`. Select the python with the `./.venv/skill_env` path. This will generate the following in your `settings.json`.

```json
{
  "python.pythonPath": ".venv/skill_env/bin/python"
}
```

Start the flask server that is acting as a lambda function `python lambda/py/hello_world.py`

### localhost tunnel

For the alexa skill to hit this local project code we must create an https url to our localhost.

Start ngrok: `./dev/ngrok http 5000` to access port 5000 of the local flask server from anywhere.

You can install [ngrok](https://dashboard.ngrok.com/get-started) if you need a version other than the bundled osx version. Follow the instructions to connect and use ngrok.

### alexa

Create an [empty skill](https://developer.amazon.com/alexa/console/ask) to get the skill id.

Replace the `deploy_settings.default.skill_id` in `.ask/config` with your new skills id. _You will get 401 unauthorized requests if you forget this piece._

Update the `apis.custom.endpoint.uri` in `skill.json` to your ngrok https url.

Use the command pallet to update the skill with this projects settings:

- `ASK: Deploy the skill manifest` or `ask deploy --profile "default" --target "skill"` -f
- `ASK: Deploy the interaction models` or `ask deploy --profile "default" --target "model"` -f

_You may need to use the `-f` flag to force update the skill._

### testing

Login to the [alexa console](https://developer.amazon.com/alexa/console/ask).

Click on this skill to view and edit the settings.

Click on the `Test` menu item and enable skill testing in `Development`.

Speak or type `alexa open utah voting assistant` into the Alexa Simulator.
