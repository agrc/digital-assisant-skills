const { BasicCard, Suggestions, Table } = require('actions-on-google');
const leCache = require('../mock_data/legislators_endpoint.json');
const text = require('../config/text');

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
