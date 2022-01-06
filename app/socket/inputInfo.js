const typeToCategory = {
    'lever' : 'binary', 
    'button' : 'binary', 
    'slider' : 'numeric', 
    'rotatingDial' : 'numeric', 
    'keypad' : 'string', 
    'sequenceButton' : 'string', 
    'joystick' : 'numeric', 
    'toggle' : 'numeric'
};

const categoryToType = {
    'binary' : ['lever', 'button'],
    'numeric' : ['slider', 'rotatingDial', 'joystick'],
    'string' : ['keypad', 'sequenceButton'],
}

const indexTopanelType = ['button', 'slider', 'sequenceButton', 'lever', 'rotatingDial', 'joystick', 'keypad', 'toggle']

const numericRange = {
    'slider' : 3,
    'rotatingDial' : 3,
    'joystick' : 8,
    'toggle' : 3
}

const stringRange = {
    'sequenceButton' : 4,
    'keypad' : 9
}

module.exports = {typeToCategory, categoryToType, numericRange, stringRange, indexTopanelType}