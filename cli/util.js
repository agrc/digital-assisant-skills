'use strict';

import { fs } from 'fs';

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
