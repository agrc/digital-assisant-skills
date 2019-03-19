#!/usr/bin/env python
# * coding: utf8 *
'''
helping.py
A module that handles calls for help intents
'''
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name

from alexa import utils
from config import text


class Handler(AbstractRequestHandler):
    '''The intent invoked with a user asks for help'''

    def can_handle(self, handler_input):
        return is_intent_name('AMAZON.HelpIntent')(handler_input)

    def handle(self, handler_input):
        session = handler_input.attributes_manager.session_attributes

        if session['helping'] is None:
            handler_input.response_builder.speak(text.HELP_START) \
                .ask(text.HELP_START)

            session['helping'] = True
        elif session['helping']:
            slot = utils.get_resolved_value(handler_input.request_envelope.request, 'help')

            if slot == 'legislative':
                session['helping'] = 'legislative'
                handler_input.response_builder.speak(text.HELP_LEGISLATIVE) \
                    .ask(text.HELP_LEGISLATIVE)
            else:
                session['helping'] = 'voting'
                handler_input.response_builder.speak(text.HELP_VOTING) \
                    .ask(text.HELP_VOTING)

        return handler_input.response_builder.response
