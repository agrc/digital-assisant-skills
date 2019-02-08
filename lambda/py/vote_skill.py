import logging
import os

import requests

from ask_sdk_core.skill_builder import CustomSkillBuilder
from ask_sdk_core.api_client import DefaultApiClient
from ask_sdk_core.serialize import DefaultSerializer
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.dispatch_components import AbstractExceptionHandler
from ask_sdk_core.utils import is_request_type, is_intent_name
from ask_sdk_model.ui import AskForPermissionsConsentCard
from ask_sdk_model.services import ServiceException
from ask_sdk_model import RequestEnvelope

sb = CustomSkillBuilder(api_client=DefaultApiClient())

from flask import Flask, request, jsonify
app = Flask(__name__)

address_line1 = '316 east south temple'
city = 'salt lake city'
postal_code = 84109
x = 426553
y = 4511970
district = 36


class LaunchRequestHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_request_type('LaunchRequest')(handler_input)

    def handle(self, handler_input):
        handler_input.response_builder \
            .speak('Welcome to the Utah Voting Information Assistant.') \
            .ask('To find out who your state elected officials are, say, who are my state elected officials?')

        return handler_input.response_builder.response


class HelpIntentHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('AMAZON.HelpIntent')(handler_input)

    def handle(self, handler_input):
        handler_input.attributes_manager.session_attributes = {}
        # Resetting session

        handler_input.response_builder.speak('what are you doing?').ask('what are you doing?')
        return handler_input.response_builder.response


class SessionEndedRequestHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_request_type('SessionEndedRequest')(handler_input)

    def handle(self, handler_input):
        return handler_input.response_builder.response


class ExitIntentHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return (
            is_intent_name('AMAZON.CancelIntent')(handler_input) or is_intent_name('AMAZON.StopIntent')(handler_input) or
            is_intent_name('AMAZON.PauseIntent')(handler_input)
        )

    def handle(self, handler_input):
        handler_input.response_builder.speak('abort').set_should_end_session(True)
        return handler_input.response_builder.response


class ElectedOfficials(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_request_type('ElectedOfficialsIntent')(handler_input)

    def handle(self, handler_input):
        handler_input.response_builder \
            .ask(
        'Your representative is Democrat Patrice M. Arent and your Senator is Democrat Jani Iwamoto. Would you like more information ' +
        'about your Senator or Representative? Say, senator or representative.'
        ) \
            .ask('To find out who your state elected officials are, say, who are my state elected officials?')

        return handler_input.response_builder.response


@app.route('/', methods=['POST'])
def launch():
    Serializer = DefaultSerializer()
    request_envelope = Serializer.deserialize(request.data, RequestEnvelope)
    response_envelope = skill_obj.invoke(request_envelope=request_envelope, context=None)

    return jsonify(Serializer.serialize(response_envelope))
    #: check current permissions

    # has_correct_permissions = context.System.user.permissions and context.System.user.permissions.consentToken

    #: ask for address consent

    # if not has_correct_permissions:
    #     return statement('Welcome to the Utah Voting Information Assistant. In order to use this skill effectively, please enable the location permission in the Alexa App. ' +
    #     'We will use your address to best match you to your voting district.') \
    #         .consent_card('alexa::devices:all:address:full:read')

    speech_text = ()

    #: look for address and city or zip.

    #: ask for address if not found

    #: geocode address

    #: search for precinct or district

    #: add result to session or persist perminently

    return handler_input.response_builder \
        .speak(speech_text) \
        .set_card(SimpleCard('Vote Utah', speech_text)) \
        .set_should_end_session(False).response

    # return question(speech_text) \
    #     .reprompt('I didn\'t get that. Say, who are my state elected officials?') \
    #     .simple_card('Vote Utah', speech_text)


# @ask.intent('ElectedOfficialsIntent')
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
    legislators_for_district = [item for item in all_legislators if item['district'] == str(district)]

    print(len(legislators_for_district))

    speech_text = (
        'Your representative is Democrat Patrice M. Arent and your Senator is Democrat Jani Iwamoto. Would you like more information ' +
        'about your Senator or Representative? Say, senator or representative.'
    )

    # return question(speech_text) \
    #     .simple_card('ElectedOfficials', speech_text)


# @ask.intent('ElectedOfficialsDetailsIntent')
def elected_officials_details(official):
    if official is None:
        pass
        # return question('unknown')

    if official == 'representative':
        speech_text = '''Jani has straight hair. Would you like to call her? Say, call my representative.'''
    elif official == 'senator':
        speech_text = '''Patrice has curly hair. Would you like to call her? Say, call senator.'''
        # return statement('Here is what I know about Patrice') \
        #     .standard_card(title='Patrice M. Arent',
        #                    text='House of Representatives January 1, 1997 - December 31, 2002; Senate January 1, 2003 - December 31, 2006; House of Representatives January 1, 2011',
        #                    small_image_url='https://le.utah.gov/images/legislator/ARENTPM.jpg',
        #                    large_image_url='https://le.utah.gov/images/legislator/ARENTPM.jpg')
    else:
        speech_text = '''unknown'''

    # return question(speech_text) \
    #     .simple_card('ElectedOfficialsDetails', speech_text)


# @ask.intent('AMAZON.HelpIntent')
def help():
    speech_text = 'You can say hello to me!'

    # return question(speech_text) \
    #     .reprompt(speech_text) \
    #     .simple_card('HelloWorld', speech_text)


# @ask.session_ended
def session_ended():
    return '{}', 200


sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())
sb.add_request_handler(ExitIntentHandler())

skill_obj = sb.create()
skill_handler = sb.lambda_handler()

if __name__ == '__main__':
    # if 'ASK_VERIFY_REQUESTS' in os.environ:
    #     verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
    #     if verify == 'false':
    #         app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)
