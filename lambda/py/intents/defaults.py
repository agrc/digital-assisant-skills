#!/usr/bin/env python
# * coding: utf8 *
'''
defaults.py
A module that contains the default AMAZON intent implementations
'''
import logging

from ask_sdk_core.dispatch_components import AbstractExceptionHandler, AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name, is_request_type

from config import text

LOGGER = logging.getLogger('alexa-skill')


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
        handler_input.response_builder.speak(text.EXIT) \
            .set_should_end_session(True)

        return handler_input.response_builder.response


class CatchAllExceptionHandler(AbstractExceptionHandler):
    '''Catch all exception handler, log exception and respond with custom message.
    '''

    def can_handle(self, handler_input, exception):
        return True

    def handle(self, handler_input, exception):
        LOGGER.error(exception, exc_info=True)

        speech = 'Sorry, there was some problem. Please try again!!'
        handler_input.response_builder.speak(speech).ask(speech)

        return handler_input.response_builder.response
