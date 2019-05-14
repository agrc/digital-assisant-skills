'use strict';
const agrc = require('../services/agrc');
const routeRequest = require('./router');
const contextConfig = require('../config/config');
const util = require('../util');

module.exports = {
  'address.get': (conv) => {
    console.log('INTENT: get address');

    conv.contexts.delete(contextConfig.context.GEOCODING);

    return conv.ask('Ok what is the address?');
  },
  'address.got': (conv, { location: inputAddress }) => {
    console.log('INTENT: got address');
    // TODO: Should we be using Place and formattedAddress?
    // const { Place } = require('actions-on-google');
    // app.intent('ask_for_place_detail', (conv) => {
    //   const options = {
    //     context: 'To find your legislator',
    //     prompt: 'What is your address?',
    //   };
    //   conv.ask(new Place(options));
    // });

    let addressParts = {};
    const context = conv.contexts.get(contextConfig.context.GEOCODING);

    if (context && 'parameters' in context) {
      console.log('reading context');
      const contextParts = context.parameters.parts;

      console.log('context.location:');
      console.log(contextParts);

      addressParts = merge(contextParts, inputAddress);
    } else {
      addressParts = inputAddress;
    }

    console.log('merged object:');
    console.log(addressParts);

    conv.contexts.set(contextConfig.context.GEOCODING, contextConfig.lifespan.LONG, {
      parts: addressParts
    });

    if (!addressParts['street-address']) {
      return conv.ask(util.randomize(
        'and the street address?',
        'What was the street address?',
        'How about the street address?',
        'I\'ll just need the street'
      ));
    }

    if (!addressParts['zip-code'] && !addressParts.city && !addressParts['subadmin-area']) {
      return conv.ask(util.randomize(
        'and the city or zip code?',
        'What was the city?',
        'What was the zip code?',
        'How about the city?',
        'How about the zip code?',
        'I\'ll just need the city or zip code'
      ));
    }

    // TODO: ask for confirmation?
    // https://developers.google.com/actions/assistant/helpers
    // TODO: read zip code as <say-as interpret-as="digits"></say-as>
    // https://developers.google.com/actions/reference/ssml
    // conv.ask(`Should I look for ${addressParts['street-address']}, ${zone}?`);

    const zone = addressParts.city || addressParts['zip-code'] || addressParts['subadmin-area'];
    return agrc.geocode({
      street: addressParts['street-address'],
      zone: zone,
      spatialReference: 4326
    }).then((result) => {
      conv.contexts.set(contextConfig.context.GEOCODED, contextConfig.lifespan.LONG, {
        point: result
      });

      return routeRequest(conv);
    });
  }
};

const merge = (a, b) => {
  const merged = {};

  if (a) {
    Object.keys(a).forEach((key) => {
      console.log(`a key - ${key}: ${a[key]}`);
      if (!a[key] || a[key] === 0) {
        console.log('skipping');

        return;
      }

      console.log(`adding ${a[key]} to merged`);
      merged[key] = a[key];
    });
  }

  if (b) {
    Object.keys(b).forEach((key) => {
      console.log(`b key - ${key}: ${b[key]}`);
      if (!b[key] || b[key] === 0) {
        console.log('skipping');

        return;
      }

      console.log(`adding ${b[key]} to merged`);
      merged[key] = b[key];
    });
  }

  return merged;
};
