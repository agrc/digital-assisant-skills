import logging
import os
import requests

from flask import Flask
from flask_ask import Ask, request, session, question, statement

app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger('flask_ask').setLevel(logging.DEBUG)


@ask.launch
def launch():
    speech_text = (
        'Welcome to the Utah Voting Information Assistant. ' + 'To find out who your state elected officials are, say, Who are my state elected officials?'
    )

    return question(speech_text).reprompt(speech_text).simple_card('ElectedOfficials', speech_text)


@ask.intent('ElectedOfficialsIntent')
def elected_officials():
    speech_text = (
        'Your representative is Democrat Patrice M. Arent ' + 'and your Senator is Democrat Jani Iwamoto. Would you like more information ' +
        'about your Senator or Representative? Say, senator or representative.'
    )

    return question(speech_text).simple_card('ElectedOfficials', speech_text)


@ask.intent('ElectedOfficialsDetailsIntent')
def elected_officials_details(official):
    if official is None:
        return question('unknown')

    if official == 'representative':
        speech_text = '''Jani has straight hair. Would you like to call her? Say, call my representative.'''
    elif official == 'senator':
        speech_text = '''Patrice has curly hair. Would you like to call her? Say, call senator.'''
    else:
        speech_text = '''unknown'''

    return question(speech_text).simple_card('ElectedOfficialsDetails', speech_text)


@ask.intent('AMAZON.HelpIntent')
def help():
    speech_text = 'You can say hello to me!'

    return question(speech_text).reprompt(speech_text).simple_card('HelloWorld', speech_text)


@ask.session_ended
def session_ended():
    return "{}", 200


if __name__ == '__main__':
    if 'ASK_VERIFY_REQUESTS' in os.environ:
        verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
        if verify == 'false':
            app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)
