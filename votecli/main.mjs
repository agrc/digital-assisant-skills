'use strict';

import { getFirstAnswers, getTagAnswers, getBootstrapAnswers, getRecordingAnswer, entries } from './questions.mjs';
import chalk from 'chalk';
import path from 'path';
import tagger from './tagger.mjs';
import templator from './templator.mjs';
import recordings from './recordings.mjs';
import url from 'url';

const currentFilePath = import.meta.url;
const basePath = path.dirname(url.fileURLToPath(currentFilePath));

const filePaths = {
  askConfig: path.resolve(basePath, '..', '.ask', 'config'),
  askConfigTemplate: path.resolve(basePath, '..', '.ask', 'config.template'),
  skillConfig: path.resolve(basePath, '..', 'skill.json'),
  skillConfigTemplate: path.resolve(basePath, '..', 'skill.template.json'),
  recordings: path.resolve(basePath, '..', 'recordings')
};

(async () => {
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
  } else if (answers.entry === entries.recordings) {
    answers = await getRecordingAnswer();
    recordings(filePaths.recordings, answers);
  }

  if (answers.route === 'skill.json') {
   await templator(answers, filePaths, firstRun);
  }

  console.log(chalk.green.bold('all set.'));
})();
