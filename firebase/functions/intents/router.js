'use strict';

const district = require('./district');
const legislature = require('./legislature');
const text = require('../config/text');

module.exports = async (conv) => {
  const where = conv.user.storage.intent;

  console.log(`user.storage.intent: ${where}`);

  switch (where) {
    case 'district': {
      console.log('routing to find districts');

      return await district.findDistricts(conv);
    }
    case 'legislature.mine': {
      console.log('routing to find legislators');

      return await legislature.findLegislators(conv);
    }
    case 'legislator.specific': {
      console.log('routing to specific legislator');

      return await legislature.findSpecificLegislator(conv);
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};
