'use strict';
const agrc = require('../services/agrc');
const routeRequest = require('./router');
const contextConfig = require('../config/config');

module.exports = {
  'address.get': (conv) => {
    console.log('INTENT: get address');

    conv.contexts.delete(contextConfig.context.GEOCODING);

    return conv.ask('Ok what is the address?');
  },
  'address.got': (conv, params) => {
    console.log('INTENT: got address');

    let addressParts = {};
    let inputAddress = params.location;
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
      return conv.ask('and the street address?');
    }

    if (!addressParts['zip-code'] && !addressParts.city && !addressParts['subadmin-area']) {
      return conv.ask('and the city or zip code?');
    }

    // TODO: ask for confirmation?
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