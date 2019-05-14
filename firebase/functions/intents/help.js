'use strict';

const { Suggestions } = require('actions-on-google');
const text = require('../config/text');

module.exports = {
  'default.help': (conv) => {
    conv.ask(text.HELP);

    return conv.ask(new Suggestions([
      'What is my district',
      'How many legislators',
      'How many democrats',
      'When is the session'
    ]));
  }
};
