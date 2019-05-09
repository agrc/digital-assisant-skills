'use strict';

const { apiKey } = require('../config/config');
const { text } = require('../config/text');
const rp = require('request-promise');
const qs = require('querystring')

exports.geocode = (options) => {
  const url = `https://api.mapserv.utah.gov/api/v1/geocode/${options.street}/${options.zone}?`;

  const query = {
    apiKey,
    spatialReference: options.spatialReference || 26912,
  };

  const requestOptions = {
    url: url + qs.stringify(query),
    headers: {
      'referer': 'https://google.vote-skill.com'
    },
    json: true
  };

  return rp(requestOptions).then((response) => {
    console.log(response);

    if (response.status === 400) {
      console.warn('geocode issue: ', response);

      return {
        message: response.message
      }
    }

    if (response.status !== 200) {
      console.warn('geocode issue: ', response);

      return {
        message: text.AGRC_API_ERROR
      }
    }

    return {
      x: response.result.location.x,
      y: response.result.location.y
    };
  }).catch((err) => {
    console.error('search issue:', err);

    return {
      message: err
    };
  });
};

exports.search = (table, fields, options) => {
  console.log('webapi.searching')

  const url = `https://api.mapserv.utah.gov/api/v1/search/${table}/${fields}?`;

  const query = {
    apiKey,
    spatialReference: options.spatialReference || 26912
  };

  const requestOptions = {
    url: url + qs.stringify(query) + `&geometry=${options.geometry}`,
    headers: {
      'referer': 'https://google.vote-skill.com'
    },
    json: true
  };

  return rp(requestOptions).then((response) => {
    console.log(response);

    if (response.status === 400) {
      console.warn('search issue, status is 400: ', response);

      return {
        message: response.message
      }
    }

    if (response.status !== 200) {
      console.warn('search issue, status not 200: ', response);

      return {
        message: text.AGRC_API_ERROR
      }
    }

    return {
      senate: response.result[0].attributes.sendist,
      house: response.result[0].attributes.repdist
    };
  }).catch((err) => {
    console.error('global search error:', err);

    return {
      message: err
    };
  });
};
