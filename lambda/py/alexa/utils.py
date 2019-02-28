#!/usr/bin/env python
# * coding: utf8 *
'''
utils.py
A module that contains common things for working with alexa skill responses
'''


def get_resolved_value(request_envelope, slot_name):
    try:
        return request_envelope.intent.slots[slot_name].value
    except (AttributeError, ValueError, KeyError, IndexError):
        return None


def supports_display(handler_input):
    try:
        if hasattr(handler_input.request_envelope.context.system.device.supported_interfaces, 'display'):
            return handler_input.request_envelope.context.system.device.supported_interfaces.display is not None
    except AttributeError:
        return False

    return False
