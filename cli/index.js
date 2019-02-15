'use strict';
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const askConfig = path.join(__dirname, '..', '.ask', 'config');
const askConfigTemplate = path.join(__dirname, '..', '.ask', 'config.template');
const skillConfig = path.join(__dirname, '..', 'skill.json');
const skillConfigTemplate = path.join(__dirname, '..', 'skill.template.json');

const bootstrap = 'I just cloned and I want to set things up!';
const ngrok = 'I want to use ngrok and test locally.';
const lambda = 'I want to deploy to lambda!';
const utterances = 'I edited the utterances and I need to regenerate them.';


const questions = [{
  type: 'list',
  message: 'What do you want to do?',
  name: 'entry',
  choices: [{
    name: ngrok
  }, {
    name: lambda
  }, {
    name: utterances
  }, {
    name: bootstrap
  }]
}];

const loadJsonFromFile = (filePath) => {
  const data = fs.readFileSync(filePath);

  return JSON.parse(data);
};

const saveJsonToFile = (filePath, object) => {
  fs.writeFile(filePath, JSON.stringify(object, null, '  ') + '\n', (err) => {
    if (err) {
      throw err;
    }
  });
};

const getNameFromConfig = () => {
  let stats;
  try {
    stats = fs.statSync(askConfig);
  } catch (error) {
    return 'ask-voting-assistant-dev-{name}';
  }

  if (!stats.isFile()) {
    return 'ask-voting-assistant-dev-{name}';
  }

  const config = loadJsonFromFile(askConfig);
  const lambdaMetadata = config.deploy_settings.default.resources.lambda;

  if (lambdaMetadata.length > 0) {
    return lambdaMetadata[0].functionName;
  }
};

const bootstrapRoute = async (intitial) => {
  let answers = {
    deploymentLocation: null
  };

  if (intitial === 'lambda') {
    answers.deployLocation = 'lambda';
  } else if (intitial === 'ngrok') {
    answers.deployLocation = 'ngrok';
  } else {
    answers = await inquirer.prompt([{
      type: 'list',
      message: 'ok, lambda or local dev?',
      name: 'deployLocation',
      choices: [{
        name: 'lambda'
      }, {
        name: 'flask'
      }]
    }]);
  }

  if (answers.deployLocation === 'lambda') {
    answers = await inquirer.prompt([{
      type: 'input',
      name: 'uri',
      message: 'what is your lambda function name',
      default: getNameFromConfig()
    }, {
      type: 'confirm',
      name: 'skill',
      message: 'Do you have a skill identifier already?'
    }, {
      type: 'input',
      name: 'skillId',
      message: 'What is your skill id? eg: amzn1.ask.skill.',
      when: (has) => has.skill
    }]);

    answers.type = 'lambda';
  } else {
    answers = await inquirer.prompt([{
      type: 'input',
      name: 'uri',
      message: 'what is your ngrok https url?'
    }]);

    answers.type = 'ngrok';
  }

  answers.route = 'skill.json';

  return answers;
};

const main = async () => {
  let answers = await inquirer.prompt(questions);
  let firstRun = false;

  if (answers.entry === bootstrap) {
    answers = await bootstrapRoute();
    firstRun = true;
  } else if (answers.entry === ngrok) {
    answers = await bootstrapRoute('ngrok');
  } else if (answers.entry === lambda) {
    answers = await bootstrapRoute('lambda');
  } else if (answers.entry === utterances) {
    console.log('generating utterances');
  }

  if (answers.route === 'skill.json') {
    const data = fs.readFileSync(skillConfigTemplate);
    let skill = JSON.parse(data.toString());

    const endpoint = skill.manifest.apis.custom.endpoint;
    const modified = {
      uri: answers.uri
    };

    if (answers.type === 'ngrok') {
      modified.sslCertificateType = 'Wildcard';
    } else if (answers.type === 'lambda') {
      modified.sourceDir = 'lambda/py';
    } else {
      console.log('unknown request, exiting.');

      return;
    }

    console.log(`
${chalk.red.bold('current skill.json modification')}
${JSON.stringify(endpoint, null, '  ')}

${chalk.green.bold('Proposed skill.json modification')}
${JSON.stringify(modified, null, '  ')}
`);

    let settings;
    let dirtyConfig = false;
    if (firstRun) {
      settings = loadJsonFromFile(askConfigTemplate);

      if (answers.type === 'lambda') {
        settings.deploy_settings.default.resources.lambda[0].functionName = answers.uri;
        dirtyConfig = true;
      }

      if (answers.skillId) {
        // eslint-disable-next-line camelcase
        settings.deploy_settings.default.skill_id = answers.skillId;
        dirtyConfig = true;
      }
    }

    answers = await inquirer.prompt([{
      type: 'confirm',
      message: 'Is it ok to apply this to your skill.json?',
      name: 'confirm'
    }]);

    if (answers.confirm) {
      skill.manifest.apis.custom.endpoint = modified;

      saveJsonToFile(skillConfig, skill);

      if (dirtyConfig) {
        saveJsonToFile(askConfig, settings);
      }
    }
  }

  console.log(JSON.stringify(answers, null, '  '));
  console.log(chalk.green.bold('all set.'));
};

main();
