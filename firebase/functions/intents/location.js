'use strict';

const { Permission, Suggestions } = require('actions-on-google');
const routeRequest = require('./router');

exports.requestLocation = (conv, text) => {
  return conv.ask(new Permission({
    context: text,
    permissions: ['DEVICE_PRECISE_LOCATION']
  }));
};

exports.locationReceivedIntent = {
  'location.got': (conv, _, confirmationGranted) => {
    console.log('INTENT: location received');

    const { location } = conv.device;

    if (!confirmationGranted || !location) {
      conv.ask(new Suggestions([
        'How many legislators',
        'How many democrats',
        'When is the session'
      ]));

      return conv.ask('Ok, well I can answer other questions without your location. Or you can tell me a Utah address.')
    }

    return routeRequest(conv);
  }
};
