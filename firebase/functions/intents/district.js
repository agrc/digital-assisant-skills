const { context, lifespan } = require('../config/config');
const { requestLocation } = require('../intents/location')

module.exports = {
  'what is my district': (conv) => {
    console.log('INTENT: what is my district');

    conv.contexts.set(context.FROM, lifespan.ONCE, {
      intent: 'district'
    });

    return requestLocation(conv, 'To find your district');
  }
};
