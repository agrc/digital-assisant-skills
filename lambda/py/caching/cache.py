#!/usr/bin/env python
# * coding: utf8 *
'''
cache.py
A module that handles getting and setting cache values
'''

import logging
import os
from json import load
from types import SimpleNamespace

from config import text
from services import api

LOGGER = logging.getLogger('alexa-skill')


def get_or_cache_location(session_attributes):
    '''A method to geocode an address and store the result returning the same valuue on subsequent requests'''
    if 'location' in session_attributes:
        LOGGER.info('cache hit: location')

        return session_attributes['location']['x'], session_attributes['location']['y'], None

    LOGGER.info('cache miss: location')

    client = api.Agrc('AGRC-Uptime')

    address = session_attributes['address']

    response = client.geocode(address['street'], address['zone'])
    response_data = SimpleNamespace(**response.json())

    if response.status_code == 400 or response_data.status == 400:
        LOGGER.warning('geocode issue: %r', response_data)

        return None, None, response_data.message

    if response.status_code != 200 or response_data.status != 200:
        LOGGER.warning('geocode issue: %r', response_data)

        return None, None, text.AGRC_API_ERROR

    result = response_data.result
    x_coord = result['location']['x']
    y_coord = result['location']['y']

    session_attributes['location'] = result['location']

    return x_coord, y_coord, None


def get_or_cache_districts(session_attributes):
    '''A method that searching for a political district and stores the result returning the same value on subsequent requests'''
    if 'districts' in session_attributes:
        LOGGER.info('cache hit: districts')

        return session_attributes['districts']['senate'], session_attributes['districts']['house'], None

    LOGGER.info('cache miss: districts')

    client = api.Agrc('AGRC-Uptime')

    location = session_attributes['location']

    #: query api for districts
    options = {'geometry': 'point:[{},{}]'.format(location['x'], location['y'])}
    response = client.search('sgid10.political.officialslookup', ['repdist', 'sendist'], **options)

    response_data = SimpleNamespace(**response.json())

    if response.status_code == 400 or response_data.status == 400:
        LOGGER.warning('district query issue: %r', response_data)

        return None, None, response_data.message

    if response.status_code != 200 or response_data.status != 200:
        LOGGER.warning('district query issue: %r', response_data)

        return None, None, text.AGRC_API_ERROR

    result = response_data.result[0]
    result = SimpleNamespace(**result)

    senate = result.attributes['sendist']
    house = result.attributes['repdist']

    session_attributes['districts'] = {'senate': senate, 'house': house}

    return senate, house, None


def get_or_cache_legislators(senate, house):
    '''A method that finds a legislator from a district and an H or R value'''
    all_legislators = get_all_legislators()

    #: filter le results
    senator = [item for item in all_legislators if item['district'] == str(senate) and item['house'] == 'S'][0]
    representative = [item for item in all_legislators if item['district'] == str(house) and item['house'] == 'H'][0]

    return {'senator': senator, 'representative': representative}


def get_all_legislators():
    '''Queries the le api and returns all the legislators'''
    #: TODO create le api service
    parent_directory = os.path.abspath(os.path.dirname(__file__))
    legislators_json = os.path.join(parent_directory, '..', 'mock_data', 'le.utah.gov', 'legislators_endpoint.json')

    with open(legislators_json) as json_file:
        return load(json_file)['legislators']
