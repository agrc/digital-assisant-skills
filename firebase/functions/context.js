'use strict';

const { context } = require('./config/config');

exports.getLocation = (conv) => {
  if (conv.contexts.output && conv.contexts.output['geocoded-address']) {
    console.log('output context');
    console.log(conv.contexts.output);

    return conv.contexts.output['geocoded-address'].parameters.point;
  }

  if (!conv.device.location) {
    return false;
  }

  return conv.device.location.coordinates;
};

exports.getDistricts = (conv) => {
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

exports.getOfficials = (conv) => {
  const data = conv.contexts.get(context.REPRESENTATIVE);

  if (!data) {
    console.log('missing official context');

    return false;
  }

  console.log('using official context');

  const senator = conv.contexts.get(context.SENATOR).parameters.official;
  const representative = data.parameters.official;

  return { representative, senator, official: data.parameters.Branch };
};
