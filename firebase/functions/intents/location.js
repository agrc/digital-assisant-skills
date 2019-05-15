'use strict';

const { Permission, Suggestions } = require('actions-on-google');
const routeRequest = require('./router');

exports.requestLocation = async (conv, text) => {
  console.log('location.requestLocation');
  console.log(conv.user);


  if (conv.user.storage.location) {
    console.log('user has location, skipping');

    return await routeRequest(conv);
  }

  return conv.ask(new Permission({
    context: text,
    permissions: ['DEVICE_PRECISE_LOCATION']
  }));
};

exports.locationReceivedIntent = {
  'location.got': async (conv, _, confirmationGranted) => {
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

    conv.user.storage.location = location.coordinates;

    console.log(conv.user);

    return await routeRequest(conv);
  }
};
