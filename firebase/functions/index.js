'use strict';

const functions = require('firebase-functions');
const app = require('./app');

module.exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
