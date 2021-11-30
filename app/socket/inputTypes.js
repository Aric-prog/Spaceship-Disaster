const typeToGeneric = {
    'lever' : 'binary', 
    'button' : 'binary', 
    'slideBar' : 'numeric', 
    'rotateDial' : 'numeric', 
    'keypad' : 'string', 
    'colorSequence' : 'string', 
    'joystick' : 'numeric', 
    'toggle' : 'binary'
};

const genericToType = {
    'binary' : ['lever', 'button', 'toggle'],
    'numeric' : ['slideBar', 'rotateDial', 'joystick'],
    'string' : ['keypad', 'colorSequence'],
}

const numericRange = {
    'slideBar' : 3,
    'rotateDial' : 3,
    'joystick' : 8
}

const stringRange = {
    'colorSequence' : 4,
    'keypad' : 9
}

module.exports = {typeToGeneric, genericToType, numericRange, stringRange}