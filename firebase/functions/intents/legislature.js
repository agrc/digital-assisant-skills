'use strict';

const { BasicCard, Button, Image, Suggestions, Table } = require('actions-on-google');
const storage = require('../storage');
const location = require('./location');
const le = require('../services/le');
const text = require('../config/text');
const district = require('./district');

exports.legislatureIntents = {
  'legislature.mine': async (conv) => {
    console.log('INTENT: who represents me');

    conv.user.storage.intent = 'legislature.mine';

    if (storage.getLocation(conv) || storage.getDistricts(conv)) {
      return await this.findLegislators(conv);
    }

    return await location.requestLocation(conv, 'To find your elected officials');
  },
  'legislature.details': async (conv, params) => {
    console.log('INTENT: specific legislator details');

    console.log(params);

    conv.user.storage.branch = params.Branch;
    conv.user.storage.intent = 'legislator.specific';

    if (storage.getLocation(conv) || storage.getDistricts(conv) || storage.getOfficials(conv)) {
      return await this.findSpecificLegislator(conv);
    }

    return await location.requestLocation(conv, 'To find details about your elected official');
  }
};

exports.countIntents = {
  'legislature.count': (conv) => {
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
  },
  'legislature.statistics': (conv) => {
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

exports.findLegislators = async (conv) => {
  console.log('legislature.findLegislators');

  // get districts
  console.log('1: trying for districts')
  let districts = storage.getDistricts(conv);

  // if null get location, then get districts
  if (!districts) {
    console.log('no districts');

    districts = await district.getDistricts(conv);

    if (districts.error) {
      return conv.ask(error);
    }
  }

  const { house, senate } = districts;

  conv.user.storage.senateDistrict = senate;
  conv.user.storage.houseDistrict = house;

  const { senator, representative } = getSenatorRepFromDistrict(conv, districts);

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

exports.findSpecificLegislator = async (conv) => {
  console.log('legislature.findSpecificLegislator');

  // get officials
  let officials = storage.getOfficials(conv);
  // if null get location, then get officials
  if (!officials) {
    let districts = storage.getDistricts(conv);

    if (!districts) {
      districts = await district.getDistricts(conv);
    }

    officials = getSenatorRepFromDistrict(conv, districts);

    if (!('official' in officials)) {
      officials.official = conv.user.storage.branch;
    }
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
    return conv.ask('Which branch are you interested in?');
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

const deabbrivate = (partyAbbr) => {
  if (partyAbbr === 'D') {
    return 'democrat'
  }

  if (partyAbbr === 'R') {
    return 'republican'
  }

  return partyAbbr;
};

const getSenatorRepFromDistrict = (conv, districts) => {
  console.log('legislature.getSenatorRepFromDistrict');
  console.log(districts);

  const { house, senate } = districts;
  // query le service for legislators
  const legislators = le.search().legislators;

  const senator = legislators.filter((item) => item.house === 'S' && item.district === senate.toString())[0];
  const representative = legislators.filter((item) => item.house === 'H' && item.district === house.toString())[0];

  conv.user.storage.senator = senator;
  conv.user.storage.representative = representative;

  return { senator, representative };
};
