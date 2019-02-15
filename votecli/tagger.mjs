'use strict';

import { execSync } from 'child_process';
import { loadJsonFromFile } from './util.mjs';
import opn from 'opn';
import chalk from 'chalk';

export default async (answers, paths) => {
  const data = loadJsonFromFile(paths.askConfig);
  const { functionName, arn } = data.deploy_settings.default.resources.lambda[0];
  const options = {
    ELCID: 'ITAGRC-2019',
    DEPT: 'AGR',
    CONTACT: '{Your Name}',
    APP: 'Alexa Voting Assistant',
    ENV: 'DEV',
    SECURITY: 'TBD',
    SUPPORTCODE: 'TBD'
  };

  if (answers.browser) {
    console.log(chalk.yellow('opening browser...'));
    const baseUrl = 'https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions';

    console.log(chalk.cyan('Here are the tags you need to fill out:'));
    console.log(options);

    await opn(`${baseUrl}/${functionName}`, {
      wait: false
    });
  } else if (answers.contact) {
    options.CONTACT = answers.contact;
    const values = Object.keys(options)
      .reduce((previous, key) => `${previous}${key}="${options[key]}",`, '')
      .slice(0, -1);
    const command = `aws lambda tag-resource --resource ${arn} --tags ` + values;

    try {
      const millisecondsInSecond = 1000;
      const seconds = 5;
      execSync(command, {
        timeout: millisecondsInSecond * seconds
      });
      console.log(chalk.blue('tags updated'));
    } catch (error) {
      console.log(chalk.red('well that did not work.'));
      throw error;
    }
  } else {
    console.log('how did I get here?');

    return;
  }
};
