'use strict';

const { Table, Suggestions } = require('actions-on-google');
const agrc = require('../services/agrc');
const storage = require('../storage')
const location = require('./location');
const text = require('../config/text');

exports.districtIntent = {
  'district.mine': async (conv) => {
    console.log('INTENT: what is my district');

    conv.user.storage.intent = 'district';

    let districts = storage.getDistricts(conv)

    if (districts) {
      return sayDistrict(conv, districts.house, districts.senate);
    }

    if (storage.getLocation(conv)) {
      return await this.findDistricts(conv);
    }

    return await location.requestLocation(conv, 'To find your district');
  }
};

const sayDistrict = (conv, house, senate) => {
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
};

exports.findDistricts = async (conv) => {
  console.log('district.findDistricts');

  const { house, senate, error } = await this.getDistricts(conv);

  if (error) {
    return conv.ask(error);
  }

  return sayDistrict(conv, house, senate);
};

exports.getDistricts = async (conv) => {
  const location = storage.getLocation(conv);
  console.log(location);

  if (!location) {
    return await location.requestLocation(conv, 'To find your district');
  }

  const options = {
    spatialReference: 4326,
    geometry: `point:[${location.longitude},${location.latitude}]`
  };

  const result = await agrc.search('sgid10.political.officialslookup', ['repdist', 'sendist'], options);

  if (result.message) {
    return { error: result.message }
  }

  const senate = result.senate;
  const house = result.house;

  conv.user.storage.senateDistrict = senate;
  conv.user.storage.houseDistrict = house;


  return { senate, house };
}
