const typeToGeneric = {
    'lever' : 'binary', 
    'button' : 'binary', 
    'slider' : 'numeric', 
    'rotatingDial' : 'numeric', 
    'keypad' : 'string', 
    'sequenceButton' : 'string', 
    'joystick' : 'numeric', 
    'toggle' : 'binary'
};

const genericToType = {
    'binary' : ['lever', 'button', 'toggle'],
    'numeric' : ['slider', 'rotatingDial', 'joystick'],
    'string' : ['keypad', 'sequenceButton'],
}

const indexTopanelType = ['button', 'slider', 'sequenceButton', 'lever', 'rotatingDial', 'joystick', 'keypad', 'toggle']

const numericRange = {
    'slider' : 3,
    'rotatingDial' : 3,
    'joystick' : 8
}

const stringRange = {
    'sequenceButton' : 4,
    'keypad' : 9
}

module.exports = {typeToGeneric, genericToType, numericRange, stringRange, indexTopanelType}