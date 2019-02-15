var utterances = require('alexa-utterances');

var intents = [{
  intent: 'DistrictIntent',
  dictionary: {
    branch: ['senate', 'house', 'senator', 'senators', 'representative', 'representatives'],
    branches: ['senate', 'house']
  },
  slots: {
  },
  templates: [
    'what {is|are} my {branch|BRANCH}{ political|} district',
    'what {branch |BRANCHES} district {am I in|is mine}'
  ]
}, {
  intent: 'ElectedOfficialsIntent',
  dictionary: {},
  slots: {
    house: 'HOUSE_TYPES'
  },
  templates: [
    'who represents {me|us|my family}',
    'who {is|are} {my|our} {-house}',
    '{my|our} {-house}'
  ]
}];
