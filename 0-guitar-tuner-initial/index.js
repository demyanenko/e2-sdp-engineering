'use strict';
const Alexa = require('ask-sdk-v1adapter');

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to Guitar Tuner, what note would you like me to play?');
    },
    'PlayNoteIntent': function () {
        this.emit(':tell', 'Hello');
    },
    'AMAZON.HelpIntent': function () {
        // This is triggered when users say "Help"
    },
    'AMAZON.CancelIntent': function () {
        // This is triggered when users say "Cancel"
    },
    'AMAZON.StopIntent': function () {
        // This is triggered when users say "Stop"
    },
    'AMAZON.NavigateHomeIntent': function () {
        // This is triggered when users say "Navigate Home"
    },
    'AMAZON.FallbackIntent': function () {
        // This is triggered when users say something that doesn't map to an intent
    },
    'SessionEndedRequest': function () {
        // This is triggered when users say "Exit"
    }
};

function getSlotValue(event, slotName) {
    let slot = event.request.intent.slots[slotName];
    let slotValue;
    try {
        // Resolve to the canonical value if available
        slotValue = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    } catch(err) {
        // Otherwise fallback to the raw text
        console.log(err.message);
        slotValue = slot.value;
    }
    
    console.log('User provided ' + slotName + ': ' + slotValue);
    return slotValue;
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};