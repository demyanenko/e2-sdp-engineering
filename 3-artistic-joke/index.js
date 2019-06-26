'use strict';
const Alexa = require('ask-sdk-v1adapter');

const MODIFIER_TO_PROSODY = {
    'quiet': 'volume="x-soft"',
    'loud': 'volume="x-loud"',
    'quick': 'rate="x-fast"',
    'slow': 'rate="x-slow"',
    'high': 'pitch="x-high"',
    'low': 'pitch="x-low"'
};

const ALLOWED_MODIFIERS = Object.keys(MODIFIER_TO_PROSODY);

const JOKES = [
    'Today at the bank, an old lady asked me to help check her balance. So I pushed her over.',
    'I couldn\'t figure out why the baseball kept getting larger. Then it hit me.',
    'I told my girlfriend she drew her eyebrows too high. She seemed surprised.',
    'My dog used to chase people on a bike a lot. It got so bad, finally I had to take his bike away.',
    'I\'m so good at sleeping. I can do it with my eyes closed.',
    'My boss told me to have a good day... so I went home.',
    'A woman walks into a library and asked if they had any books about paranoia. The librarian says "They\'re right behind you!"',
    'The other day, my wife asked me to pass her lipstick but I accidentally passed her a glue stick. She still isn\'t talking to me.',
    'Why do blind people hate skydiving? It scares the hell out of their dogs.',
    'When you look really closely, all mirrors look like eyeballs.'
];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function pickAJoke() {
    return JOKES[getRandomInt(JOKES.length)];
}

const handlers = {
    'LaunchRequest': function () {
        logEvent(this.event);

        this.emit(':ask', 'What kind of joke do you want to hear?');
    },
    'TellAJokeIntent': function () {
        logEvent(this.event);
        
        let joke = pickAJoke();
        this.emit(':ask', joke);
    },
    'WhisperAJokeIntent': function () {
        logEvent(this.event);
        
        let joke = pickAJoke();
        
        // Docs: https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html
        let ssmlResponse = '<amazon:effect name="whispered">' + joke + '</amazon:effect>';
        this.emit(':ask', ssmlResponse);
    },
    'ModifiedJokeIntent': function () {
        logEvent(this.event);
        
        let modifier = getSlotValue(this.event, 'modifier');
        if (!ALLOWED_MODIFIERS.includes(modifier)) {
            this.emit(':ask', 'I don\'t know that kind of jokes');
            return;
        }
        
        let joke = pickAJoke();
        let prosody = MODIFIER_TO_PROSODY[modifier];
        
        // Example: <prosody pitch="high">Pinnochio drowned</prosody>
        let ssmlResponse = '<prosody ' + prosody + '>' + joke + '</prosody>';
        this.emit(':ask', ssmlResponse);
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