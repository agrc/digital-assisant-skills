'use strict';

const { BasicCard, Button, Image, Suggestions } = require('actions-on-google');
const text = require('../config/text');

module.exports = {
  'default.welcome': (conv) => {
    console.log(conv.user);

    if (conv.user.last.seen) {
      conv.ask('Welcome back! What would you like to learn today?');
    } else {
      conv.ask(text.WELCOME);

      conv.ask(new BasicCard({
        text: text.WELCOME,
        title: 'Utah Voting Information',
        subtitle: 'Innovation Grant',
        buttons: new Button({
          title: 'Developer Docs',
          url: 'https://github.com/agrc/digital-assistant-skills/',
        }),
        image: new Image({
          url: 'https://vote.utah.gov/images/header/header-seal.png',
          alt: 'vote logo',
        })
      }));
    }

    return conv.ask(new Suggestions([
      'What is my district',
      'Who represents me',
      'My Senator',
      'How many legislators',
      'How many democrats',
      'When is the session'
    ]));
  }
};
