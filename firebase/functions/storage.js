'use strict';

exports.getLocation = (conv) => {
  console.log('context.getLocation');

  if (conv.user.storage.location) {
    console.log('using user stored location');

    return conv.user.storage.location;
  }

  if (!conv.device.location) {
    return false;
  }

  console.log('using permission granted location');

  return conv.device.location.coordinates;
};

exports.getDistricts = (conv) => {
  const house = conv.user.storage.houseDistrict;

  if (!house) {
    console.log('missing district storage');

    return false;
  }

  console.log('using district storage');

  const senate = conv.user.storage.senateDistrict;

  return { house, senate };
};

exports.getOfficials = (conv) => {
  const representative = conv.user.storage.representative;

  if (!representative) {
    console.log('missing official context');

    return false;
  }

  console.log('using official context');

  const senator = conv.user.storage.senator;

  return { representative, senator, official: conv.user.storage.branch };
};
