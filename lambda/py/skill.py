#!/usr/bin/env python
# * coding: utf8 *
'''
skill.py
A module that creates an alexa skill for production and development use
'''

import logging
import sys

from ask_sdk_core.api_client import DefaultApiClient
from ask_sdk_core.serialize import DefaultSerializer
from ask_sdk_core.skill_builder import CustomSkillBuilder
from ask_sdk_model import RequestEnvelope
from flask import Flask, jsonify, request

from intents import defaults, district, launch, legislature, session
from alexa import log

SB = CustomSkillBuilder(api_client=DefaultApiClient())

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
LOGGER = logging.getLogger('alexa-skill')

APP = Flask(__name__)


@APP.route('/', methods=['POST'])
def main():
    serializer = DefaultSerializer()
    request_envelope = serializer.deserialize(request.data, RequestEnvelope)
    response_envelope = SKILL.invoke(request_envelope=request_envelope, context=None)

    return jsonify(serializer.serialize(response_envelope))


@APP.route('/', methods=['GET'])
def development():
    return 'development server/ngrok connected'


SB.add_request_handler(launch.Handler())
SB.add_request_handler(district.Handler())
SB.add_request_handler(legislature.Handler())
SB.add_request_handler(legislature.DetailsHandler())
SB.add_request_handler(session.Handler())
SB.add_request_handler(defaults.HelpIntentHandler())
SB.add_request_handler(defaults.ExitIntentHandler())
SB.add_request_handler(defaults.SessionEndedRequestHandler())

SB.add_exception_handler(defaults.CatchAllExceptionHandler())

# Add response interceptor to the skill.
# SB.add_global_response_interceptor(CacheResponseForRepeatInterceptor())
SB.add_global_request_interceptor(log.RequestLogger())
SB.add_global_response_interceptor(log.ResponseLogger())

SKILL = SB.create()
HANDLER = SB.lambda_handler()

if __name__ == '__main__':
    APP.run(debug=True)
