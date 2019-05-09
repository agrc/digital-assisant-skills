const { BasicCard, Suggestions, Table } = require('actions-on-google');
const location = require('./location');
const { context, lifespan } = require('../config/config');
const leCache = require('../mock_data/legislators_endpoint.json');
const text = require('../config/text');

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
};


exports.howManyLegislatorsIntent = {
  'how many legislators': (conv) => {
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
  }
};

exports.partyStatisticsIntent = {
  'party statistics': (conv) => {
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
  }
}
