'use strict';

const { dialogflow, BasicCard, Button, Image, Suggestions } = require('actions-on-google');
const { districtIntent } = require('./intents/district');
const { howManyLegislatorsIntent, partyStatisticsIntent, representMeIntent, legislatorDetailIntent } = require('./intents/legislature');
const { locationReceivedIntent } = require('./intents/location');
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

app.intent('specific legislator details', (conv) => {
  console.log('INTENT: specific legislator details');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'legislator-details'
  });

  return requestLocation(conv, 'To find details about your elected official');
});

app.intent('help me', (conv) => {
  conv.ask('I can find out your legislative district, who your legislators are, how many, when the sessions are. Just ask!');

  return conv.ask(new Suggestions([
    'What is my district',
    'How many legislators',
    'How many democrats',
    'When is the session'
  ]));
});

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
  representMeIntent
);

module.exports = app;
