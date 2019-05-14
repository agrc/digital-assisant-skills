'use strict';

exports.randomize = (...options) => {
  const low = 0;
  const high = options.length - 1;

  const index = Math.floor(Math.random() * (high - low + 1) + low);

  return options[index];
};
