'use strict';

import { getFirstAnswers, getTagAnswers, getBootstrapAnswers, getRecordingAnswer, entries } from './questions.mjs';
import chalk from 'chalk';
import path from 'path';
import tagger from './tagger.mjs';
import templator from './templator.mjs';
import recordings from './recordings.mjs';
import url from 'url';
import { generateSamples } from './utter.mjs';
import model from './model.mjs';

const currentFilePath = import.meta.url;
const basePath = path.dirname(url.fileURLToPath(currentFilePath));

const filePaths = {
  askConfig: path.resolve(basePath, '..', '.ask', 'config'),
  askConfigTemplate: path.resolve(basePath, '..', '.ask', 'config.template'),
  skillConfig: path.resolve(basePath, '..', 'skill.json'),
  skillConfigTemplate: path.resolve(basePath, '..', 'skill.template.json'),
  recordings: path.resolve(basePath, '..', 'recordings'),
  model: path.resolve(basePath, '..', 'models', 'en-US.json')
};

(async () => {
  let answers = await getFirstAnswers();
  let firstRun = false;

  switch (answers.entry) {
    case entries.bootstrap:
      answers = await getBootstrapAnswers();
      firstRun = true;

      break;
    case entries.ngrok:
      answers = await getBootstrapAnswers('ngrok');

      break;
    case entries.lambda:
      answers = await getBootstrapAnswers('lambda');

      break;
    case entries.utterances:
      const samples = generateSamples(model);

      updateModelSamples(filePaths, samples);

      break;
    case entries.tags:
      answers = await getTagAnswers();

      await tagger(answers, filePaths);

      break;

    case entries.recordings:
      answers = await getRecordingAnswer();

      recordings(filePaths.recordings, answers);

      break;

    default:
      break;
  }

  if (answers.route === 'skill.json') {
   await templator(answers, filePaths, firstRun);
  }

  console.log(chalk.green.bold('all set.'));
})();
