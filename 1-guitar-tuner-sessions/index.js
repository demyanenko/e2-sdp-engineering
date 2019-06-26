'use strict';
const Alexa = require('ask-sdk-v1adapter');

const handlers = {
    'LaunchRequest': function () {
        logEvent(this.event);
        
        this.emit(':ask', 'Welcome to Guitar Tuner, what note would you like me to play?');
    },
    'PlayNoteIntent': function () {
        logEvent(this.event);
        
        let note = getSlotValue(this.event, 'note');
        setAttrValue(this.event, 'note', note);
        
        this.emit(':ask', 'What pitch would you like for ' + note + '?');
    },
    'SpecifyPitchIntent': function () {
        logEvent(this.event);
        
        let note = getAttrValue(this.event, 'note');
        let pitch = getSlotValue(this.event, 'pitch');
        
        this.emit(':ask', getNotePitchOutput(note, pitch));
    },
    'PlayNoteWithPitchIntent': function () {
        logEvent(this.event);
        
        let note = getSlotValue(this.event, 'note');
        let pitch = getSlotValue(this.event, 'pitch');
        
        this.emit(':ask', getNotePitchOutput(note, pitch));
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
        this.emit(':tell', 'Sorry, I couldn\'t understand you');
    },
    'SessionEndedRequest': function () {
        // This is triggered when users say "Exit"
    }
};

function getNotePitchOutput(note, pitch) {
    let output = 'You requested a note ' + note + ' with pitch ' + pitch;
    console.log('Output: ' + output);
    return output;
}

function getAttrValue(event, attrName) {
    var attrValue = event.session.attributes[attrName];
    console.log('Session has attribute ' + attrName + ': ' + attrValue);
    return attrValue;
}

function setAttrValue(event, attrName, attrValue) {
    event.session.attributes[attrName] = attrValue;
    console.log('Saved session attribute ' + attrName + ': ' + attrValue);
}

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

function logEvent(event) {
    console.log('Request:');
    console.log(JSON.stringify(event.request));
    console.log('Session:');
    console.log(JSON.stringify(event.session));
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};