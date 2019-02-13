import logging
import os
import sys
from json import load
from types import SimpleNamespace

import requests
from ask_sdk_core.api_client import DefaultApiClient
from ask_sdk_core.dispatch_components import (AbstractExceptionHandler, AbstractRequestHandler, AbstractRequestInterceptor, AbstractResponseInterceptor)
from ask_sdk_core.serialize import DefaultSerializer
from ask_sdk_core.skill_builder import CustomSkillBuilder
from ask_sdk_core.utils import is_intent_name, is_request_type
from ask_sdk_model import RequestEnvelope
from ask_sdk_model.services import ServiceException
from ask_sdk_model.ui import AskForPermissionsConsentCard
from flask import Flask, jsonify, request

sb = CustomSkillBuilder(api_client=DefaultApiClient())

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__name__)


app = Flask(__name__)

street = '316 east south temple'
city = 'salt lake city'
postal_code = 84109

permissions = ['alexa::devices:all:address:full:read']

WELCOME = 'Welcome to the Utah Voting Information Assistant. Ask your question or ask for help to be guided through the questions I can answer.'
WHAT_DO_YOU_WANT = 'Ask your question or ask for help to be guided through the questions I can answer.'
NOTIFY_MISSING_PERMISSIONS = 'Please enable Location permissions in the Amazon Alexa app.'
NO_ADDRESS = 'It looks like you do not have an address set. You can set your address from the companion app.'
ERROR = 'Uh Oh. Looks like something went wrong.'
AGRC_API_ERROR = 'Make sure your address is in Utah and is valid and try again.'


class LaunchRequestHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_request_type('LaunchRequest')(handler_input)

    def handle(self, handler_input):
        req_envelope = handler_input.request_envelope
        response_builder = handler_input.response_builder

        if not (req_envelope.context.system.user.permissions and req_envelope.context.system.user.permissions.consent_token):
            response_builder.speak(NOTIFY_MISSING_PERMISSIONS)
            response_builder.set_card(AskForPermissionsConsentCard(permissions=permissions))

            return response_builder.response

        try:
            service_client_fact = handler_input.service_client_factory
            device_id = req_envelope.context.system.device.device_id
            device_addr_client = service_client_fact.get_device_address_service()
            addr = device_addr_client.get_full_address(device_id)

            addr.address_line1 = street
            addr.city = city

            if addr.address_line1 is None or (addr.city and addr.postal_code is None):
                response_builder.speak(NO_ADDRESS)

                return response_builder.response
        except ServiceException:
            response_builder.speak(ERROR)

            return response_builder.response
        except Exception as e:
            raise e

        session_attributes = handler_input.attributes_manager.session_attributes
        session_attributes['address'] = {'street': addr.address_line1, 'zone': addr.city or addr.postal_code}

        handler_input.response_builder \
            .speak(WELCOME) \
            .ask(WHAT_DO_YOU_WANT) \
            .set_should_end_session(False)

        return handler_input.response_builder.response


class DistrictHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('DistrictIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        _, _, message = get_or_cache_location(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        senate, house, message = get_or_cache_districts(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        response_builder.speak('You are in senate district {} and house district {}'.format(senate, house)) \
            .ask('To find out who your state elected officials are, say, who are my state elected officials?')

        return handler_input.response_builder.response


class ElectedOfficialsHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('ElectedOfficialsIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        _, _, message = get_or_cache_location(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        senate, house, message = get_or_cache_districts(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        #: check for le service cache
        session_attributes = handler_input.attributes_manager.session_attributes
        if 'legislators' not in session_attributes:
            logger.info('cache miss: legislators')
            legislators = get_or_cache_legislators(senate, house)
            session_attributes['legislators'] = legislators

        senator = session_attributes['legislators']['senator']
        representative = session_attributes['legislators']['representative']

        def deabbrivate(party_abbr):
            if party_abbr == 'D':
                return 'democrat'
            elif party_abbr == 'R':
                return 'republican'
            else:
                logger.warn('unknown political party: %s', party_abbr)

                return party_abbr

        senator_party = deabbrivate(senator['party'])
        senator_name = senator['formatName']

        rep_party = deabbrivate(representative['party'])
        rep_name = representative['formatName']

        response_builder.speak('Your representative is {}, {} and your Senator is {}, {}.'.format(senator_party, senator_name, rep_party, rep_name)) \
            .ask('Would you like more information about your Senator or Representative? Say, senator or representative.')

        return response_builder.response


class ElectedOfficialDetailHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('ElectedOfficialDetailsIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        official = get_resolved_value(handler_input.request_envelope.request, 'house')
        if official is None:
            response_builder.speak('I didn\'t get that.')

            return response_builder.response

        _, _, message = get_or_cache_location(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        senate, house, message = get_or_cache_districts(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        session_attributes = handler_input.attributes_manager.session_attributes
        if 'legislators' not in session_attributes:
            logger.info('cache miss: legislators')
            legislators = get_or_cache_legislators(senate, house)
            session_attributes['legislators'] = legislators

        senator = session_attributes['legislators']['senator']
        represtative = session_attributes['legislators']['representative']

        if official == 'representative':
            data = represtative
        elif official == 'senator':
            data = senator

        response_builder.speak('{} is a {} with an education in {}. They became a {} on {}'.format(data['formatName'], data['profession'], data['education'], official, data['serviceStart']))

        return response_builder.response


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


class CatchAllExceptionHandler(AbstractExceptionHandler):
    '''Catch all exception handler, log exception and respond with custom message.
    '''

    def can_handle(self, handler_input, exception):
        return True

    def handle(self, handler_input, exception):
        logger.error(exception, exc_info=True)

        speech = "Sorry, there was some problem. Please try again!!"
        handler_input.response_builder.speak(speech).ask(speech)

        return handler_input.response_builder.response


class RequestLogger(AbstractRequestInterceptor):

    def process(self, handler_input):
        logger.debug("Request Envelope: {}".format(handler_input.request_envelope))


class ResponseLogger(AbstractResponseInterceptor):

    def process(self, handler_input, response):
        logger.debug("Response: {}".format(response))


class WebApi(object):

    def __init__(self, api_key):
        self._api_key = api_key
        self._url_template = "https://api.mapserv.utah.gov/api/v1/{}/{}/{}"

    def search(self, table, fields, options={}):
        options["apiKey"] = self._api_key

        return requests.get(self._url_template.format('search', table, ','.join(fields)), params=options)

    def geocode(self, street, zone, options={}):
        options["apiKey"] = self._api_key

        return requests.get(self._url_template.format('geocode', street, zone), params=options)


@app.route('/', methods=['POST'])
def main():
    Serializer = DefaultSerializer()
    request_envelope = Serializer.deserialize(request.data, RequestEnvelope)
    response_envelope = skill_obj.invoke(request_envelope=request_envelope, context=None)

    return jsonify(Serializer.serialize(response_envelope))


@app.route('/', methods=['GET'])
def development():
    return 'development server/ngrok connected'


def get_resolved_value(request, slot_name):
    try:
        return request.intent.slots[slot_name].value
    except (AttributeError, ValueError, KeyError, IndexError):
        return None


def supports_display(handler_input):
    try:
        if hasattr(handler_input.request_envelope.context.system.device.supported_interfaces, 'display'):
            return (handler_input.request_envelope.context.system.device.supported_interfaces.display is not None)
    except:
        return False


def get_or_cache_location(session_attributes):
    if 'location' in session_attributes:
        logger.info('cache hit: location')

        return session_attributes['location']['x'], session_attributes['location']['y'], None

    logger.info('cache miss: location')

    client = WebApi('AGRC-Uptime')

    address = session_attributes['address']

    r = client.geocode(address['street'], address['zone'])
    response = SimpleNamespace(**r.json())

    if r.status_code == 400 or response.status == 400:
        logger.warning('geocode issue: %r', response)

        return None, None, response.message
    elif r.status_code is not 200 or response.status is not 200:
        logger.warning('geocode issue: %r', response)

        return None, None, AGRC_API_ERROR

    result = response.result
    x = result['location']['x']
    y = result['location']['y']

    session_attributes['location'] = result['location']

    return x, y, None


def get_or_cache_districts(session_attributes):
    if 'districts' in session_attributes:
        logger.info('cache hit: districts')

        return session_attributes['districts']['senate'], session_attributes['districts']['house'], None

    logger.info('cache miss: districts')

    client = WebApi('AGRC-Uptime')

    location = session_attributes['location']

    #: query api for districts
    options = {'geometry': 'point:[{},{}]'.format(location['x'], location['y'])}
    r = client.search('sgid10.political.officialslookup', ['repdist', 'sendist'], options)

    response = SimpleNamespace(**r.json())

    if r.status_code == 400 or response.status == 400:
        logger.warning('district query issue: %r', response)

        return None, None, response.message
    elif r.status_code is not 200 or response.status is not 200:
        logger.warning('district query issue: %r', response)

        return None, None, AGRC_API_ERROR

    result = response.result[0]
    result = SimpleNamespace(**result)

    senate = result.attributes['sendist']
    house = result.attributes['repdist']

    session_attributes['districts'] = {'senate': senate, 'house': house}

    return senate, house, None


def get_or_cache_legislators(senate, house):
    #: query le service
    parent_directory = os.path.abspath(os.path.dirname(__file__))
    legislators_json = os.path.join(parent_directory, 'mock_data', 'le.utah.gov', 'legislators_endpoint.json')
    logger.debug('parent directory: {}'.format(parent_directory))
    logger.debug('json file: {}'.format(legislators_json))

    all_legislators = None
    with open(legislators_json) as json_file:
        all_legislators = load(json_file)['legislators']

    #: filter le results
    senator = [item for item in all_legislators if item['district'] == str(senate) and item['house'] == 'S'][0]
    representative = [item for item in all_legislators if item['district'] == str(house) and item['house'] == 'H'][0]

    return {
        'senator': senator,
        'representative': representative
    }

sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(DistrictHandler())
sb.add_request_handler(ElectedOfficialsHandler())
sb.add_request_handler(ElectedOfficialDetailHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(ExitIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())

sb.add_exception_handler(CatchAllExceptionHandler())

# Add response interceptor to the skill.
# sb.add_global_response_interceptor(CacheResponseForRepeatInterceptor())
sb.add_global_request_interceptor(RequestLogger())
sb.add_global_response_interceptor(ResponseLogger())

skill_obj = sb.create()
skill_handler = sb.lambda_handler()

if __name__ == '__main__':
    # if 'ASK_VERIFY_REQUESTS' in os.environ:
    #     verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
    #     if verify == 'false':
    #         app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)
