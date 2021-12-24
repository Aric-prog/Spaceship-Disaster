class Game {
    constructor(){
        this.generator = new Generators();
    }

    generateControlPanel(panels, order, scene, camera){
        const panel4 = {0:[1,2,2,4],1:[1,1,3,4],2:[1,2,3,3],3:[2,2,2,3]};
        const panel5 = {0:[1,2,2,2,2],1:[1,1,1,3,3],2:[1,1,1,2,4],3:[1,1,2,2,3]};
        const panel6 = {0:[1,1,1,1,1,4],1:[1,1,1,2,2,2],2:[1,1,1,1,2,3]}
        const generators = [this.generator.generateButton, this.generator.generateSlider, this.generator.generateSequenceButton, this.generator.generateLever, this.generator.generateRotatingDial, this.generator.generateJoyStick, this.generator.generateKeyPad, this.generator.generateToggleButton];
        const orientations = ['horizontal','vertical'];
        let panelData = {}; // For communication {uid: name, uid2: name2}

        for(let i in panels){
            panelData[i] = panels[i]['name'];
        }
        let variation;
        switch(order.length){
            case 4:
                variation = determineVariation(order,panel4);
                generatePanel4(panels, variation, scene, camera);
                break;
            case 5:
                variation = determineVariation(order,panel5);
                generatePanel5(panels, variation, scene, camera);
                break;
            case 6:
                variation = determineVariation(order,panel6);
                generatePanel6(panels, variation, scene, camera);
                break;
        }
        function determineVariation(order, variationList){
            for(let i = 0; i < Object.keys(variationList).length; i++){
                let current = variationList[i];
                let counter = 0;
                for(let j = 0; j < current.length; j++){
                    if(current[j] == order[counter]){
                        counter += 1;
                        if(counter == order.length-1){
                            return i
                        }
                    } 
                }
            }
        }

        function generatePanel4(panels, variation, scene, camera){
            let positions, specialCases;
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(-5,0,-5),
                        new BABYLON.Vector3(2.5,0,-5),
                        new BABYLON.Vector3(5,0,2.5),
                        new BABYLON.Vector3(-2.5,0,2.5)
                    ];
                    specialCases = {1:'horizontal',2:'vertical'};
                    generatePanelHelper(panels, positions, specialCases, scene, camera,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(0,0,5),
                        new BABYLON.Vector3(-5,0,0),
                        new BABYLON.Vector3(2.5,0,-2.5),
                    ];
                    specialCases = {2:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(5,0,0),
                        new BABYLON.Vector3(-2.5,0,0),
                        new BABYLON.Vector3(0,0,-5),
                        new BABYLON.Vector3(0,0,5),
                    ];
                    specialCases = {1:'horizontal',2:'horizontal',3:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;

                case 3:
                    positions = [
                        new BABYLON.Vector3(2.5,0,-5),
                        new BABYLON.Vector3(5,0,2.5),
                        new BABYLON.Vector3(0,0,2.5),
                        new BABYLON.Vector3(-5,0,0),
                    ];
                    specialCases = {0:'horizontal',1:'vertical',2:'vertical',3:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
            }
        }

        function generatePanel5(panels, variation, scene, camera){
            let positions, specialCases;
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(5,0,-5),
                        new BABYLON.Vector3(-2.5,0,-5),
                        new BABYLON.Vector3(2.5,0,0),
                        new BABYLON.Vector3(2.5,0,5),
                        new BABYLON.Vector3(-5,0,2.5),
                    ];
                    specialCases = {1:'horizontal',2:'horizontal',3:'horizontal',4:'vertical'};
                    generatePanelHelper(panels, positions, specialCases, scene, camera,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(5,0,-5),
                        new BABYLON.Vector3(5,0,0),
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(0,0,0),
                        new BABYLON.Vector3(-5,0,0),
                    ];
                    specialCases = {3:'vertical',4:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(5,0,-5),
                        new BABYLON.Vector3(5,0,0),
                        new BABYLON.Vector3(-5,0,5),
                        new BABYLON.Vector3(2.5,0,5),
                        new BABYLON.Vector3(-2.5,0,-2.5),
                    ];
                    specialCases = {3:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;

                case 3:
                    positions = [
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(0,0,5),
                        new BABYLON.Vector3(2.5,0,0),
                        new BABYLON.Vector3(-5,0,2.5),
                        new BABYLON.Vector3(0,0,-5),
                    ];
                    specialCases = {2:'horizontal',3:'vertical',4:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
            }
        }

        function generatePanel6(panels, variation, scene, camera){
            let positions, specialCases;
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(-5,0,-5),
                        new BABYLON.Vector3(-5,0,0),
                        new BABYLON.Vector3(-5,0,5),
                        new BABYLON.Vector3(0,0,5),
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(2.5,0,-2.5),
                    ];
                    specialCases = {};
                    generatePanelHelper(panels, positions, specialCases, scene, camera,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(-5,0,0),
                        new BABYLON.Vector3(-5,0,5),
                        new BABYLON.Vector3(0,0,2.5),
                        new BABYLON.Vector3(5,0,-2.5),
                        new BABYLON.Vector3(-2.5,0,-5),
                    ];
                    specialCases = {3:'vertical',4:'vertical',5:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(5,0,5),
                        new BABYLON.Vector3(5,0,0),
                        new BABYLON.Vector3(-5,0,0),
                        new BABYLON.Vector3(0,0,0),
                        new BABYLON.Vector3(-2.5,0,5),
                        new BABYLON.Vector3(0,0,-5),
                    ];
                    specialCases = {4:'horizontal',5:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,camera,generators);
                    break;
            }
        }

        function generatePanelHelper(panels, positions, specialCases, scene, camera,generators){
            let index = 0
            console.log(this)
            for(let i in panels){
                console.log(index)
                let scaling = (panels[i].size > 3)? 2:panels[i].size;
                if(panels[i].typeIndex == 3 || panels[i].typeIndex == 1 || panels[i].typeIndex == 7){
                    if(Object.keys(specialCases).map(Number).includes(index)){
                        generators[panels[i].typeIndex](positions[index],scaling,scene, specialCases[index],panels[i].name,i);
                    }
                    else{
                        if(panels[i].typeIndex == 3){
                            
                            generators[panels[i].typeIndex](positions[index],scaling,scene, 'diagonal',panels[i].name,i);                            
                        }
                        else{
                            generators[panels[i].typeIndex](positions[index],scaling,scene, orientations[random(orientations.length)-1],panels[i].name,i);
                        }
                    }
                }
                else if(panels[i].typeIndex == 4){
                    generators[panels[i].typeIndex](positions[index],scaling,scene,camera,panels[i].name,i);
                }
                else {
                    generators[panels[i].typeIndex](positions[index],scaling,scene,panels[i].name,i);
                }
                index += 1;
            }

        }

        function random(max) {
            min = 1;
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    }

    testing(scene,camera){
        this.generator.generateButton(new BABYLON.Vector3(25,0,25),1,scene,'Button',"jjjjrjr")
        this.generator.generateSlider(new BABYLON.Vector3(20,0,20),1,scene,'horizontal','Slider','j')
        this.generator.generateSequenceButton(new BABYLON.Vector3(25,0,30),1,scene,'Sequence button','f')
        this.generator.generateLever(new BABYLON.Vector3(30,0,25),1,scene,'vertical','lever','l')
        this.generator.generateRotatingDial(new BABYLON.Vector3(30,0,20),1,scene,camera,'Rotating dial','rd')
        this.generator.generateJoyStick(new BABYLON.Vector3(30,0,30),1,scene,'Joystick','f')
        this.generator.generateKeyPad(new BABYLON.Vector3(25,0,20),1,scene,'Keypad','kp')
        this.generator.generateToggleButton(new BABYLON.Vector3(20,0,27.5),2,scene,'vertical','Toggle button','tb')
    }
}