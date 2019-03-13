#!/usr/bin/env python
# * coding: utf8 *
'''
legislature.py
A module that handles requests for legislative information
'''
import logging

from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name

from alexa import utils
from caching import cache
from config import text

LOGGER = logging.getLogger('alexa-skill')


class Handler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('ElectedOfficialsIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        _, _, message = cache.get_or_cache_location(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        senate, house, message = cache.get_or_cache_districts(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        #: check for le service cache
        session_attributes = handler_input.attributes_manager.session_attributes
        if 'legislators' not in session_attributes:
            LOGGER.info('cache miss: legislators')
            legislators = cache.get_or_cache_legislators(senate, house)
            session_attributes['legislators'] = legislators

        senator = session_attributes['legislators']['senator']
        representative = session_attributes['legislators']['representative']

        def deabbrivate(party_abbr):
            if party_abbr == 'D':
                return 'democrat'

            if party_abbr == 'R':
                return 'republican'

            LOGGER.warning('unknown political party: %s', party_abbr)

            return party_abbr

        senator_party = deabbrivate(senator['party'])
        senator_name = senator['formatName']

        rep_party = deabbrivate(representative['party'])
        rep_name = representative['formatName']

        response_builder.speak(text.LEGISLATOR.format(senator_party, senator_name, rep_party, rep_name)) \
            .ask(text.LEGISLATOR_REPROMPT)

        return response_builder.response


class DetailsHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('ElectedOfficialDetailsIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        official = utils.get_resolved_value(handler_input.request_envelope.request, 'house')
        if official is None:
            response_builder.speak(text.UNKNOWN_SLOT)

            return response_builder.response

        _, _, message = cache.get_or_cache_location(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        senate, house, message = cache.get_or_cache_districts(handler_input.attributes_manager.session_attributes)

        if message is not None:
            response_builder.speak(message)

            return response_builder.response

        session_attributes = handler_input.attributes_manager.session_attributes
        if 'legislators' not in session_attributes:
            LOGGER.info('cache miss: legislators')
            legislators = cache.get_or_cache_legislators(senate, house)
            session_attributes['legislators'] = legislators

        senator = session_attributes['legislators']['senator']
        represtative = session_attributes['legislators']['representative']

        if official == 'representative':
            data = represtative
        elif official == 'senator':
            data = senator

        response_builder.speak(text.DETAILS.format(data['formatName'], data['profession'], data['education'], official, data['serviceStart']))

        return response_builder.response


class CountHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('LegislatorCountIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        all_legislators = cache.get_all_legislators()
        sens = 0
        reps = 0

        for legislator in all_legislators:
            if legislator['house'].lower() == 'h':
                reps += 1
            else:
                sens += 1

        response = text.COUNT.format(reps + sens, sens, reps)
        response_builder.speak(response) \
            .ask(text.COUNT_REPROMPT)

        return response_builder.response


class PartyStatsHandler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_intent_name('PartyStatsIntent')(handler_input)

    def handle(self, handler_input):
        response_builder = handler_input.response_builder

        all_legislators = cache.get_all_legislators()
        reps = 0
        dems = 0

        for legislator in all_legislators:
            if legislator['party'].lower() == 'd':
                dems += 1
            elif legislator['party'].lower() == 'r':
                reps += 1
            else:
                LOGGER.info(legislator['party'])

        total = reps + dems

        response_builder.speak(text.PARTY_STATS.format(dems, reps, dems/total, reps/total))

        return response_builder.response
