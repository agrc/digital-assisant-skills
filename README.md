# AGRC Innovation Grant Vote Skill

## Getting Started

### Virtual Environment

For VS Code to find and activate the python virtual environment for this project, add the following to your workspace or user settings. I prefer the user settings so the setting is applied to all projects.

```json
"python.venvFolders": [
    "${rootPath}",
    "envs",
    ".pyenv",
    ".direnv",
    ".venv"
  ]
```

Install the `Python extension for Visual Studio Code` and the `ask-toolkit.alexa-skills-kit-toolkit`

Use the `Python: Select Interpreter` to then select the `skill_env` environment.

```json
{
  "python.pythonPath": ".venv/skill_env/bin/python"
}
```

To activate the virtual environment outside of VS Code run `source .venv\skill_env\bin\activate`. Use `deactivate` to get out of the virtual environment.

To install flask-ask I had to clone locally, update the pyyaml version to `3.13`, then `pip install ./`.

## Development Setup

Install the [ask cli](https://www.npmjs.com/package/ask-cli) `npm install -g ask-cli`

Initialize the cli `ask init`

Deploy this skill and model. _update your profile to whatever is applicable for your setup._

`ask deploy --profile "default" --target "skill"`
`ask deploy --profile "default" --target "model"`

Install [ngrok](https://dashboard.ngrok.com/get-started) to create a secure tunnel to localhost that amazon can access. Follow the instructions to connect and use ngrok.

Start ngrok: `./ngrok http 5000` to access port 5000 from the local flask server.

Run `ask: deploy interaction model`

Copy the `https` url from ngrok to the endpoint tab of the [alexa developer console](https://developer.amazon.com/alexa/console/ask). Using the Service endpoint type of `HTTPS` in the `Default Region` with `My development is a sub-domain of a domain that has...` which is a wildcard certificate.
