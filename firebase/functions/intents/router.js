'use strict';

const district = require('./district');
const legislature = require('./legislature');
const text = require('../config/text');

module.exports = (conv) => {
  const where = conv.user.storage.intent;

  console.log(`user.storage.intent: ${where}`);

  switch (where) {
    case 'district': {
      console.log('routing to find districts');

      return district.findDistricts(conv);
    }
    case 'legislature.mine': {
      console.log('routing to find legislators');

      return legislature.findLegislators(conv);
    }
    case 'legislator.specific': {
      console.log('routing to specific legislator');

      return legislature.findSpecificLegislator(conv);
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};
