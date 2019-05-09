'use strict';

const { BasicCard, Button, Image, Suggestions, Table } = require('actions-on-google');
const { context, lifespan } = require('../config/config');
const agrc = require('../services/agrc');
const contextHelper = require('../context');
const location = require('./location');
const le = require('../services/le');
const text = require('../config/text');

exports.representMeIntent = {
  'who represents me': (conv) => {
    console.log('INTENT: who represents me');

    conv.contexts.set(context.FROM, lifespan.ONCE, {
      intent: 'legislature'
    });

    return location.requestLocation(conv, 'To find your elected officials');
  }
};

exports.findLegislators = (conv) => {
  console.log('legislature.findLegislators');

  // get districts
  const districts = contextHelper.getDistricts(conv);
  // if null get location, then get districts
  if (!districts) {
    // use agrc service
  }

  const { house, senate } = districts;

  // query le service for legislators
  const legislators = le.search().legislators;

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
};

exports.legislatorDetailIntent = {
  'specific legislator details': (conv) => {
    console.log('INTENT: specific legislator details');

    conv.contexts.set(context.FROM, lifespan.ONCE, {
      intent: 'legislator-details'
    });

    return location.requestLocation(conv, 'To find details about your elected official');
  }
};

exports.getSpecificLegislator = (conv) => {
  console.log('legislature.getSpecificLegislator');
  // get officials
  const officials = contextHelper.getOfficials(conv);
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
};

exports.howManyLegislatorsIntent = {
  'how many legislators': (conv) => {
    const all = le.search().legislators;
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
  }
};

exports.partyStatisticsIntent = {
  'party statistics': (conv) => {
    const all = le.search().legislators;
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
  }
};
