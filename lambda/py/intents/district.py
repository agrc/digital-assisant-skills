#!/usr/bin/env python
# * coding: utf8 *
'''
district.py
A module that handles district intents
'''
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name

from caching import cache


class Handler(AbstractRequestHandler):
    '''The default handler for district questions. Answers what political district an x,y location is in'''
    def can_handle(self, handler_input):
        return is_intent_name('DistrictIntent')(handler_input)

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

        response_builder.speak('You are in senate district {} and house district {}'.format(senate, house)) \
            .ask('To find out who your state elected officials are, say, who are my state elected officials?')

        return handler_input.response_builder.response
