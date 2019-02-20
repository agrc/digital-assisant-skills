'use strict';

import { loadJsonFromFile, saveJsonToFile, getNameFromConfig } from './util.mjs';
import { okPrompt } from './questions.mjs';
import chalk from 'chalk';
import fs from 'fs';

export default async (answers, paths, firstRun) => {
  const data = fs.readFileSync(paths.skillConfigTemplate);
  let skill = JSON.parse(data.toString());

  const endpoint = skill.manifest.apis.custom.endpoint;
  const modified = {
    uri: answers.uri
  };

  if (firstRun) {
    skill.manifest.publishingInformation.locales['en-US'].name = answers.uri;
  } else {
    skill.manifest.publishingInformation.locales['en-US'].name = getNameFromConfig(paths.askConfig);
  }

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
    settings = loadJsonFromFile(paths.askConfigTemplate);

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

  answers = await okPrompt('Is it ok to apply this to your skill.json?');

  if (answers.confirm) {
    skill.manifest.apis.custom.endpoint = modified;

    saveJsonToFile(paths.skillConfig, skill);

    if (dirtyConfig) {
      saveJsonToFile(paths.askConfig, settings);
    }
  }
};
