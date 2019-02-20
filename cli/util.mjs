'use strict';

import fs from 'fs';

export const loadJsonFromFile = (filePath) => {
  const data = fs.readFileSync(filePath);

  return JSON.parse(data);
};

export const saveJsonToFile = (filePath, object) => {
  fs.writeFile(filePath, JSON.stringify(object, null, '  ') + '\n', (err) => {
    if (err) {
      throw err;
    }
  });
};

export const getNameFromConfig = (askConfig) => {
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

export const getSkillIdFromConfig = (askConfig) => {
  let stats;
  try {
    stats = fs.statSync(askConfig);
  } catch (error) {
    return 'amzn1.ask.skill.';
  }

  if (!stats.isFile()) {
    return 'amzn1.ask.skill.';
  }

  const config = loadJsonFromFile(askConfig);

  return config.deploy_settings.default.skill_id;
};

export const updateModelSamples = (filePath, model) => {
  const currentModel = loadJsonFromFile(filePath.model);
  const intents = currentModel.interactionModel.languageModel.intents;
  const lookup = {};

  intents.forEach((item, count) => {
    lookup[item.name] = count;
  });

  console.log('updating model samples...');
  model.forEach(intent => {
    const index = lookup[intent.intent];
    intents[index].samples = intent.samples;
  });

  saveJsonToFile(filePath.model, currentModel);
};
