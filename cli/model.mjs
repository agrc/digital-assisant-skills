export default [{
  intent: 'LegislatorCountIntent',
  dictionary: {
    branches: ['legislators', 'senators', 'representatives'],
    reps: ['people', 'legislators', 'representatives'],
    sens: ['people', 'legislators', 'senators']
  },
  slots: {},
  templates: [
    'How many {branches} does{ the State of|} Utah have',
    'Tell me how many {branches} does{ the State of|} Utah have',
    'Tell me how many {branches}{ the State of|} Utah has',
    'How many {branches} are there for{ the State of|} Utah',
    'Tell me how many {branches} are there for{ the State of|} Utah',
    'Tell me how many {branches} there are for{ the State of|} Utah',
    'How many {people|legislators|representatives} {are in|are there in|make up} the{ Utah|} House{ of Representatives|}',
    'Tell me how many {reps} {are in|are there in|make up} the {Utah |}House{ of Representatives|}',
    'What is the number of {reps} in the {Utah |}House{ of Representatives|}',
    'Tell me what is the number of {reps} in the {Utah |}House{ of Representatives|}',
    'Number of {reps} in the {Utah |}House{ of Representatives|}',
    'Number of Utah {branches}',
    'How many {sens} {are in|are there in|make up} the {Utah |}Senate',
    'Tell me how many {sens} {are in|are there in|make up} the {Utah |}Senate',
    'What is the number of {sens} in the {Utah |}Senate',
    'Tell me what is the number of {sens} in the {Utah |}Senate',
    'Number of {sens} in the {Utah |}Senate',
    'Number of Utah senators'
  ]
}, {
  intent: 'SessionIntent',
  dictionary: {
    session: ['session', '{-|year} session', 'the {-|year} session', 'Utah\'s session', 'the next session']
  },
  slots: {
    year: 'AMAZON.FOUR_DIGIT_NUMBER'
  },
  templates: [
    'When will the {-|year} session be{ held|}',
    'What is the date of the {-|year} session',
    'What are the dates of the {-|year} session',
    'When is {session}',
    'What {date is|dates are} {session}',
    '{When is|What date is} {the legislature|the Utah Legislature|legislature} in session',
    'Tell me when is {session}',
    'Tell me the date of {session}',
    'When does {session} {start|begin}',
    'What is the first day of {session}',
    'Tell me when does {session} {start|begin}',
    'Tell me when {session} {starts|begins}',
    'Tell me what is the first day of {session}',
    'Tell me the first day of {session}',
    'When does {session} {end|finish}',
    'What is the {last|final} day of {session}',
    'Tell me when does {session} {end|finish}',
    'Tell me when {session} {ends|finishes}',
    'Tell me what is the last day of {session}',
    'Tell me the last day of {session}'
  ]
}, {
  intent: 'DistrictIntent',
  dictionary: {
    branch: ['legislative', 'senate', 'house', 'senator', 'senators', 'representative', 'representatives'],
    branches: ['senate', 'house']
  },
  slots: {},
  templates: [
    'what {is|are} my {state |}{branch}{ political|} district',
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
    'who is {my|our} {state |}{lesgislator}',
    'who are {my|our} {state |}{lesgislators}',
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
    '{Exit|Stop|Quit|Enough|Shut up|Thank you|Thanks|ok}'
  ]
}];
