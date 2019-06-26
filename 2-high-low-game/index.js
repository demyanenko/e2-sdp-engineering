'use strict';
const Alexa = require('ask-sdk-v1adapter');

const ALLOWED_HINTS = [ 'low', 'high' ];

function avg(n1, n2) {
    return Math.floor((n1 + n2) / 2);
}

const handlers = {
    'LaunchRequest': function () {
        logEvent(this.event);
        
        this.emit(':ask', 'Welcome to High Low Game. Think of a number between 1 and 100, and say "start" when ready.');
    },
    'StartIntent': function () {
        logEvent(this.event);
        
        let minGuess = 1;
        let maxGuess = 100;
        let guess = avg(minGuess, maxGuess);  
        
        setAttrValue(this.event, 'guessesLeft', 4);
        setAttrValue(this.event, 'minGuess', minGuess);
        setAttrValue(this.event, 'maxGuess', maxGuess);
        setAttrValue(this.event, 'lastGuess', guess);
        
        this.emit(':ask', produceGuessOutput(guess));
    },
    'HintIntent': function () {
        logEvent(this.event);
        
        let lastGuess = getAttrValue(this.event, 'lastGuess');
        let hint = getSlotValue(this.event, 'hint');
        if (!ALLOWED_HINTS.includes(hint)) {
            this.emit(':ask', 'Sorry, I didn\'t get your hint. Is ' + lastGuess + ' high, low or correct?');
            return;
        }
        
        let guessesLeft = getAttrValue(this.event, 'guessesLeft');
        if (guessesLeft === 0) {
            this.emit(':tell', 'I lost. Good game, thank you for playing!');
            return;
        }
        setAttrValue(this.event, 'guessesLeft', guessesLeft - 1);
        
        let minGuess, maxGuess;
        
        if (hint === 'low') {
            minGuess = lastGuess;
            setAttrValue(this.event, 'minGuess', minGuess);
            maxGuess = getAttrValue(this.event, 'maxGuess');
        } else {
            minGuess = getAttrValue(this.event, 'minGuess');
            maxGuess = lastGuess;
            setAttrValue(this.event, 'maxGuess', maxGuess);
        }
        
        let guess = avg(minGuess, maxGuess);
        setAttrValue(this.event, 'lastGuess', guess);
        this.emit(':ask', produceGuessOutput(guess));
    },
    'CorrectIntent': function () {
        logEvent(this.event);
        
        this.emit(':tell', 'Hooray! Thank you for playing!');
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

function produceGuessOutput(guess) {
    return guess + '. Is it high, low or correct?';
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