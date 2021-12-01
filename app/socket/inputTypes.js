const typeToGeneric = {
    'lever' : 'binary', 
    'button' : 'binary', 
    'slider' : 'numeric', 
    'rotateDial' : 'numeric', 
    'keypad' : 'string', 
    'sequenceButton' : 'string', 
    'joystick' : 'numeric', 
    'toggle' : 'binary'
};

const genericToType = {
    'binary' : ['lever', 'button', 'toggle'],
    'numeric' : ['slider', 'rotateDial', 'joystick'],
    'string' : ['keypad', 'sequenceButton'],
}

const numericRange = {
    'slider' : 3,
    'rotateDial' : 3,
    'joystick' : 8
}

const stringRange = {
    'sequenceButton' : 4,
    'keypad' : 9
}

module.exports = {typeToGeneric, genericToType, numericRange, stringRange}