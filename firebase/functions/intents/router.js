'use strict';

const { context } = require('../config/config');
const district = require('./district');
const legislature = require('./legislature');
const text = require('../config/text');

module.exports = (conv) => {
  const where = conv.contexts.get(context.FROM).parameters.intent;

  console.log(`context.get: ${where}`);

  switch (where) {
    case 'district': {
      console.log('routing to find districts');

      return district.findDistricts(conv);
    }
    case 'legislature': {
      console.log('routing to find legislators');

      return legislature.findLegislators(conv);
    }
    case 'legislator-details': {
      console.log('routing to specific legislator');

      return legislature.findSpecificLegislator(conv);
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};
