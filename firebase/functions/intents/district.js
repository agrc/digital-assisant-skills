'use strict';

const { Table, Suggestions } = require('actions-on-google');
const { context, lifespan } = require('../config/config');
const agrc = require('../services/agrc');
const contextHelper = require('../context')
const location = require('./location');
const text = require('../config/text');

exports.findDistricts = (conv) => {
  console.log('district.findDistricts');

  const location = contextHelper.getLocation(conv);
  console.log(location);

  if (!location) {
    return location.requestLocation(conv, 'To find your district');
  }

  const options = {
    spatialReference: 4326,
    geometry: `point:[${location.longitude},${location.latitude}]`
  };

  return agrc.search('sgid10.political.officialslookup', ['repdist', 'sendist'], options)
    .then(result => {
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

      conv.ask(text.DISTRICT
        .replace('{{house}}', house)
        .replace('{{senate}}', senate));

      conv.ask(new Table({
        title: 'Your districts',
        columns: [{
          header: 'Senate District',
          align: 'CENTER'
        }, {
          header: 'House District',
          align: 'CENTER'
        }],
        rows: [[senate.toString(), house.toString()]]
      }));

      conv.ask(new Suggestions([
        'Who represents me'
      ]));

      return conv.ask(text.DISTRICT_FOLLOW);
    });
};

exports.districtIntent = {
  'what is my district': (conv) => {
    console.log('INTENT: what is my district');

    conv.contexts.set(context.FROM, lifespan.ONCE, {
      intent: 'district'
    });

    return location.requestLocation(conv, 'To find your district');
  }
};
