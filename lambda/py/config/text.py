#!/usr/bin/env python
# * coding: utf8 *
'''
text.py
A module that stores all of the text for the skill
'''

WELCOME = 'Welcome to the Utah Voting Information Assistant. Ask your question or ask for help to be guided through the questions I can answer.'
WHAT_DO_YOU_WANT = 'Ask your question or ask for help to be guided through the questions I can answer.'
NOTIFY_MISSING_PERMISSIONS = 'Please enable Location permissions in the Amazon Alexa app.'
NO_ADDRESS = (
    'It looks like you do not have an address set. You can set your address from the companion app. '
    'Go to settings, then device settings, find the device you are interacting with and finally select location to add an address'
)
ERROR = 'Uh Oh. Looks like something went wrong.'
AGRC_API_ERROR = 'Make sure your address is in Utah and is valid and try again.'
UNKNOWN_SLOT = 'I didn\'t get that.'

#: legislature.py
LEGISLATOR = 'Your representative is {}, {} and your Senator is {}, {}.'
LEGISLATOR_REPROMPT = 'Would you like more information about your Senator or Representative? Say, senator or representative.'

DETAILS = '{} is a {} with an education in {}. They became a {} on {}'

COUNT = 'There are {} legislators total -- with {} senators and {} representatives'
COUNT_REPROMPT = 'Do you want to hear the current political party breakdown?'

PARTY_STATS = 'There are {} democrats and {} republicans. The democrats make up {:.1%} and the republicans {:.1%}'

STREET = '316 east south temple'
CITY = 'salt lake city'
