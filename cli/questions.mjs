'use strict';

import inquirer from 'inquirer';
import { getNameFromConfig } from './util.mjs';

export const entries = {
  bootstrap: 'I just cloned and I want to set things up!',
  lambda: 'I want to deploy to lambda!',
  ngrok: 'I want to use ngrok and test locally.',
  tags: 'I created a lambda function and it needs tags.',
  utterances: 'I edited the utterances and I need to regenerate them.',
  recordings: 'I have a skill id and need to update my recordings.'
};

export const questions = [{
  type: 'list',
  message: 'What do you want to do?',
  name: 'entry',
  choices: [{
    name: entries.ngrok
  }, {
    name: entries.lambda
  }, {
    name: entries.utterances
  }, {
    name: entries.recordings
  }, {
    name: entries.tags
  }, {
    name: entries.bootstrap
  }]
}];


export const getBootstrapAnswers = async (intitial) => {
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

export const getTagAnswers = async () => {
  return inquirer.prompt([{
    type: 'confirm',
    message: 'do you have the aws cli on your path? (This is different from the ask-cli)',
    name: 'aws'
  }, {
    type: 'input',
    name: 'contact',
    message: 'What is your name if DTS needs to contact you',
    when: (has) => has.aws
  }, {
    type: 'confirm',
    name: 'browser',
    message: 'Would you like to do it from the browser?',
    when: (has) => !has.aws
  }]);
};

export const getRecordingAnswer = async () => {
  return await inquirer.prompt([{
    type: 'input',
    name: 'skillId',
    message: 'What is your skill id? eg: amzn1.ask.skill.'
  }]);
};

export const okPrompt = async (text) => {
  return await inquirer.prompt([{
    type: 'confirm',
    message: text,
    name: 'confirm'
  }]);
};

export const getFirstAnswers = async () => inquirer.prompt(questions);
