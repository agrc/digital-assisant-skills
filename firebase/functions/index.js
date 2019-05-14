'use strict';

const functions = require('firebase-functions');
const app = require('./app');

module.exports.utahvoteinfo = functions.https.onRequest(app);
