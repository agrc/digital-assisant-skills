'use strict';

const { dialogflow, BasicCard, Button, Image, Suggestions } = require('actions-on-google');
const { districtIntent } = require('./intents/district');
const { howManyLegislatorsIntent, partyStatisticsIntent, representMeIntent, legislatorDetailIntent } = require('./intents/legislature');
const { locationReceivedIntent } = require('./intents/location');
const helpIntent = require('./intents/help');
const sessionItent = require('./intents/session');
const text = require('./config/text');

const app = dialogflow({ debug: true });

const addIntents = (...args) => {
  for (let i = 0; i < args.length; i++) {
    for (const key in args[i]) {
      if (args[i].hasOwnProperty(key)) app.intent(key, args[i][key]);
    }
  }
};

app.intent('Default Welcome Intent', (conv) => {
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

  return conv.ask(new Suggestions([
    'What is my district',
    // 'Who represents me',
    // 'Representative details',
    'How many legislators',
    'How many democrats',
    'When is the session'
  ]));
});

addIntents(
  districtIntent,
  locationReceivedIntent,
  howManyLegislatorsIntent,
  partyStatisticsIntent,
  sessionItent,
  representMeIntent,
  legislatorDetailIntent,
  helpIntent
);

module.exports = app;
