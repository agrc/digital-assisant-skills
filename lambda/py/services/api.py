#!/usr/bin/env python
# * coding: utf8 *
'''
api.py
A module that holds the classes that interact with webapis
'''
import requests


class Agrc():
    '''A class to interact with the agrc web api'''
    def __init__(self, api_key):
        self._api_key = api_key
        self._url_template = 'https://api.mapserv.utah.gov/api/v1/{}/{}/{}'

    def search(self, table, fields, **options):
        options['apiKey'] = self._api_key

        return requests.get(self._url_template.format('search', table, ','.join(fields)), params=options)

    def geocode(self, street, zone, **options):
        options['apiKey'] = self._api_key

        return requests.get(self._url_template.format('geocode', street, zone), params=options)
