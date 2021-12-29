class Game {
    
    constructor(socket){
        this.socket = socket;
        this.generator = new Generators();
        this.round = 0;
        this.tempMeshList = [];
    }
    
    newRound(panels,order,scene,camera){
        this.generateControlPanel(panels,order,scene);
        this.animateCamera(camera);
    }

    animateCamera(camera){
        let animateRight, animateLeft;

        if(this.round%2 == 0){
            animateRight = false;
            animateLeft = true;
        } else {
            animateLeft = false;
            animateRight = true;
        }

        scene.onBeforeRenderObservable.add(() => {
            if(animateRight){
                if(camera.position.x > 0){
                    camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Right()).scale(0.5))}
                else{
                    animateRight = false
                    this.kurban(this.tempMeshList);
                }
            }
            if(animateLeft){
                if(camera.position.x < 50){
                    camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Left()).scale(0.5))}
                else{
                    animateLeft=false
                    this.kurban(this.tempMeshList);
                }
            }
        });
    }

    generateControlPanel(panels, order, scene){
        this.tempMeshList = this.generator.meshList.slice();
        this.generator.meshList = [];
        this.round+=1;
        const panel4 = {0:[1,2,2,4],1:[1,1,3,4],2:[1,2,3,3],3:[2,2,2,3]};
        const panel5 = {0:[1,2,2,2,2],1:[1,1,1,3,3],2:[1,1,1,2,4],3:[1,1,2,2,3]};
        const panel6 = {0:[1,1,1,1,1,4],1:[1,1,1,2,2,2],2:[1,1,1,1,2,3]}
        const generators = [this.generator.generateButton.bind(this.generator), this.generator.generateSlider.bind(this.generator), this.generator.generateSequenceButton.bind(this.generator), this.generator.generateLever.bind(this.generator), this.generator.generateRotatingDial.bind(this.generator), this.generator.generateJoyStick.bind(this.generator), this.generator.generateKeyPad.bind(this.generator), this.generator.generateToggleButton.bind(this.generator)];
        const orientations = ['horizontal','vertical'];
        let panelData = {}; // For communication {uid: name, uid2: name2}
        let x = (this.round%2 !=0)? 0:50;

        for(let i in panels){
            panelData[i] = panels[i]['name'];
        }
        let variation;
        switch(order.length){
            case 4: 
                variation = determineVariation(order,panel4);
                generatePanel4(panels, variation, scene,x);
                break;
            case 5:
                variation = determineVariation(order,panel5);
                generatePanel5(panels, variation, scene,x);
                break;
            case 6:
                variation = determineVariation(order,panel6);
                generatePanel6(panels, variation, scene,x);
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

        function generatePanel4(panels, variation, scene,x){
            let positions, specialCases;
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(x+-5,0,-5),
                        new BABYLON.Vector3(x+2.5,0,-5),
                        new BABYLON.Vector3(x+5,0,2.5),
                        new BABYLON.Vector3(x+-2.5,0,2.5)
                    ];
                    
                    specialCases = {1:'horizontal',2:'vertical'};
                    generatePanelHelper(panels, positions, specialCases, scene,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+0,0,5),
                        new BABYLON.Vector3(x+-5,0,0),
                        new BABYLON.Vector3(x+2.5,0,-2.5),
                    ];
                    specialCases = {2:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(x+5,0,0),
                        new BABYLON.Vector3(x+-2.5,0,0),
                        new BABYLON.Vector3(x+0,0,-5),
                        new BABYLON.Vector3(x+0,0,5),
                    ];
                    specialCases = {1:'horizontal',2:'horizontal',3:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;

                case 3:
                    positions = [
                        new BABYLON.Vector3(x+2.5,0,-5),
                        new BABYLON.Vector3(x+5,0,2.5),
                        new BABYLON.Vector3(x+0,0,2.5),
                        new BABYLON.Vector3(x+-5,0,0),
                    ];
                    specialCases = {0:'horizontal',1:'vertical',2:'vertical',3:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
            }
        }

        function generatePanel5(panels, variation, scene,x){
            let positions, specialCases;
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(x+5,0,-5),
                        new BABYLON.Vector3(x+-2.5,0,-5),
                        new BABYLON.Vector3(x+2.5,0,0),
                        new BABYLON.Vector3(x+2.5,0,5),
                        new BABYLON.Vector3(x+-5,0,2.5),
                    ];
                    specialCases = {1:'horizontal',2:'horizontal',3:'horizontal',4:'vertical'};
                    generatePanelHelper(panels, positions, specialCases, scene,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(x+5,0,-5),
                        new BABYLON.Vector3(x+5,0,0),
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+0,0,0),
                        new BABYLON.Vector3(x+-5,0,0),
                    ];
                    specialCases = {3:'vertical',4:'vertical'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(x+5,0,-5),
                        new BABYLON.Vector3(x+5,0,0),
                        new BABYLON.Vector3(x+-5,0,5),
                        new BABYLON.Vector3(x+2.5,0,5),
                        new BABYLON.Vector3(x+-2.5,0,-2.5),
                    ];
                    specialCases = {3:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;

                case 3:
                    positions = [
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+0,0,5),
                        new BABYLON.Vector3(x+2.5,0,0),
                        new BABYLON.Vector3(x+-5,0,2.5),
                        new BABYLON.Vector3(x+0,0,-5),
                    ];
                    specialCases = {2:'horizontal',3:'vertical',4:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
            }
        }

        function generatePanel6(panels, variation, scene,x){
            switch(variation){
                case 0:
                    positions = [
                        new BABYLON.Vector3(x+-5,0,-5),
                        new BABYLON.Vector3(x+-5,0,0),
                        new BABYLON.Vector3(x+-5,0,5),
                        new BABYLON.Vector3(x+0,0,5),
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+2.5,0,-2.5),
                    ];
                    specialCases = {};
                    generatePanelHelper(panels, positions, specialCases, scene,generators);
                    break;
                    
                case 1:
                    positions = [
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+-5,0,0),
                        new BABYLON.Vector3(x+-5,0,5),
                        new BABYLON.Vector3(x+0,0,2.5),
                        new BABYLON.Vector3(x+5,0,-2.5),
                        new BABYLON.Vector3(x+-2.5,0,-5),
                    ];
                    specialCases = {3:'vertical',4:'vertical',5:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
                
                case 2: 
                    positions = [
                        new BABYLON.Vector3(x+5,0,5),
                        new BABYLON.Vector3(x+5,0,0),
                        new BABYLON.Vector3(x+-5,0,0),
                        new BABYLON.Vector3(x+0,0,0),
                        new BABYLON.Vector3(x+-2.5,0,5),
                        new BABYLON.Vector3(x+0,0,-5),
                    ];
                    specialCases = {4:'horizontal',5:'horizontal'};
                    generatePanelHelper(panels,positions,specialCases,scene,generators);
                    break;
            }
        }

        function generatePanelHelper(panels, positions, specialCases, scene,generators){
            let index = 0
            for(let i in panels){
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
                else {
                    generators[panels[i].typeIndex](positions[index],scaling,scene,panels[i].name,i);
                }
                index += 1;
            }

        }

        function random(max) {
            const min = 1;
            let maxnumber = Math.floor(max);
            return Math.floor(Math.random() * (maxnumber - min + 1)) + min;
        }

    }

    kurban(meshList){
        for(let kambing of meshList){
            kambing.dispose()
        }
        
    }
}