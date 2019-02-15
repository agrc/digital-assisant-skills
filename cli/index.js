'use strict';

import { chalk } from 'chalk';
import { path } from 'path';
import { getFirstAnswers, getTagAnswers, getBootstrapAnswers, entries } from './questions';
import tagger from './tagger';
import templator from './templator';

const filePaths = {
  askConfig: path.join(__dirname, '..', '.ask', 'config'),
  askConfigTemplate: path.join(__dirname, '..', '.ask', 'config.template'),
  skillConfig: path.join(__dirname, '..', 'skill.json'),
  skillConfigTemplate: path.join(__dirname, '..', 'skill.template.json')
};

const main = async () => {
  let answers = await getFirstAnswers();
  let firstRun = false;

  if (answers.entry === entries.bootstrap) {
    answers = await getBootstrapAnswers();
    firstRun = true;
  } else if (answers.entry === entries.ngrok) {
    answers = await getBootstrapAnswers('ngrok');
  } else if (answers.entry === entries.lambda) {
    answers = await getBootstrapAnswers('lambda');
  } else if (answers.entry === entries.utterances) {
    console.log('generating utterances');
  } else if (answers.entry === entries.tags) {
    answers = await getTagAnswers();

    await tagger(answers, filePaths);
  }

  if (answers.route === 'skill.json') {
    templator(answers, filePaths, firstRun);
  }

  console.log(chalk.green.bold('all set.'));
};

main();
