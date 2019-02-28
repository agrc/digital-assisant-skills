#!/usr/bin/env python
# * coding: utf8 *
'''
launch.py
A module that handles the launch request for the skill
'''

from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_request_type
from ask_sdk_model.services import ServiceException
from ask_sdk_model.ui import AskForPermissionsConsentCard

from config import permissions, text


class Handler(AbstractRequestHandler):

    def can_handle(self, handler_input):
        return is_request_type('LaunchRequest')(handler_input)

    def handle(self, handler_input):
        req_envelope = handler_input.request_envelope
        response_builder = handler_input.response_builder

        if not (req_envelope.context.system.user.permissions and req_envelope.context.system.user.permissions.consent_token):
            response_builder.speak(text.NOTIFY_MISSING_PERMISSIONS)
            response_builder.set_card(AskForPermissionsConsentCard(permissions=permissions.FULL_ADDRESS))

            return response_builder.response

        try:
            service_client_fact = handler_input.service_client_factory
            device_id = req_envelope.context.system.device.device_id
            device_addr_client = service_client_fact.get_device_address_service()
            addr = device_addr_client.get_full_address(device_id)

            #: uncomment for local development
            # addr.address_line1 = text.STREET
            # addr.city = text.CITY

            if addr.address_line1 is None or (addr.city and addr.postal_code is None):
                response_builder.speak(text.NO_ADDRESS)

                return response_builder.response
        except ServiceException:
            response_builder.speak(text.ERROR)

            return response_builder.response
        except Exception as exception:
            raise exception

        session_attributes = handler_input.attributes_manager.session_attributes
        session_attributes['address'] = {'street': addr.address_line1, 'zone': addr.city or addr.postal_code}


        handler_input.response_builder \
            .speak(text.WELCOME) \
            .ask(text.WHAT_DO_YOU_WANT) \
            .set_should_end_session(False)

        return handler_input.response_builder.response
