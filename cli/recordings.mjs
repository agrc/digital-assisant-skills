'use strict';

import fs from 'fs';
import path from 'path';
import { loadJsonFromFile, saveJsonToFile } from './util.mjs';

export default (paths, answers) => {
  const files = fs.readdirSync(paths);
  try {
    files.forEach(file => {
      if (path.extname(file) === '.json') {
        return;
      }

      const template = path.join(paths, file);
      console.log(`updating ${file}`);
      const data = loadJsonFromFile(template);
      data.skillId = answers.skillId;
      const name = path.basename(file, '.template');
      const recording = path.join(paths, name + '.json');
      saveJsonToFile(recording, data);
    });
  } catch (err) {
    console.warn('wat' + err);
  }
};
