'use strict';

const { dialogflow, BasicCard, Button, Image, Table, Suggestions } = require('actions-on-google');
const { districtIntent } = require('./intents/district');
const { representMeIntent, legislatorDetailIntent } = require('./intents/legislature');
const { requestLocationIntent, locationReceivedIntent } = require('./intents/location');
const sessionItent = require('./intents/session');
const text = require('./config/text');
const leCache = require('./mock_data/legislators_endpoint.json');

const app = dialogflow({ debug: true });

const addIntents = (...args) => {
  for (let i = 0; i < args.length; i++) {
    for (const key in args[i]) {
      if (args[i].hasOwnProperty(key)) app.intent(key, args[i][key]);
    }
  }
};

app.intent('who represents me', (conv) => {
  console.log('INTENT: who represents me');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'legislature'
  });

  return requestLocation(conv, 'To find your elected officials');
});

app.intent('specific legislator details', (conv) => {
  console.log('INTENT: specific legislator details');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'legislator-details'
  });

  return requestLocation(conv, 'To find details about your elected official');
});

app.intent('how many legislators', (conv) => {
  const all = leCache.legislators;
  let sens = 0;
  let reps = 0;

  all.forEach((legislator) => {
    if (legislator.house.toLowerCase() === 'h') {
      reps += 1;
    } else {
      sens += 1;
    }
  });

  conv.ask(text.COUNT
    .replace('{{total}}', reps + sens)
    .replace('{{sens}}', sens)
    .replace('{{reps}}', reps)
  );

  conv.ask(new Table({
    title: `Legislators: ${reps + sens}`,
    columns: [{
      header: 'Senators',
      align: 'CENTER'
    }, {
      header: 'Representatives',
      align: 'CENTER'
    }],
    rows: [[sens.toString(), reps.toString()]]
  }));

  return conv.ask(new Suggestions([
    'How many democrats',
    'How many republicans'
  ]));
});

app.intent('party statistics', (conv) => {
  const all = leCache.legislators;
  let dems = 0;
  let reps = 0;

  all.forEach((legislator) => {
    if (legislator.party.toLowerCase() === 'r') {
      reps += 1;
    } else {
      dems += 1;
    }
  });

  const total = reps + dems;

  conv.ask(text.PARTY_STATS
    .replace('{{dems}}', dems)
    .replace('{{reps}}', reps)
    .replace('{{dem_percent}}', ((dems / total) * 100).toFixed(1))
    .replace('{{rep_percent}}', ((reps / total) * 100).toFixed(1))
  );

  return conv.ask(new BasicCard({
    title: 'Party Statistics',
    text: '**Democrats**: ' + dems.toString() +
      '\r\n\r\n**Republicans**: ' + reps.toString()
  }));
});

app.intent('when is the session', (conv, params) => {
  // The legislative session always starts in January
  const JANUARY = 1;
  // There are 45 days in the session
  const SESSION_DURATION = 45;

  let year = params.year;

  console.log(`year entity: ${year} as ${typeof (year)}`);

  const today = new Date();
  const currentYear = today.getFullYear();

  if (!year) {
    year = currentYear;
  } else if (typeof (year) === 'string') {
    year = parseInt(year, 10);
  }

  const fourthMonday = (year) => {
    const date = new Date(`${year}/${JANUARY}/1`);
    let currentMonth = JANUARY;
    let firstMonday = false;
    while (currentMonth === JANUARY) {
      firstMonday = date.getDay() === 1 || firstMonday;
      date.setDate(date.getDate() + (firstMonday ? 7 : 1));
      currentMonth = date.getMonth() + 1;
    }

    date.setDate(date.getDate() - 7);

    return date;
  };

  const sessionEnds = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
  };

  let start = fourthMonday(year);
  let end = sessionEnds(start, SESSION_DURATION);

  if (params.kindaordinal) {
    if (params.kindaordinal === 'next' && today > start) {
      year++;
      start = fourthMonday(year);
      end = sessionEnds(start, SESSION_DURATION);
    } else if (params.kindaordinal === 'previous' && today < end) {
      year--;
      start = fourthMonday(year);
      end = sessionEnds(start, SESSION_DURATION);
    }
  }

  let tense = 'runs';
  if (today > start) {
    tense = 'ran';
  } else if (today < start) {
    tense = 'will run'
  }

  let speak = '';
  if (today > start && today < end) {
    speak = ' is currently in progress and';
  }

  conv.ask(text.SESSION
    .replace('{{year}}', start.toLocaleDateString('en-US', { year: 'numeric' }))
    .replace('{{inSession}}', speak)
    .replace('{{tense}}', tense)
    .replace('{{start}}', start.toLocaleDateString('en-US', { day: 'numeric' }))
    .replace('{{end}}', end.toLocaleDateString())
  );

  return conv.ask(new Suggestions([
    'When is the next session',
    'When is the 2050 session'
  ]));
});

app.intent('help me', (conv) => {
  conv.ask('I can find out your legislative district, who your legislators are, how many, when the sessions are. Just ask!');

  return conv.ask(new Suggestions([
    'What is my district',
    'How many legislators',
    'How many democrats',
    'When is the session'
  ]));
});

app.intent('Default Welcome Intent', (conv) => {
  conv.ask(text.WELCOME);

  conv.ask(new BasicCard({
    text: text.WELCOME,
    title: 'Utah Voting Information',
    subtitle: 'Innovation Grant',
    buttons: new Button({
      title: 'Developer Docs',
      url: 'https://github.com/agrc/digital-assistant-skills/',
    }),
    image: new Image({
      url: 'https://vote.utah.gov/images/header/header-seal.png',
      alt: 'vote logo',
    })
  }));

  return conv.ask(new Suggestions([
    'What is my district',
    // 'Who represents me',
    // 'Representative details',
    'How many legislators',
    'How many democrats',
    'When is the session'
  ]));
});

addIntents(
  districtIntent,
  locationReceivedIntent
);

module.exports = app;
