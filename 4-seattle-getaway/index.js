'use strict';
const Alexa = require('ask-sdk-v1adapter');
const https = require('https'); 

function distanceCallback(responseString, callbackParam) {
    let city = callbackParam[0];
    let emit = callbackParam[1];
    let responseJson = JSON.parse(responseString);
    let durationText = responseJson.rows[0].elements[0].duration.text;
    emit(':ask', 'Drive to ' + city + ' is going to be ' + durationText);
}

const handlers = {
    'LaunchRequest': function () {
        logEvent(this.event);

        this.emit(':ask', 'Which city would you like to go to?');
    },
    'PickCityIntent': function () {
        logEvent(this.event);
        
        let city = getSlotValue(this.event, 'city');
        let encodedCity = encodeURIComponent(city);
        
        // More about Google Distance Matrix API: https://developers.google.com/maps/documentation/distance-matrix/intro
        // Get your Google API key here: https://developers.google.com/maps/documentation/distance-matrix/start#get-a-key 
        httpGet(
            'maps.googleapis.com',
            '/maps/api/distancematrix/json?origins=Seattle,WA&destinations=' + encodedCity + '&key=YOUR_API_KEY',
            distanceCallback,
            [city, this.emit]);
        
        // httpGet() returns before the request is finished
        // We don't know the response here, callback will know it
        // Alexa will wait till callback calls emit()
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

function httpGet(host, path, callback, callbackParam) {
    console.log('Outgoing request host: ' + host);
    console.log('Outgoing request path: ' + path);
    console.log('Outgoing request callback param: ' + callbackParam);
    
    let options = {
        host: host,
        path: path,
        method: 'GET',
    };

    let req = https.request(options, res => {
        res.setEncoding('utf8');
        let responseString = '';
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log('Received response: ' + responseString);
            callback(responseString, callbackParam);
        });

    });
    req.end();
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
    alexa.execute();
};