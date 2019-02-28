#!/usr/bin/env python
# * coding: utf8 *
'''
log.py
A module that logs requests and responses from alexa
'''
import logging

from ask_sdk_core.dispatch_components import AbstractRequestInterceptor, AbstractResponseInterceptor

LOGGER = logging.getLogger('alexa-skill')


class RequestLogger(AbstractRequestInterceptor):

    def process(self, handler_input):
        LOGGER.debug('Request Envelope: %r', handler_input.request_envelope)


class ResponseLogger(AbstractResponseInterceptor):

    def process(self, handler_input, response):
        LOGGER.debug('Response: %r', response)
