#!/usr/bin/env python
# * coding: utf8 *
'''
session.py
A module that answers questions about when and if the session is going on
'''

import calendar
import datetime
import logging

from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name

from alexa import utils
from config import text

LOGGER = logging.getLogger('alexa-skill')

#: The legislative session always starts in January
JANUARY = 1
#: The week starts on Monday
MONDAY = 0
#: There are 45 days in the session
SESSION_DURATION = 45


def fourth_monday(year=datetime.date.today().year):
    '''returns the date of the fourth monday of january for the given year
    '''
    month = calendar.Calendar().monthdays2calendar(year, JANUARY)
    monday_count = 0

    for week in month:
        for day, day_of_week in week:
            if day == 0:
                break

            if day_of_week == MONDAY:
                monday_count += 1

                if monday_count == 4:
                    return day

                break

            if day_of_week > MONDAY:
                break

    return -1


def session_ends(year, start_day):
    '''returns the date that the session ends which is 45 days after it starts
    '''
    start_date = datetime.date(year, JANUARY, start_day)

    return start_date + datetime.timedelta(days=SESSION_DURATION)


class Handler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('SessionIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        year = utils.get_resolved_value(handler_input.request_envelope.request, 'year')

        LOGGER.info('year slot value: %s', year)

        today = datetime.date.today()
        current_year = today.year

        if year is None:
            year = current_year
        else:
            year = int(year)

        tense = 'runs'
        if year < current_year:
            tense = 'ran'
        elif year > current_year:
            tense = 'will run'

        start_day = fourth_monday(year)
        LOGGER.info(start_day)
        end = session_ends(year, start_day)
        LOGGER.info(end)

        currently_in_session = datetime.date(year, JANUARY, start_day) < today < end
        in_session = ''
        if currently_in_session:
            in_session = ' is currently in progress and'

        response_builder.speak('The {} legislative session{} {} from January {} to {}'.format(year, in_session, tense, start_day, end)) \
        .ask(text.WHAT_DO_YOU_WANT)

        return response_builder.response
