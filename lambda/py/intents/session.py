#!/usr/bin/env python
# * coding: utf8 *
'''
session.py
A module that answers questions about when and if the session is going on
'''

import calendar
import datetime

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
