'use strict';

const { dialogflow, Permission } = require('actions-on-google');
const text = require('./config/text');
const { search } = require('./services/agrc');

const app = dialogflow({ debug: true });

const context = {
  FROM: 'what-intent',
  LOCATION: 'where-am-i'
};
const lifespan = {
  ONCE: 1,
  DEFAULT: 5,
  LONG: 100
};

var requestLocation = (conv, text) => {
  const options = {
    context: text,
    // Ask for more than one permission. User can authorize all or none.
    permissions: ['DEVICE_PRECISE_LOCATION'],
  };
  conv.ask(new Permission(options));
};

var routeRequest = (conv) => {
  const where = conv.contexts.get(context.FROM).parameters.intent;

  console.log(`context.get: ${where}`);

  switch (where) {
    case 'district': {
      console.log('querying district');
      const options = {
        spatialReference: 4326,
        geometry: `point:[${location.coordinates.longitude},${location.coordinates.latitude}]`
      };

      return search('sgid10.political.officialslookup', ['repdist', 'sendist'], options).then(result => {
        if (result.message) {
          return conv.ask(result.message);
        }

        const senate = result.senate;
        const house = result.house;

        console.log('returning result');
        conv.ask(text.DISTRICT.replace('{{house}}', house).replace('{{senate}}', senate));

        return conv.ask(text.DISTRICT_FOLLOW);
      });
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};

app.intent('location received', (conv, _, confirmationGranted) => {
  const { location } = conv.device;

  if (!confirmationGranted || !location) {
    return conv.ask('Ok, well I can answer other questions without your location');
  }

  conv.contexts.set(context.LOCATION, lifespan.LONG, {
    location: location.coordinates
  });

  return routeRequest(conv);
});

app.intent('what is my district', (conv) => {
  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'district'
  });

  return requestLocation(conv, 'To find your district');
});

app.intent('Default Welcome Intent', (conv) => conv.ask(text.WELCOME));

module.exports = app;
