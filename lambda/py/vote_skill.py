import logging
import os
from json import load
from types import SimpleNamespace

import requests
from flask import Flask
from flask_ask import Ask, context, question, request, session, statement

app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger('flask_ask').setLevel(logging.DEBUG)
address_line1 = '316 east south temple'
city = 'salt lake city'
postal_code = 84109
x = 426553
y = 4511970
district = 36


@ask.launch
def launch():
    #: check current permissions

    # has_correct_permissions = context.System.user.permissions and context.System.user.permissions.consentToken

    #: ask for address consent

    # if not has_correct_permissions:
    #     return statement('Welcome to the Utah Voting Information Assistant. In order to use this skill effectively, please enable the location permission in the Alexa App. ' +
    #     'We will use your address to best match you to your voting district.') \
    #         .consent_card("alexa::devices:all:address:full:read")

    speech_text = (
        'Welcome to the Utah Voting Information Assistant. To find out who your state elected officials are, say, who are my state elected officials?'
    )

    #: look for address and city or zip.

    #: ask for address if not found

    #: geocode address

    #: search for precinct or district

    #: add result to session or persist perminently

    return question(speech_text) \
        .reprompt('I didn\'t get that. Say, who are my state elected officials?') \
        .simple_card('Vote Utah', speech_text)


@ask.intent('ElectedOfficialsIntent')
def elected_officials():
    #: pull precinct/district value from session

    #: check for le service cache

    #: query le service
    parent_directory = os.path.abspath(os.path.dirname(__file__))
    legislators_json = os.path.join(parent_directory, 'mock_data', 'le.utah.gov', 'legislators_endpoint.json')
    print('parent directory: {}'.format(parent_directory))
    print('json file: {}'.format(legislators_json))

    all_legislators = None
    with open(legislators_json) as json_file:
        all_legislators = load(json_file)['legislators']

    #: filter le results
    legislators_for_district = [item for item in all_legislators if item["district"] == str(district)]

    print(len(legislators_for_district))

    speech_text = (
        'Your representative is Democrat Patrice M. Arent and your Senator is Democrat Jani Iwamoto. Would you like more information ' +
        'about your Senator or Representative? Say, senator or representative.'
    )

    return question(speech_text) \
        .simple_card('ElectedOfficials', speech_text)


@ask.intent('ElectedOfficialsDetailsIntent')
def elected_officials_details(official):
    if official is None:
        return question('unknown')

    if official == 'representative':
        speech_text = '''Jani has straight hair. Would you like to call her? Say, call my representative.'''
    elif official == 'senator':
        speech_text = '''Patrice has curly hair. Would you like to call her? Say, call senator.'''
        return statement('Here is what I know about Patrice') \
            .standard_card(title='Patrice M. Arent',
                           text='House of Representatives January 1, 1997 - December 31, 2002; Senate January 1, 2003 - December 31, 2006; House of Representatives January 1, 2011',
                           small_image_url='https://le.utah.gov/images/legislator/ARENTPM.jpg',
                           large_image_url='https://le.utah.gov/images/legislator/ARENTPM.jpg')
    else:
        speech_text = '''unknown'''

    return question(speech_text) \
        .simple_card('ElectedOfficialsDetails', speech_text)


@ask.intent('AMAZON.HelpIntent')
def help():
    speech_text = 'You can say hello to me!'

    return question(speech_text) \
        .reprompt(speech_text) \
        .simple_card('HelloWorld', speech_text)


@ask.session_ended
def session_ended():
    return "{}", 200


if __name__ == '__main__':
    if 'ASK_VERIFY_REQUESTS' in os.environ:
        verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
        if verify == 'false':
            app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)
