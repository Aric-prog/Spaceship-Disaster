// File to accept extraInfo and taskType and turn it into human legible command

const _ = require('lodash')

const binaryVerbs = ['Toggle', 'Press', 'Flick'];
const stringVerbs = ['Input', 'Insert'];
const sequenceVerbs = ['Press', 'Push'];
const numericVerbs = ['Slide', 'Turn'];

const numToColor = {1 : 'red', 2 : 'green', 3 : 'blue', 4 : 'yellow', 5 : 'purple'}
// Each direction represented by 1 to 8 clockwise starting from north
const numToCardinal = {
    1 : 'north', 
    2 : 'northeast', 
    3 : 'east', 
    4 : 'southeast',
    5 : 'south',
    6 : 'southwest',
    7 : 'west',
    8 : 'northwest',
}
// Example sentences : 
// <Verb> <name> in order of <extraInfo>
const binaryToCommand = function(name){
    let commandString = `${_.sample(binaryVerbs)} ${name}`
    return commandString;
}
const sequenceButtonToCommand = function(name, string){
    const extraInfoToColor = function(string){
        let processedString = ""
        for(const i of string){
            processedString += numToColor[parseInt(i)] + ', '
        }
        return _.trim(processedString).slice(0, -1)
    } 
    let commandString = `${_.sample(sequenceVerbs)} ${name} in order of ${extraInfoToColor(string)}`
    return commandString;
}
const stringToCommand = function(name, string){
    let commandString = `${_.sample(stringVerbs)} ${string} into ${name}`
    return commandString;
}
const numericToCommand = function(name, string, type){
    let commandString = ""
    if(type === 'toggle'){
        commandString = `${_.sample(binaryVerbs)} ${numToColor[string]} on ${name}`
    } else if(type === 'joystick'){
        commandString = `${_.sample(numericVerbs)} ${numToCardinal[string]} on ${name}`
    } else{
        commandString = `${_.sample(numericVerbs)} to ${String(string)} on ${name}`
    }
    return commandString
}
const taskToCommand = function(task){
    let outputString = ""
    if(task.taskCategory === 'string'){
        if(task.taskType === 'sequenceButton'){
            outputString = sequenceButtonToCommand(task.taskName, task.extraInfo)
        } else{
            outputString = stringToCommand(task.taskName, String(task.extraInfo))
        }
    } else if(task.taskCategory === 'numeric'){
        outputString = numericToCommand(task.taskName, task.extraInfo, task.taskType)
    } else if(task.taskCategory === 'binary'){
        outputString = binaryToCommand(task.taskName)
    }
    return outputString
}
module.exports = {taskToCommand}