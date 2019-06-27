'use strict';
const Alexa = require('ask-sdk-v1adapter');

const handlers = {
    'LaunchRequest': function () {
        logEvent(this.event);
        
        let currValue = getCurrentValue(this.event);

        this.emit(':ask', 'Total is ' + currValue + '. How much would you like to add?');
    },
    'AddIntent': function () {
        logEvent(this.event);
        
        let prevValue = getCurrentValue(this.event);
        let deltaString = getSlotValue(this.event, 'delta');
        let delta = parseInt(deltaString, 10);
        let newValue = prevValue + delta;
        
        // Attributes are persisted by Alexa while session is active
        setAttrValue(this.event, 'total', newValue);
        
        this.emit(':ask', 'Total is ' + newValue);
    },
    'ClearIntent': function () {
        logEvent(this.event);
        
        setAttrValue(this.event, 'total', 0);
        
        this.emit(':ask', 'Total has been reset');
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
        
        // After this handler finishes, session is reset
        // It is our responsibility to save attributes into DynamoDB
        this.emit(':saveState', true);
    }
};

function getCurrentValue(event) {
    let value = getAttrValue(event, 'total');
    if (value === undefined) {
        value = 0;
    }
    return value;
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

function getAttrValue(event, attrName) {
    var attrValue = event.session.attributes[attrName];
    console.log('Session has attribute ' + attrName + ': ' + attrValue);
    return attrValue;
}

function setAttrValue(event, attrName, attrValue) {
    event.session.attributes[attrName] = attrValue;
    console.log('Saved session attribute ' + attrName + ': ' + attrValue);
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
    alexa.dynamoDBTableName = 'my-skill-table';
    alexa.execute();
};