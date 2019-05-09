const { Permission } = require('actions-on-google');
const routeRequest = require('./router');

exports.requestLocation = (conv, text) => {
  return conv.ask(new Permission({
    context: text,
    permissions: ['DEVICE_PRECISE_LOCATION']
  }));
};

exports.locationReceivedIntent = {
  'location received': (conv, _, confirmationGranted) => {
    console.log('INTENT: location received');

    const { location } = conv.device;

    if (!confirmationGranted || !location) {
      // TODO: ask for address...
      return conv.ask('Ok, well I can answer other questions without your location');
    }

    return routeRequest(conv);
  }
};
