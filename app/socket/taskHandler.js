const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')
const _ = require('lodash')

module.exports = function(io){
	let taskTimers = {}
	const panelType = ['lever', 'button', 'slideBar', 'rotateDial', 'keypad', 'sequence', 'joystick', 'toggle']
	
	const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose']
	const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle']
	
	// const createTask = function(playerInfo){
	// 	for(var sid of Object.keys(playerInfo)) {
	// 		// TODO: Create function to generate individual task here
	// 		playerInfo.sid.panelList;
			
	// 	};
	// }
	
	function createPanelForRoom(roomCode){
		redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
			if(err){
				console.log(err);
			} else{
				let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
				_.shuffle(roomSessionIDList);
				
				for(const sid of roomSessionIDList){
					let amountOfPanel = distribution.pop();
					let panelList = {};
					
					for(const i of Array(amountOfPanel).keys()){
						let firstNameIndex = Math.floor(Math.random() * firstNamePool.length);
						let secondNameIndex = Math.floor(Math.random() * secondNamePool.length);
						
						let randomName = firstNamePool[firstNameIndex] + secondNamePool[secondNameIndex];
						let type = panelType[Math.floor(Math.random() * panelType.length)];
						
						panelList[randomName] = type;
					}
					redisHelper.addPanelList(roomCode, sid, panelList);
				};
			}
		})
	}

	function createTaskFor(sid){
		// TODO : Create task generated from every panel type

	}

	io.on('connection', function(socket){
		const sessionID = socket.handshake.sessionID;
		socket.use(roomAbleToStart)
		socket.on('start', function(){
			// Generate panel distribution amount of 4,5,5,6
			
			let roomCode = socket.roomCode;
			let distribution = [4, 5, 5, 6]
			
			redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
				if(err){
					console.log(err);
				} else{
					let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
					_.shuffle(roomSessionIDList);
					
					// const callback = function(){
					// 	// Generate task list here from the available panels and their names
					// 	redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
					// 		if(err){
					// 			console.log(err);
					// 		}
					// 	})
					// }
					
					// Generates the panels here
					for(const sid of roomSessionIDList){
						let amountOfPanel = distribution.pop();
						let panelList = {};
						
						for(const i of Array(amountOfPanel).keys()){
							let firstNameIndex = Math.floor(Math.random() * firstNamePool.length);
							let secondNameIndex = Math.floor(Math.random() * secondNamePool.length);
							
							let randomName = firstNamePool[firstNameIndex] + secondNamePool[secondNameIndex];
							let type = panelType[Math.floor(Math.random() * panelType.length)];
							
							panelList[randomName] = type;
						}
						redisHelper.addPanelList(roomCode, sid, panelList);
					};
				}
			})
		})
		socket.on('error', function(err){
			console.log('err : ' + err);
		})
	})
}