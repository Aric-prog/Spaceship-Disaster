let totalTaskDuration = 0;
socket.on("timer", function(timeInSec){
    $('timer').html('Time : '+ String(timeInSec))
});
socket.on("taskTimer", function(taskTime){
    let progressPercentage = ((taskTime / totalTaskDuration) * 100) >> 0
    $('taskTimer').css('width', String(progressPercentage) + '%')
    let green = ((progressPercentage / 100) * 255) >> 0
    let red = 255 - green
    let bgcArg = [red, green, 0]
    bgcArg.join(',')
    $('taskTimer').css('background-color', 'rgb(' + bgcArg + ')')
})
socket.on("newTask", function(taskString, duration){
    totalTaskDuration = duration
    $('task').html(taskString)
})
