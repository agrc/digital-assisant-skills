const { BasicCard, Button, Image, Table, Suggestions } = require('actions-on-google');
const { context, lifespan } = require('../config/config');
const findDistricts = require('./district').findDistricts;
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

module.exports = (conv) => {
  const where = conv.contexts.get(context.FROM).parameters.intent;

  console.log(`context.get: ${where}`);

  switch (where) {
    case 'district': {
      console.log('routing to find districts');

      return findDistricts(conv);
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
