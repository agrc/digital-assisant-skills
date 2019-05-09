'use strict';

const { dialogflow, Permission, BasicCard, Button, Image, Table, Suggestions } = require('actions-on-google');
const text = require('./config/text');
const { search } = require('./services/agrc');
const leCache = require('./mock_data/legislators_endpoint.json');

const app = dialogflow({ debug: true });

const context = {
  FROM: 'what-intent',
  SENATE: 'what-senate-district',
  HOUSE: 'what-house-district',
  SENATOR: 'who-senator',
  REPRESENTATIVE: 'who-representative'
};
const lifespan = {
  ONCE: 1,
  DEFAULT: 5,
  LONG: 100
};

const requestLocation = (conv, text) => {
  return conv.ask(new Permission({
    context: text,
    permissions: ['DEVICE_PRECISE_LOCATION']
  }));
};

const getLocation = (conv) => {
  if (!conv.device.location) {
    return false;
  }

  return conv.device.location.coordinates;
};

const getDistricts = (conv) => {
  const data = conv.contexts.get(context.HOUSE);

  if (!data) {
    console.log('missing district context');

    return false;
  }

  console.log('using district context');

  const senate = conv.contexts.get(context.SENATE).parameters.district;
  const house = data.parameters.district;

  return { house, senate };
};

const getOfficials = (conv) => {
  const data = conv.contexts.get(context.REPRESENTATIVE);

  if (!data) {
    console.log('missing official context');

    return false;
  }

  console.log('using official context');

  const senator = conv.contexts.get(context.SENATOR).parameters.official;
  const representative = data.parameters.official;

  return { representative, senator, official: data.parameters.Branch };
}

const routeRequest = (conv) => {
  const where = conv.contexts.get(context.FROM).parameters.intent;

  console.log(`context.get: ${where}`);

  switch (where) {
    case 'district': {
      console.log('querying district');

      const location = getLocation(conv);
      console.log(location);

      if (!location) {
        return requestLocation(conv, 'To find your district');
      }

      const options = {
        spatialReference: 4326,
        geometry: `point:[${location.longitude},${location.latitude}]`
      };

      return search('sgid10.political.officialslookup', ['repdist', 'sendist'], options).then(result => {
        if (result.message) {
          return conv.ask(result.message);
        }

        const senate = result.senate;
        const house = result.house;

        conv.contexts.set(context.HOUSE, lifespan.LONG, {
          district: house
        });

        conv.contexts.set(context.SENATE, lifespan.LONG, {
          district: senate
        });

        conv.ask(text.DISTRICT
          .replace('{{house}}', house)
          .replace('{{senate}}', senate));

        conv.ask(new Table({
          title: 'Your districts',
          columns: [{
            header: 'Senate District',
            align: 'CENTER'
          }, {
            header: 'House District',
            align: 'CENTER'
          }],
          rows: [[senate.toString(), house.toString()]]
        }));

        conv.ask(new Suggestions([
          'Who represents me'
        ]));

        return conv.ask(text.DISTRICT_FOLLOW);
      });
    }
    case 'legislature': {
      console.log('querying legislators');

      // get districts
      const districts = getDistricts(conv);
      // if null get location, then get districts
      if (!districts) {
        // use agrc service
      }

      const { house, senate } = districts;

      // query le service for legislators
      const legislators = leCache.legislators;

      const senator = legislators.filter((item) => item.house === 'S' && item.district === senate.toString())[0];
      const representative = legislators.filter((item) => item.house === 'H' && item.district === house.toString())[0];

      conv.contexts.set(context.SENATOR, lifespan.LONG, {
        official: senator
      });

      conv.contexts.set(context.REPRESENTATIVE, lifespan.LONG, {
        official: representative
      });

      const deabbrivate = (partyAbbr) => {
        if (partyAbbr === 'D') {
          return 'democrat'
        }

        if (partyAbbr === 'R') {
          return 'republican'
        }

        return partyAbbr;
      };

      conv.ask(text.LEGISLATOR
        .replace('{{sen_party}}', deabbrivate(senator.party))
        .replace('{{sen}}', senator.formatName)
        .replace('{{rep}}', representative.formatName)
        .replace('{{rep_party}}', deabbrivate(representative.party))
      );

      conv.ask(new Table({
        title: 'Your Legislators',
        subtitle: `Senate District ${senate} House District ${house}`,
        columns: [{
          header: 'Representative',
          align: 'CENTER'
        }, {
          header: 'Senator',
          align: 'CENTER'
        }],
        rows: [[representative.formatName, senator.formatName]]
      }));

      return conv.ask(new Suggestions([
        'Representative details',
        'Senator details'
      ]));
    }
    case 'legislator-details': {
      // get officials
      const officials = getOfficials(conv);
      // if null get location, then get officials
      if (!officials) {
        // use agrc service
      }

      let data;
      const { representative, senator, official } = officials;

      if (official === 'house') {
        data = representative;
        data.branch = 'representative';
      } else if (official === 'senate') {
        data = senator;
        data.branch = 'senator';
      } else {
        return conv.ask('Which branch are you insterested in?');
      }

      conv.ask(text.DETAILS
        .replace('{{official}}', data.formatName)
        .replace('{{profession}}', data.profession)
        .replace('{{education}}', data.education)
        .replace('{{type}}', data.branch)
        .replace('{{serviceStart}}', data.serviceStart)
      );

      return conv.ask(new BasicCard({
        image: new Image({
          url: data.image,
          alt: data.formatName
        }),
        title: data.formatName,
        subtitle: data.branch,
        text: `**District**: ${data.district}\r\n\r\n` +
          `**Counties**: ${data.counties}\r\n\r\n` +
          `**Profession**: ${data.profession}\r\n\r\n` +
          `**Education**: ${data.education}\r\n\r\n` +
          `**email**: ${data.email}\r\n\r\n` +
          `**cell**: ${data.cell}`,
        buttons: [
          new Button({
            title: 'Legislation',
            url: data.legislation
          })
        ]
      }));
    }
    default: {
      return conv.ask(text.WELCOME);
    }
  }
};

app.intent('location received', (conv, _, confirmationGranted) => {
  console.log('INTENT: location received');

  const { location } = conv.device;

  if (!confirmationGranted || !location) {
    return conv.ask('Ok, well I can answer other questions without your location');
  }

  return routeRequest(conv);
});

app.intent('what is my district', (conv) => {
  console.log('INTENT: what is my district');

  conv.contexts.set(context.FROM, lifespan.ONCE, {
    intent: 'district'
  });

  return requestLocation(conv, 'To find your district');
});

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

app.intent('Default Welcome Intent', (conv) => {
  conv.ask(text.WELCOME);

  return conv.ask(new Suggestions([
    'What is my district',
    // 'Who represents me',
    // 'Representative details',
    'How many legislators',
    'How many democrats',
    'When is the session'
  ]));
});

module.exports = app;
