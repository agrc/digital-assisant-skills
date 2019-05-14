'use strict';

const { Suggestions } = require('actions-on-google');
const text = require('../config/text');

module.exports = {
  'session.when': (conv, params) => {
    // The legislative session always starts in January
    const JANUARY = 1;
    // There are 45 days in the session
    const SESSION_DURATION = 45;

    let year = params.year;

    console.log(`year entity: ${year} as ${typeof (year)}`);

    const today = new Date();
    const currentYear = today.getFullYear();

    if (!year) {
      year = currentYear;
    } else if (typeof (year) === 'string') {
      year = parseInt(year, 10);
    }

    const fourthMonday = (year) => {
      const date = new Date(`${year}/${JANUARY}/1`);
      let currentMonth = JANUARY;
      let firstMonday = false;
      while (currentMonth === JANUARY) {
        firstMonday = date.getDay() === 1 || firstMonday;
        date.setDate(date.getDate() + (firstMonday ? 7 : 1));
        currentMonth = date.getMonth() + 1;
      }

      date.setDate(date.getDate() - 7);

      return date;
    };

    const sessionEnds = (date, days) => {
      let result = new Date(date);
      result.setDate(result.getDate() + days);

      return result;
    };

    let start = fourthMonday(year);
    let end = sessionEnds(start, SESSION_DURATION);

    if (params.kindaordinal) {
      if (params.kindaordinal === 'next' && today > start) {
        year++;
        start = fourthMonday(year);
        end = sessionEnds(start, SESSION_DURATION);
      } else if (params.kindaordinal === 'previous' && today < end) {
        year--;
        start = fourthMonday(year);
        end = sessionEnds(start, SESSION_DURATION);
      }
    }

    let tense = 'runs';
    if (today > start) {
      tense = 'ran';
    } else if (today < start) {
      tense = 'will run'
    }

    let speak = '';
    if (today > start && today < end) {
      speak = ' is currently in progress and';
    }

    conv.ask(text.SESSION
      .replace('{{year}}', start.toLocaleDateString('en-US', { year: 'numeric' }))
      .replace('{{inSession}}', speak)
      .replace('{{tense}}', tense)
      .replace('{{start}}', start.toLocaleDateString('en-US', { day: 'numeric' }))
      .replace('{{end}}', end.toLocaleDateString())
    );

    return conv.ask(new Suggestions([
      'When is the next session',
      'When is the 2050 session'
    ]));
  }
}
