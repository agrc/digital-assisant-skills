export default [{
  intent: 'DistrictIntent',
  dictionary: {
    branch: ['senate', 'house', 'senator', 'senators', 'representative', 'representatives'],
    branches: ['senate', 'house']
  },
  slots: {},
  templates: [
    'what {is|are} my {branch}{ political|} district',
    'what {branch} district {am I in|is mine}'
  ]
}, {
  intent: 'ElectedOfficialsIntent',
  dictionary: {},
  slots: {
    house: 'HOUSE_TYPES'
  },
  templates: [
    'who represents {me|us|my family}',
    'who {is|are} {my|our} {state |}{-|house}',
    'who are my{ state|}{ elected|} officials'
  ]
}, {
  intent: 'ElectedOfficialDetailsIntent',
  dictionary: {},
  slots: {
    house: 'HOUSE_TYPES'
  },
  templates: [
    '{-|house}',
    'tell {me|us} more about {my|our} {-|house}',
    '{I|we} want to know more about {my|our} {-|house}',
    '{my|our} {-|house}'
  ]
}, {
  intent: 'AMAZON.HelpIntent',
  dictionary: {},
  slots: {},
  templates: [
    '{Help|Teach}{ me| us|}',
    '{I|we} need help',
    'What can {I|you|this} do{ here|}',
    'What do you know'
  ]
}, {
  intent: 'AMAZON.StopIntent',
  dictionary: {},
  slots: {},
  templates: [
    '{Exit|Stop|Quit|Enough|Shut up}'
  ]
}];
