'use strict';

const { dialogflow } = require('actions-on-google');
const { districtIntent } = require('./intents/district');
const { countIntents, legislatureIntents } = require('./intents/legislature');
const { locationReceivedIntent } = require('./intents/location');
const helpIntent = require('./intents/help');
const sessionItent = require('./intents/session');
const welcomeIntent = require('./intents/welcome');
const addressIntents = require('./intents/address');

const app = dialogflow({ debug: true });

const addIntents = (...args) => {
  for (let i = 0; i < args.length; i++) {
    for (const key in args[i]) {
      if (args[i].hasOwnProperty(key)) app.intent(key, args[i][key]);
    }
  }
};

addIntents(
  welcomeIntent,
  districtIntent,
  locationReceivedIntent,
  countIntents,
  sessionItent,
  legislatureIntents,
  helpIntent,
  addressIntents
);

module.exports = app;
