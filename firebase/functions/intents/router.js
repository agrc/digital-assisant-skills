const { BasicCard, Button, Image } = require('actions-on-google');
const { context } = require('../config/config');
const district = require('./district');
const legislature = require('./legislature');
const text = require('../config/text');

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

      return district.findDistricts(conv);
    }
    case 'legislature': {
      console.log('routing to find legislators');

      return legislature.findLegislators(conv);
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
