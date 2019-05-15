'use strict';
const agrc = require('../services/agrc');
const routeRequest = require('./router');
const util = require('../util');

module.exports = {
  'address.get': (conv) => {
    console.log('INTENT: get address');

    conv.user.storage.addressParts = null;

    return conv.ask('Ok what is the address?');
  },
  'address.got': async (conv, { location: inputAddress }) => {
    console.log('INTENT: got address');

    if (conv.user.storage.location) {
      return await routeRequest(conv);
    }

    let addressParts = {};
    const parts = conv.user.storage.addressParts;

    if (parts) {
      addressParts = merge(parts, inputAddress);
    } else {
      addressParts = inputAddress;
    }

    console.log('merged object:');
    console.log(addressParts);

    conv.user.storage.addressParts = addressParts;

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


    const zone = addressParts.city || addressParts['zip-code'] || addressParts['subadmin-area'];

    conv.ask(`looking for ${addressParts['street-address']}, ${zone}...`);

    const result = await agrc.geocode({
      street: addressParts['street-address'],
      zone: zone,
      spatialReference: 4326
    });

    conv.user.storage.location = result;

    return await routeRequest(conv);
  }
};

const merge = (a, b) => {
  const merged = {};

  if (a) {
    Object.keys(a).forEach((key) => {
      if (!a[key] || a[key] === 0) {
        return;
      }

      merged[key] = a[key];
    });
  }

  if (b) {
    Object.keys(b).forEach((key) => {
      if (!b[key] || b[key] === 0) {
        return;
      }

      merged[key] = b[key];
    });
  }

  return merged;
};
