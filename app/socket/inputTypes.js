const typeToGeneric = {
    'lever' : 'binary', 
    'button' : 'binary', 
    'slideBar' : 'numeric', 
    'rotateDial' : 'numeric', 
    'keypad' : 'string', 
    'sequence' : 'string', 
    'joystick' : 'numeric', 
    'toggle' : 'binary'
};

const genericToType = {
    'binary' : ['lever', 'button', 'toggle'],
    'numeric' : ['slideBar', 'rotateDial', 'joystick'],
    'string' : ['keypad', 'sequence'],
}

module.exports = {typeToGeneric, genericToType}