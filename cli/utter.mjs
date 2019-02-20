import utterances from 'alexa-utterances';

const deepFlatten = (arr1) =>
  arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(deepFlatten(val)) : acc.concat(val), []);

export const generateSamples = (model) => {
  console.log('generating samples...');

  model.forEach(item => {
    item.samples = deepFlatten(item.templates.map(template => utterances(template, item.slots, item.dictionary)));
  });

  return model;
};
