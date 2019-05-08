'use strict';

const { dialogflow, Permission } = require('actions-on-google');
const text = require('./config/text');
const { search } = require('./services/agrc');
const leCache = require('./mock_data/legislators_endpoint.json');

const app = dialogflow({ debug: true });

const context = {
  FROM: 'what-intent',
  SENATE: 'what-senate-district',
  HOUSE: 'what-house-district',
};
const lifespan = {
  ONCE: 1,
  DEFAULT: 5,
  LONG: 100
};

const requestLocation = (conv, text) => {
  const options = {
    context: text,
    // Ask for more than one permission. User can authorize all or none.
    permissions: ['DEVICE_PRECISE_LOCATION'],
  };
  conv.ask(new Permission(options));
};

const getLocation = (conv) => {
  if (!conv.device.location) {
    return false;
  }

  return conv.device.location.coordinates;
};

const getDistricts = (conv) => {
  const data = conv.contexts.get(context.HOUSE);

  if (!data) {
    console.log('missing district context');

    return false;
  }

  console.log('using district context');

  const senate = conv.contexts.get(context.SENATE).parameters.district;
  const house = data.parameters.district;

  return { house, senate };
};
}

const routeRequest = (conv) => {
  const where = conv.contexts.get(context.FROM).parameters.intent;

  console.log(`context.get: ${where}`);

  switch (where) {
    case 'district': {
      console.log('querying district');

      const location = getLocation(conv);
      console.log(location);

      if (!location) {
        return requestLocation(conv, 'To find your district');
      }

      const options = {
        spatialReference: 4326,
        geometry: `point:[${location.longitude},${location.latitude}]`
      };

      return search('sgid10.political.officialslookup', ['repdist', 'sendist'], options).then(result => {
        if (result.message) {
          return conv.ask(result.message);
        }

        const senate = result.senate;
        const house = result.house;

        conv.contexts.set(context.HOUSE, lifespan.LONG, {
          district: house
        });

        conv.contexts.set(context.SENATE, lifespan.LONG, {
          district: senate
        });

        conv.ask(text.DISTRICT.replace('{{house}}', house).replace('{{senate}}', senate));

        return conv.ask(text.DISTRICT_FOLLOW);
      });
    }
    case 'legislature': {
      console.log('querying legislators');

      // get districts
      const districts = getDistricts(conv);
      // if null get location, then get districts
      if (!districts) {
        // use agrc service
      }

      const { house, senate } = districts;

      // query le service for legislators
      const legislators = leCache.legislators;

      const senator = legislators.filter((item) => item.house === 'S' && item.district === senate.toString())[0];
      const representative = legislators.filter((item) => item.house === 'H' && item.district === house.toString())[0];

      conv.contexts.set(context.SENATOR, lifespan.LONG, {
        official: senator
      });

      conv.contexts.set(context.REPRESENTATIVE, lifespan.LONG, {
        official: representative
      });

      const deabbrivate = (partyAbbr) => {
        if (partyAbbr === 'D') {
          return 'democrat'
        }

        if (partyAbbr === 'R') {
          return 'republican'
        }

        return partyAbbr;
      };

      return conv.ask(text.LEGISLATOR
        .replace('{{sen_party}}', deabbrivate(senator.party))
        .replace('{{sen}}', senator.formatName)
        .replace('{{rep}}', representative.formatName)
        .replace('{{rep_party}}', deabbrivate(representative.party))
      );
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};

app.intent('location received', (conv, _, confirmationGranted) => {
  console.log('INTENT: location received');

  const { location } = conv.device;

  if (!confirmationGranted || !location) {
    return conv.ask('Ok, well I can answer other questions without your location');
  }

  return routeRequest(conv);
});

app.intent('what is my district', (conv) => {
  console.log('INTENT: what is my district');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'district'
  });

  return requestLocation(conv, 'To find your district');
});

app.intent('who represents me', (conv) => {
  console.log('INTENT: who represents me');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'legislature'
  });

  return requestLocation(conv, 'To find your elected officials');
});
app.intent('Default Welcome Intent', (conv) => conv.ask(text.WELCOME));

module.exports = app;
