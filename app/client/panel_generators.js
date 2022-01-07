class Generators {
    constructor(socket){
        this.meshList = [];
        this.socket = socket
    }

    generateButton(position, scaling, scene, name, uid){
        const base = this.generateBase(scaling,position,'diagonal',name);
        const button = new BABYLON.MeshBuilder.CreateCylinder("button",{});
        this.meshList.push(button);
        const buttonMat = new BABYLON.StandardMaterial("buttonMat");
        const buttonScaling = new BABYLON.Vector3(3*scaling,0.5,3*scaling)
        buttonMat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        button.material = buttonMat;
        button.position = new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']+0.5*scaling);
        button.scaling = buttonScaling;

        button.actionManager = new BABYLON.ActionManager(scene);
        let downFlag = false;
        let _this = this;
        button.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                function () {
                    console.log(['cum',name,uid]);
                    // How javascript forces me to do this evilness
                    _this.socket.emit('binary', uid)
                    scene.registerBeforeRender(buttonCallback);
                }
            )
        );
        
        function buttonCallback(){
            if(downFlag == false){
                button.position.y -= 0.01;
                if(button.position.y < 0.2){downFlag = true}
            }
            else{
                button.position.y += 0.01;
                if(button.position.y > 0.49){
                    downFlag = false;
                    scene.unregisterBeforeRender(buttonCallback);}
            }
        }
        this.onHover(button,buttonMat,'blue');
    }

    generateBase(scaling,position,type,name,scene){
        const base = new BABYLON.MeshBuilder.CreateBox("base",{});
        this.meshList.push(base);
        const baseScaling = new BABYLON.Vector3(5,1,5);
        const textBase = new BABYLON.MeshBuilder.CreateBox("textBase",{});
        this.meshList.push(textBase);
        textBase.position = position;
        textBase.scaling = new BABYLON.Vector3(5,0.5,5);
        const textBasePlane = BABYLON.Mesh.CreatePlane('textBasePlane');
        textBasePlane.parent = textBase;
        textBasePlane.rotation = new BABYLON.Vector3(Math.PI/2,Math.PI,0);
        textBasePlane.position = (type == "vertical")? new BABYLON.Vector3(0,1.1,-0.4-(scaling-1)*0.50) : new BABYLON.Vector3(0,1.1,-0.4);
        if(type == 'diagonal'){
            textBasePlane.position.z -= 0.5 * (scaling-1);
        }
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(textBasePlane);
        const textBox = new BABYLON.GUI.TextBlock();
        textBox.color = "black";
        textBox.fontSize = 80;
        textBox.text = name;
        advancedTexture.addControl(textBox);

        if(type == "diagonal"){
            baseScaling['x'] *= scaling;
            baseScaling['z'] *= scaling;
        }
        else if(type == 'horizontal'){
            baseScaling['x'] *= scaling;
        }
        else if(type == "vertical"){
            baseScaling['z'] *= scaling;
        }
        const baseMat = new BABYLON.StandardMaterial("baseMat");
        baseMat.diffuseColor = new BABYLON.Color3(1,1,1);
        base.position = position;
        base.scaling = baseScaling;
        base.material = baseMat;
        
        const points = [
            new BABYLON.Vector3(position['x']-baseScaling['x']/2,position['y']+baseScaling['y']/2,position['z']-baseScaling['z']/2),
            new BABYLON.Vector3(position['x']-baseScaling['x']/2,position['y']+baseScaling['y']/2,position['z']+baseScaling['z']/2),
            new BABYLON.Vector3(position['x']+baseScaling['x']/2,position['y']+baseScaling['y']/2,position['z']+baseScaling['z']/2),
            new BABYLON.Vector3(position['x']+baseScaling['x']/2,position['y']+baseScaling['y']/2,position['z']-baseScaling['z']/2),
            ];
        points.push(points[0]);
        const outline = BABYLON.MeshBuilder.CreateLines("outline",{points:points});
        outline.isPickable = false;
        this.meshList.push(outline);
        outline.color = new BABYLON.Color3(0,0,0);
        
        return base;
    }

    generateSlider(position, scaling, scene, orientation,name,uid){
        const base = this.generateBase(scaling, position, orientation,name);
        let status = 0;
        const sliderBase = new BABYLON.MeshBuilder.CreateBox("sliderBase",{});
        this.meshList.push(sliderBase);
        const sliderBaseMat = new BABYLON.StandardMaterial("sliderBaseMat");
        const sliderBaseScaling = new BABYLON.Vector3(1,0.5,1);
        if(orientation == 'vertical'){
            sliderBaseScaling['z'] *= scaling*3
        } else {
            sliderBaseScaling['x'] *= scaling*3
        }
        sliderBase.position = new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']);
        sliderBase.scaling = sliderBaseScaling;
        const points = (orientation=='vertical')?
        [
            new BABYLON.Vector3(position['x']+sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']),
            new BABYLON.Vector3(position['x']-sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']),
        ]:[
            new BABYLON.Vector3(position['x'],sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']+sliderBaseScaling['z']/2),
            new BABYLON.Vector3(position['x'],sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']-sliderBaseScaling['z']/2),
        ]

        const midLine = BABYLON.MeshBuilder.CreateLines("midLine",{points:points});
        this.meshList.push(midLine);
        midLine.color = new BABYLON.Color3(1,0,0);
        sliderBaseMat.diffuseColor = new BABYLON.Color3(0,0,0);
        sliderBase.material = sliderBaseMat;
        
        const sliderButton = new BABYLON.MeshBuilder.CreateBox("sliderButton",{});
        this.meshList.push(sliderButton);
        const sliderButtonMat = new BABYLON.StandardMaterial("sliderButtonMat");
        const sliderButtonScaling = new BABYLON.Vector3(1,0.2,1);

        const minValue = (orientation == 'vertical')? position['z']-sliderButton.scaling['z']/2+(sliderBase.scaling['z'])/2:position['x']-sliderButton.scaling['x']/2+(sliderBase.scaling['x'])/2
        const maxValue = (orientation == 'vertical')? position['z']+sliderButton.scaling['z']/2-(sliderBase.scaling['z'])/2:position['x']+sliderButton.scaling['x']/2-(sliderBase.scaling['x'])/2
        const midValue = (orientation == 'vertical')? position['z']:position['x']
        const interval = (scaling == 3)? 2: (scaling == 2)? 1.5:1
        
        if(scaling != 1){
            const points1 = (orientation == 'vertical')?
            [
            new BABYLON.Vector3(position['x']+sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,midValue + interval),
            new BABYLON.Vector3(position['x']-sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,midValue + interval),
        ]:[
            new BABYLON.Vector3(midValue + interval,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']+sliderBaseScaling['z']/2),
            new BABYLON.Vector3(midValue + interval,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']-sliderBaseScaling['z']/2),
        ];
        
            const points2 = (orientation == 'vertical')?
            [
            new BABYLON.Vector3(position['x']+sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,midValue - interval),
            new BABYLON.Vector3(position['x']-sliderBaseScaling['x']/2,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,midValue - interval),
        ]:[
            new BABYLON.Vector3(midValue - interval,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']+sliderBaseScaling['z']/2),
            new BABYLON.Vector3(midValue - interval,sliderBase.position.y+sliderBaseScaling['y']/2+0.01,position['z']-sliderBaseScaling['z']/2),
        ];

        const midMaxLine = BABYLON.MeshBuilder.CreateLines("midLine",{points:points1});
        this.meshList.push(midMaxLine);
        const midMinLine = BABYLON.MeshBuilder.CreateLines("midMinLine",{points:points2})
        this.meshList.push(midMinLine);
        midMinLine.color = new BABYLON.Color3(1,0,0);
        midMaxLine.color = new BABYLON.Color3(1,0,0);
        }

        sliderButtonMat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        sliderButton.material = sliderButtonMat;
        sliderButton.scaling = sliderButtonScaling;
        sliderButton.position = new BABYLON.Vector3(position['x'],sliderBase.position.y+sliderBase.scaling['y']/2+sliderButton.scaling['y']/2,position['z']);
        sliderButton.actionManager = new BABYLON.ActionManager(scene);
        this.onHover(sliderButton,sliderButtonMat,'blue')

        const ghostMid = new BABYLON.MeshBuilder.CreateBox('ghostMid',{});
        const ghostMin = new BABYLON.MeshBuilder.CreateBox('ghostMin',{});
        const ghostMax = new BABYLON.MeshBuilder.CreateBox('ghostMax',{});
        this.meshList.push(ghostMid);
        this.meshList.push(ghostMin);
        this.meshList.push(ghostMax);
        const ghostKey = [ghostMin, ghostMid, ghostMax]
        ghostMid.position = (orientation == 'vertical')? new BABYLON.Vector3(position['x']+1,0,position['z']): new BABYLON.Vector3(position['x'],0,position['z']+1);
        ghostMin.position = (orientation == 'vertical')? new BABYLON.Vector3(position['x']+1,0,minValue+0.3): new BABYLON.Vector3(minValue+0.3,0,position['z']+1);
        ghostMax.position = (orientation == 'vertical')? new BABYLON.Vector3(position['x']+1,0,maxValue-0.3): new BABYLON.Vector3(maxValue-0.3,0,position['z']+1);

        
        const midDisplay = BABYLON.Mesh.CreatePlane('midDisplay');
        const minDisplay = BABYLON.Mesh.CreatePlane('minDisplay');
        const maxDisplay = BABYLON.Mesh.CreatePlane('maxDisplay');
        const displays = [minDisplay, midDisplay, maxDisplay];
        const texts = ["-1",'0','1'];
        if(scaling > 1){
            texts.splice(0,0,'-2');
            texts.push('2');
            const ghostMinMid = new BABYLON.MeshBuilder.CreateBox("ghostMinMid",{});
            const ghostMidMax = new BABYLON.MeshBuilder.CreateBox("ghostMidMax",{});
            this.meshList.push(ghostMinMid);
            this.meshList.push(ghostMidMax);
            ghostKey.splice(1,0,ghostMinMid);
            ghostKey.splice(3,0,ghostMidMax);
            const minMidDisplay = BABYLON.Mesh.CreatePlane('minMidDisplay');
            const midMaxDisplay = BABYLON.Mesh.CreatePlane('midMaxDisplay');
            displays.splice(1,0,minMidDisplay);
            displays.splice(3,0,midMaxDisplay);
            ghostMinMid.position = (orientation == 'vertical')? new BABYLON.Vector3(position['x']+1,0,minValue-1*(scaling-1)): new BABYLON.Vector3(minValue-1*(scaling-1),0,position['z']+1);
            ghostMidMax.position = (orientation == 'vertical')? new BABYLON.Vector3(position['x']+1,0,maxValue+1*(scaling-1)): new BABYLON.Vector3(maxValue+1*(scaling-1),0,position['z']+1);
        }
        for(let i of ghostKey){
            i.scaling = new BABYLON.Vector3(0.5,0.3,0.5);
        }
        for(let i = 0; i < displays.length; i++){
            displays[i].parent = ghostKey[i]
            displays[i].isPickable = false;
            displays[i].rotation = new BABYLON.Vector3(Math.PI/2,Math.PI,0);
            displays[i].position = new BABYLON.Vector3(0,2,0);
            let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(displays[i]);
            const textBox = new BABYLON.GUI.TextBlock();
            textBox.text = texts[i];
            textBox.color = "black";
            textBox.fontSize = 800;
            advancedTexture.addControl(textBox);
        }
        


        const pointerDragBehavior = (orientation == "vertical")? new BABYLON.PointerDragBehavior({dragAxis: new BABYLON.Vector3(0,0,1)}):new BABYLON.PointerDragBehavior({dragAxis: new BABYLON.Vector3(1,0,0)});
        sliderButton.addBehavior(pointerDragBehavior);
       
        pointerDragBehavior.onDragEndObservable.add((event)=>{
            let sliderPos = (orientation == 'vertical')? Math.round((sliderButton.position['z'])*10)/10 : Math.round(sliderButton.position['x']*10)/10;
            if(scaling == 1){
                if(sliderPos <= midValue-interval/2){status = 1}
                else if(sliderPos >= midValue+interval/2){status = -1}
                else {status = 0};
                
            }
            else{
                if(sliderPos <= minValue && sliderPos > midValue + interval){
                    if(sliderPos >= midValue + interval + interval/2){status = -2}
                    else {status = -1}
                }
                else if(sliderPos <= midValue + interval && sliderPos > midValue){
                    if(sliderPos >= midValue + interval/2) {status = -1}
                    else {status = 0}
                }
                else if(sliderPos >= midValue - interval && sliderPos < midValue){
                    if(sliderPos <= midValue - interval/2) {status = 1}
                    else {status = 0}
                }
                else if(sliderPos >= maxValue && sliderPos < midValue - interval){
                    if(sliderPos <= midValue - interval - interval/2){status = 2}
                    else {status = 1}
                }
            }
            sliderUpdate(status,sliderButton,maxValue,minValue,midValue,interval,name,uid);
         })
        pointerDragBehavior.validateDrag = (targetPosition)=>{
            if(orientation == 'vertical'){
                if(targetPosition.z > minValue){
                    targetPosition.z = minValue
                }
                
                if(targetPosition.z < maxValue){
                    return false
                }else{
                    return true
                }
        } else {
            if(targetPosition.x > minValue){
                    targetPosition.x = minValue
                }
                
                if(targetPosition.x < maxValue){
                    return false
                }else{
                    return true
                }
        }
        }
        function sliderUpdate(status,slider, max, min, mid, interval, name, uid){
            // console.log([status,name,uid])
            socket.emit('numeric', status, uid)
            switch(status){
                case -2:
                    if(orientation == 'vertical'){slider.position.z = min}
                    else{slider.position.x = min};
                    break;
                case -1:
                    if(orientation == 'vertical'){slider.position.z = mid + interval}
                    else{slider.position.x = mid+interval}
                    break;
                case 0:
                    if(orientation == 'vertical'){slider.position.z = mid}
                    else{slider.position.x = mid}
                    break;
                case 1:
                    if(orientation == 'vertical'){slider.position.z = mid - interval}
                    else{slider.position.x = mid - interval}
                    break;
                case 2:
                    if(orientation == 'vertical'){slider.position.z = max}
                    else{slider.position.x = max}
                    break;
                        
            }
        }
    }

    generateSequenceButton(position, scaling, scene,name,uid){
        const base = this.generateBase(scaling,position,'diagonal',name);
        const redButton = new BABYLON.MeshBuilder.CreateBox('redButton',{});
        this.meshList.push(redButton);
        const greenButton = new BABYLON.MeshBuilder.CreateBox('greenButton',{});
        this.meshList.push(greenButton);
        const yellowButton = new BABYLON.MeshBuilder.CreateBox('yellowButton',{});
        this.meshList.push(yellowButton);
        const blueButton = new BABYLON.MeshBuilder.CreateBox('blueButton',{});
        this.meshList.push(blueButton);
        const sequenceButton = [redButton,greenButton,yellowButton,blueButton];
        const redButtonMat = new BABYLON.StandardMaterial("redButtonMat");
        const greenButtonMat = new BABYLON.StandardMaterial("greenButtonMat");
        const yellowButtonMat = new BABYLON.StandardMaterial("yellowButtonMat");
        const blueButtonMat = new BABYLON.StandardMaterial("blueButtonMat");
        redButtonMat.diffuseColor = new BABYLON.Color3(0.5,0,0);
        greenButtonMat.diffuseColor = new BABYLON.Color3(0,0.5,0);
        yellowButtonMat.diffuseColor = new BABYLON.Color3(0.5,0.5,0);
        blueButtonMat.diffuseColor = new BABYLON.Color3(0,0,0.5);
        const sequenceButtonMat = [redButtonMat,greenButtonMat,yellowButtonMat,blueButtonMat]
        const sequenceButtonScaling = new BABYLON.Vector3(1.5*scaling,0.5,1.5*scaling);
        
        let sequenceButtonPos = [];
        sequenceButtonPos.push(new BABYLON.Vector3(position['x']+sequenceButtonScaling['x']/2,base.scaling.y/2,position['z']-sequenceButtonScaling['z']/2));
        sequenceButtonPos.push(new BABYLON.Vector3(position['x']+sequenceButtonScaling['x']/2,base.scaling.y/2,position['z']+sequenceButtonScaling['z']/2));
        sequenceButtonPos.push(new BABYLON.Vector3(position['x']-sequenceButtonScaling['x']/2,base.scaling.y/2,position['z']+sequenceButtonScaling['z']/2));
        sequenceButtonPos.push(new BABYLON.Vector3(position['x']-sequenceButtonScaling['x']/2,base.scaling.y/2,position['z']-sequenceButtonScaling['z']/2));
        
        for(let i = 0; i < sequenceButton.length;i++){
            let randomPos = sequenceButtonPos[Math.floor(Math.random() * sequenceButtonPos.length)];
            sequenceButton[i].position = randomPos;
            sequenceButtonPos = sequenceButtonPos.filter(function(e){return e != randomPos});
            sequenceButton[i].actionManager = new BABYLON.ActionManager(scene);
            sequenceButton[i].material = sequenceButtonMat[i];
            sequenceButton[i].scaling = sequenceButtonScaling;
        }
        
        let userSequence = [];
        
        function initButtonAction(button, buttonmat, color){
            let newColor = new BABYLON.Color3(0,0,0);
            if(color == 1){
                newColor = new BABYLON.Color3(1,0,0);
            } else if(color == 2){
                newColor = new BABYLON.Color3(0,1,0);
            } else if(color == 3){
                newColor = new BABYLON.Color3(0,0,1);
            } else{newColor = new BABYLON.Color3(1,1,0);}

            button.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function(){
                        scene.registerBeforeRender(sequenceButtonCallback);
                        if(userSequence.includes(color) == false){
                            buttonmat.diffuseColor = newColor;
                            userSequence.push(color);
                            userSequence = submitSequenceResult(userSequence, sequenceButtonMat,name,uid);
                        }

                        function sequenceButtonCallback(){
                            if(button.position.y > 0.3){
                                button.position.y -= 0.01;
                            } else{
                                if(userSequence.length == 0){
                                    scene.registerBeforeRender(sequenceButtonCallback2);
                                }
                                scene.unregisterBeforeRender(sequenceButtonCallback);
                            }
                        }
                        function sequenceButtonCallback2(){
                            for(let i = 0; i < sequenceButton.length; i++){
                                if(sequenceButton[i].position.y < 0.5){
                                    sequenceButton[i].position.y += 0.01
                                }
                            }
                            if(sequenceButton[0].position.y == 0.5 && sequenceButton[1].position.y == 0.5 && sequenceButton[2].position.y == 0.5 && sequenceButton[3].position.y == 0.5){
                                scene.unregisterBeforeRender(sequenceButtonCallback2);
                            }
                        }
                    }
                )
            )
        }

        function submitSequenceResult(userSequence, sequenceButtonMat,name,uid){
            if(userSequence.length == 4){
                sequenceButtonMat[0].diffuseColor = new BABYLON.Color3(0.5,0,0);
                sequenceButtonMat[1].diffuseColor = new BABYLON.Color3(0,0.5,0);
                sequenceButtonMat[2].diffuseColor = new BABYLON.Color3(0.5,0.5,0);
                sequenceButtonMat[3].diffuseColor = new BABYLON.Color3(0,0,0.5);
                
                console.log([userSequence,name,uid]);
                socket.emit('sequence', userSequence, uid)
                userSequence = [];
                return userSequence;
            } else {return userSequence;}
        }

        initButtonAction(redButton,redButtonMat, 1);
        initButtonAction(greenButton,greenButtonMat, 2);
        initButtonAction(blueButton,blueButtonMat, 3);
        initButtonAction(yellowButton,yellowButtonMat, 4);
    }

    generateLever(position, scaling, scene, orientation,name,uid){
        const base = this.generateBase(scaling,position,orientation,name);
        const lever = new BABYLON.MeshBuilder.CreateBox('lever',{});
        this.meshList.push(lever);
        const leverMat = new BABYLON.StandardMaterial('leverMat');
        const leverScaling = new BABYLON.Vector3(3,0.4,1);
        if(orientation == 'diagonal'){
            leverScaling['x'] *= scaling;
            leverScaling['z'] *= scaling;
        } else if(orientation == 'vertical'){
            leverScaling['z'] *= scaling;
        } else {leverScaling['x'] *= scaling}
        
        let leverState = 0;
        let _this = this
        leverMat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        lever.material = leverMat;
        lever.position = new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']);
        lever.scaling = leverScaling;
        lever.rotation.z = Math.PI*(30/180);
        const leverStatus = new BABYLON.MeshBuilder.CreateSphere("sphere", {slice: 0.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        this.meshList.push(leverStatus);
        const leverStatusMat = new BABYLON.StandardMaterial('leverStatusMat');
        leverStatusMat.diffuseColor = new BABYLON.Color3(1,0,0);
        leverStatus.material = leverStatusMat;
        leverStatus.position = new BABYLON.Vector3(position['x'] - base.scaling.x/2 + 0.5*scaling,lever.scaling['y']-0.2,position['z'] + base.scaling.z/2 - 0.5*scaling);

        lever.actionManager = new BABYLON.ActionManager(scene);
        lever.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                function () {
                    if(leverState == 0){
                        leverState = 1;
                        leverStatusMat.diffuseColor = new BABYLON.Color3(0,1,0);
                        _this.socket.emit('binary', uid)
                        scene.registerBeforeRender(leverCallback);
                    }
                    else {
                        leverState = 0;
                        leverStatusMat.diffuseColor = new BABYLON.Color3(1,0,0);
                        _this.socket.emit('binary', uid)
                        scene.registerBeforeRender(leverCallback);
                    }
                }
            )
        );
        function leverCallback(){
            if(leverState == 1){
                lever.rotation.z += Math.PI*(10/180);
                if(lever.rotation.z > Math.PI*(150/180)){
                    scene.unregisterBeforeRender(leverCallback);
                }
            } else{
                lever.rotation.z -= Math.PI*(10/180);;
                if(lever.rotation.z < Math.PI*(30/180)){
                    scene.unregisterBeforeRender(leverCallback);
                }
            }
        }
        this.onHover(lever,leverMat,'blue');
    }
    
    generateRotatingDial(position, scaling,scene,name,uid){
        const base = this.generateBase(scaling,position,'diagonal',name);
        const dialBase = new BABYLON.MeshBuilder.CreateCylinder("dialBase",{});
        this.meshList.push(dialBase);
        const dialPointer = new BABYLON.MeshBuilder.CreateBox("dialPointer",{});
        this.meshList.push(dialPointer);
        const dialPointerScaling = new BABYLON.Vector3(2.3*scaling,0.5,0.5*scaling);
        const dialBaseScaling = new BABYLON.Vector3(2.3*scaling,0.4,2.3*scaling);
        const dialBaseMat = new BABYLON.StandardMaterial('dialBaseMat');
        const dialPointerMat = new BABYLON.StandardMaterial('dialPointerMat');
        dialPointer.rotation.z = Math.PI*(15/180)
        dialBaseMat.diffuseColor = new BABYLON.Color3(0,0,0);
        dialPointerMat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        dialBase.material = dialBaseMat;
        dialPointer.material = dialPointerMat;

        dialBase.position = new BABYLON.Vector3(position['x'], base.scaling.y/2,position['z']+0.5*scaling)
        dialPointer.position = new BABYLON.Vector3(position['x']-0.1, dialBase.position.y + dialPointerScaling['y']/2 -0.24, position['z']+0.5*scaling);;
        dialPointer.scaling = dialPointerScaling;
        dialBase.scaling = dialBaseScaling;

        const ghostMin = new BABYLON.MeshBuilder.CreateBox('ghostMid',{});
        const ghostMidMin = new BABYLON.MeshBuilder.CreateBox('ghostMidMin',{});
        const ghostMidMax = new BABYLON.MeshBuilder.CreateBox('ghostMidMax',{});
        const ghostMax = new BABYLON.MeshBuilder.CreateBox('ghostMax',{});
        this.meshList.push(ghostMin);
        this.meshList.push(ghostMidMin);
        this.meshList.push(ghostMidMax);
        this.meshList.push(ghostMax);
        const ghostKey = [ghostMin, ghostMidMin, ghostMidMax, ghostMax]
        ghostMin.position = new BABYLON.Vector3(position['x']+1.5*scaling,0,position['z']+0.5*scaling)
        ghostMax.position = new BABYLON.Vector3(position['x']-1.5*scaling,0,position['z']+0.5*scaling)
        ghostMidMin.position = new BABYLON.Vector3(position['x']+0.8*scaling,0,position['z']-1*scaling)
        ghostMidMax.position = new BABYLON.Vector3(position['x']-0.8*scaling,0,position['z']-1*scaling)

        const minDisplay = BABYLON.Mesh.CreatePlane('minDisplay');
        const midMinDisplay = BABYLON.Mesh.CreatePlane('midMinDisplay');
        const midMaxDisplay = BABYLON.Mesh.CreatePlane('midMaxDisplay');
        const maxDisplay = BABYLON.Mesh.CreatePlane('maxDisplay');
        const displays = [minDisplay,midMinDisplay,midMaxDisplay,maxDisplay];
        const texts = ['0','1','2','3']

        for(let i of ghostKey){
            i.scaling = new BABYLON.Vector3(0.5*scaling,0.3,0.5*scaling);
        }

        for(let i = 0; i < displays.length; i++){
            displays[i].parent = ghostKey[i]
            displays[i].isPickable = false;
            displays[i].rotation = new BABYLON.Vector3(Math.PI/2,Math.PI,0);
            displays[i].position = new BABYLON.Vector3(0,2,0);
            let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(displays[i]);
            const textBox = new BABYLON.GUI.TextBlock();
            textBox.text = texts[i];
            textBox.color = "black";
            textBox.fontSize = 800
            advancedTexture.addControl(textBox);
        }

        dialPointer.actionManager = new BABYLON.ActionManager(scene);
        dialBase.actionManager = new BABYLON.ActionManager(scene);
        let currentPosition = {x: 0,y: 0 };
        let currentRotation = {x: 0,y: 0 };
        let clicked = false;
        let over = false;
        let status = 0;
        const midMin = 60;
        const midMax = 120;

        function updateStatus(rad, status, midMin, midMax){
            let angle = (180/Math.PI)*rad;
            const max = 180;
            const min = 0;
            const interval = max/3;
            if(angle > midMax && angle <= max){
                if(angle >= midMax + interval/2){status = 3}
                else{status = 2};
            }
            else if(angle >= midMin && angle < midMax){
                if(angle >= midMin + interval/2){status = 2}
                else{status = 1};
            }
            else if(angle >= min && angle < midMin){
                if(angle >= min + interval/2){status = 1}
                else{status = 0};
            }
            return status
        }

        function initDialAction(mesh){
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickDownTrigger,
                    function(){
                        over = true;
                    }
                )
            )
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickOutTrigger,
                    function() {
                        over = false;
                        status = updateStatus(dialPointer.rotation.y,status,midMin,midMax);
                        dialUpdate(dialPointer, status, midMin, midMax, name, uid);
                    }
                )
            )
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickUpTrigger,
                    function() {
                        over = false;
                        status = updateStatus(dialPointer.rotation.y,status,midMin,midMax);
                        dialUpdate(dialPointer, status, midMin, midMax, name, uid);
                    }
                )
            )
        }
        
        initDialAction(dialPointer);
        initDialAction(dialBase);

        canvas.addEventListener("pointerdown", function (evt) {
            currentPosition.x = evt.clientX;
            currentPosition.y = evt.clientY;
            currentRotation.x = dialPointer.rotation.x;
            currentRotation.y = dialPointer.rotation.y;
            clicked = true;
        });
        
        canvas.addEventListener("pointermove", function (evt) {
            if (!clicked) {
                return;
            }
            if(over == true){
                dialPointer.rotation.y = currentRotation.y + (evt.clientX - currentPosition.x) / 40.0;
                if(dialPointer.rotation.y < 0){dialPointer.rotation.y = 0};
                if(dialPointer.rotation.y > Math.PI){dialPointer.rotation.y = Math.PI}
            }
        });
        
        canvas.addEventListener("pointerup", function (evt) {
            clicked = false;
        });
        this.onHover(dialBase,dialPointerMat,'blue')
        this.onHover(dialPointer,dialPointerMat,'blue');   

        function dialUpdate(dialPointer, status, midMinDeg, midMaxDeg, name, uid){
            const min = 0;
            const max = Math.PI;
            const midMin = (Math.PI/180) * midMinDeg;
            const midMax = (Math.PI/180) * midMaxDeg;
            console.log([status, name, uid])
            socket.emit('numeric', status, uid)

            switch(status){
                case 0:
                    dialPointer.rotation.y = min;
                    break;
                case 1:
                    dialPointer.rotation.y = midMin;
                    break;
                case 2:
                    dialPointer.rotation.y = midMax;
                    break;
                case 3:
                    dialPointer.rotation.y = max;
                    break;
            }
        }

    }

    generateJoyStick(position, scaling, scene,name,uid){
        const base = this.generateBase(scaling, position, 'diagonal',name);
        const joyStickBase = new BABYLON.MeshBuilder.CreateBox('joyStickBase',{});
        this.meshList.push(joyStickBase);
        const joyStickBaseMat = new BABYLON.StandardMaterial('joyStickBaseMat');
        const joyStickBaseScaling = new BABYLON.Vector3(3*scaling,0.1,3*scaling);
        joyStickBaseMat.diffuseColor = new BABYLON.Color3(0,0,0);
        joyStickBase.material = joyStickBaseMat;
        joyStickBase.position = new BABYLON.Vector3(position['x'], base.scaling.y/2, position['z']+0.5*scaling);
        joyStickBase.scaling = joyStickBaseScaling;

        const joyStick = new BABYLON.MeshBuilder.CreateBox('joyStick',{});
        this.meshList.push(joyStick);
        const joyStickMat = new BABYLON.StandardMaterial('joyStickMat');
        const joyStickScaling = new BABYLON.Vector3(0.7,1,0.7);
        joyStickMat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        joyStick.material = joyStickMat;
        joyStick.position = new BABYLON.Vector3(position['x'],base.scaling.y/2 + joyStickScaling['y']/2,position['z']+0.5*scaling)
        joyStick.scaling = joyStickScaling;

        const ghostN = new BABYLON.MeshBuilder.CreateBox('ghostN',{});
        const ghostE = new BABYLON.MeshBuilder.CreateBox('ghostE',{});
        const ghostS = new BABYLON.MeshBuilder.CreateBox('ghostS',{});
        const ghostW = new BABYLON.MeshBuilder.CreateBox('ghostW',{});
        this.meshList.push(ghostN);
        this.meshList.push(ghostE);
        this.meshList.push(ghostS);
        this.meshList.push(ghostW);
        const ghostKey = [ghostN, ghostE, ghostS, ghostW]
        ghostN.position = new BABYLON.Vector3(position['x'],0,position['z']-1.25*scaling)
        ghostE.position = new BABYLON.Vector3(position['x']-joyStickBase.scaling.x/2-0.5,0,position['z']+0.5*scaling)
        ghostS.position = new BABYLON.Vector3(position['x'],0,base.position.z+base.scaling.z/2-0.25*scaling)
        ghostW.position = new BABYLON.Vector3(position['x']+joyStickBase.scaling.x/2+0.5,0,position['z']+0.5*scaling)

        const NDisplay = BABYLON.Mesh.CreatePlane('NDisplay');
        const EDisplay = BABYLON.Mesh.CreatePlane('EDisplay');
        const SDisplay = BABYLON.Mesh.CreatePlane('SDisplay');
        const WDisplay = BABYLON.Mesh.CreatePlane('WDisplay');
        const displays = [NDisplay,EDisplay,SDisplay,WDisplay];
        const texts = ['N','E','S','W']

        for(let i of ghostKey){
            i.scaling = new BABYLON.Vector3(0.5*scaling,0.3,0.5*scaling);
        }

        for(let i = 0; i < displays.length; i++){
            displays[i].parent = ghostKey[i]
            displays[i].isPickable = false;
            displays[i].rotation = new BABYLON.Vector3(Math.PI/2,Math.PI,0);
            displays[i].position = new BABYLON.Vector3(0,2,0);
            let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(displays[i]);
            const textBox = new BABYLON.GUI.TextBlock();
            textBox.text = texts[i];
            textBox.color = "black";
            textBox.fontSize = 800
            advancedTexture.addControl(textBox);
        }

        const points1 = [
            new BABYLON.Vector3(position['x']+joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']-joyStickBaseScaling['z']/2+0.5*scaling),
            new BABYLON.Vector3(position['x']-joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']+joyStickBaseScaling['z']/2+0.5*scaling),
        ]

        const points2 = [
            new BABYLON.Vector3(position['x']-joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']-joyStickBaseScaling['z']/2+0.5*scaling),
            new BABYLON.Vector3(position['x']+joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']+joyStickBaseScaling['z']/2+0.5*scaling),
        ]

        const points3 = [
            new BABYLON.Vector3(position['x'],joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']-joyStickBaseScaling['z']/2+0.5*scaling),
            new BABYLON.Vector3(position['x'],joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']+joyStickBaseScaling['z']/2+0.5*scaling),
        ]

        const points4 = [
            new BABYLON.Vector3(position['x']+joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']+0.5*scaling),
            new BABYLON.Vector3(position['x']-joyStickBaseScaling['x']/2,joyStickBase.position.y+joyStickBaseScaling['y']/2+0.01,position['z']+0.5*scaling),
        ]

        const line1 = BABYLON.MeshBuilder.CreateLines('line1',{points:points1});
        this.meshList.push(line1);
        const line2 = BABYLON.MeshBuilder.CreateLines('line2',{points:points2});
        this.meshList.push(line2);
        const line3 = BABYLON.MeshBuilder.CreateLines('line3',{points:points3});
        this.meshList.push(line3);
        const line4 = BABYLON.MeshBuilder.CreateLines('line4',{points:points4});
        this.meshList.push(line4);
        line1.color = new BABYLON.Color3(1,1,1);
        line2.color = new BABYLON.Color3(1,1,1);
        line3.color = new BABYLON.Color3(1,1,1);
        line4.color = new BABYLON.Color3(1,1,1);

        const lines = [line1,line2,line3,line4];

        joyStick.actionManager = new BABYLON.ActionManager(scene);
        const pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)});
        joyStick.addBehavior(pointerDragBehavior);
        this.onHover(joyStick,joyStickMat,'blue');
        const xMin = joyStickBase.position.x - joyStickBase.scaling['x']/2 + joyStick.scaling['x']/2
        const xMax = joyStickBase.position.x + joyStickBase.scaling['x']/2 - joyStick.scaling['x']/2
        const x2 = (xMax-xMin)/4+xMin;
        const x1 = xMax-(xMax-xMin)/4;
        const zMin = joyStickBase.position.z - joyStickBase.scaling['z']/2 + joyStick.scaling['z']/2
        const zMax = joyStickBase.position.z + joyStickBase.scaling['z']/2 - joyStick.scaling['z']/2
        const z1 = (zMax-zMin)/4+zMin;
        const z2 = zMax-(zMax-zMin)/4;
        let status = 0;

        const boundary = [xMin,xMax,zMin,zMax]
        pointerDragBehavior.onDragEndObservable.add((event)=>{
            let stickPos = {x:Math.round(joyStick.position['x']*100)/100,z:Math.round(joyStick.position['z']*100)/100}
            if(stickPos.x < x1 && stickPos.x > x2){
                if(stickPos.z <= z1){
                    status = 1;
                } else if(stickPos.z >= z2){
                    status = 5;
                }
                else{status = 0};
            }
            else if(stickPos.x >= x1){
                if(stickPos.z <= z1){
                    status = 8;
                } else if(stickPos.z >= z2){
                    status = 6;
                }
                else{status = 7;}
            } else if(stickPos.x <= x2){
                if(stickPos.z <= z1){
                    status = 2;
                } else if(stickPos.z >= z2){
                    status = 4;
                }
                else{status = 3;}
            }
            joyStickUpdate(status,boundary,joyStick,lines,name,uid)
         })
        pointerDragBehavior.validateDrag = (targetPosition)=>{
           
            if(targetPosition.z < zMin){
                targetPosition.z = zMin
            }
            
            if(targetPosition.x < xMin){
                targetPosition.x = xMin
            }

            if(targetPosition.x > xMax){
                targetPosition.x = xMax
            }

            if(targetPosition.z > zMax){
                return false
            }else{
                return true
            }
        
        }
        function joyStickUpdate(status, boundary, joyStick, lines,name,uid){  
            console.log([status,name,uid])
            const xMin = boundary[0];
            const xMax = boundary[1];
            const xMid = (xMax-xMin)/2 + xMin;
            const zMin = boundary[2];
            const zMax = boundary[3];
            const zMid = (zMax-zMin)/2 + zMin;
    
            switch(status){
                case 0:
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMid;
                    joyStick.position.z = zMid;
                    break;

                case 1:
                    lines[2].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMid;
                    joyStick.position.z = zMin;
                    socket.emit('numeric', status, uid)
                    break;
                
                case 2:
                    lines[1].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMin;
                    joyStick.position.z = zMin;
                    socket.emit('numeric', status, uid)
                    break;
                
                case 3:
                    lines[3].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMin;
                    joyStick.position.z = zMid;
                    socket.emit('numeric', status, uid)
                    break;

                case 4:
                    lines[0].color = new BABYLON.Color3(1,0,0);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMin;
                    joyStick.position.z = zMax;
                    socket.emit('numeric', status, uid)
                    break;

                case 5:
                    lines[2].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMid;
                    joyStick.position.z = zMax;
                    socket.emit('numeric', status, uid)
                    break;

                case 6:
                    lines[1].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMax;
                    joyStick.position.z = zMax;
                    socket.emit('numeric', status, uid)
                    break;

                case 7:
                    lines[3].color = new BABYLON.Color3(1,0,0);
                    lines[0].color = new BABYLON.Color3(1,1,1);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMax;
                    joyStick.position.z = zMid;
                    socket.emit('numeric', status, uid)
                    break;
                
                case 8:
                    lines[0].color = new BABYLON.Color3(1,0,0);
                    lines[1].color = new BABYLON.Color3(1,1,1);
                    lines[2].color = new BABYLON.Color3(1,1,1);
                    lines[3].color = new BABYLON.Color3(1,1,1);
                    joyStick.position.x = xMax;
                    joyStick.position.z = zMin;
                    socket.emit('numeric', status, uid)
                    break;
            }
            
        }
    }

    generateKeyPad(position, scaling, scene,name,uid){
        const base = this.generateBase(scaling, position, 'diagonal',name);
        const key1 = new BABYLON.MeshBuilder.CreateBox('key1',{});
        this.meshList.push(key1);
        const key2 = new BABYLON.MeshBuilder.CreateBox('key2',{});
        this.meshList.push(key2);
        const key3 = new BABYLON.MeshBuilder.CreateBox('key3',{});
        this.meshList.push(key3);
        const key4 = new BABYLON.MeshBuilder.CreateBox('key4',{});
        this.meshList.push(key4);
        const key5 = new BABYLON.MeshBuilder.CreateBox('key5',{});
        this.meshList.push(key5);
        const key6 = new BABYLON.MeshBuilder.CreateBox('key6',{});
        this.meshList.push(key6);
        const key7 = new BABYLON.MeshBuilder.CreateBox('key7',{});
        this.meshList.push(key7);
        const key8 = new BABYLON.MeshBuilder.CreateBox('key8',{});
        this.meshList.push(key8);
        const key9 = new BABYLON.MeshBuilder.CreateBox('key9',{});
        this.meshList.push(key9);   
        const keySubmit = new BABYLON.MeshBuilder.CreateBox('keySubmit',{});
        this.meshList.push(keySubmit);
        const keyDelete = new BABYLON.MeshBuilder.CreateBox('keyDelete',{});
        this.meshList.push(keyDelete);
        const keyCancel = new BABYLON.MeshBuilder.CreateBox('keyCancel',{});
        this.meshList.push(keyCancel);
        const keys = [key1,key2,key3,key4,key5,key6,key7,key8,key9,keyDelete,keyCancel,keySubmit];
        const keyScaling = new BABYLON.Vector3(1*scaling, 0.3, 0.7*scaling);
        const key1Mat = new BABYLON.StandardMaterial('key1Mat');
        const key2Mat = new BABYLON.StandardMaterial('key2Mat');
        const key3Mat = new BABYLON.StandardMaterial('key3Mat');
        const key4Mat = new BABYLON.StandardMaterial('key4Mat');
        const key5Mat = new BABYLON.StandardMaterial('key5Mat');
        const key6Mat = new BABYLON.StandardMaterial('key6Mat');
        const key7Mat = new BABYLON.StandardMaterial('key7Mat');
        const key8Mat = new BABYLON.StandardMaterial('key8Mat');
        const key9Mat = new BABYLON.StandardMaterial('key9Mat');
        const keySubmitMat = new BABYLON.StandardMaterial('keySubmitMat');
        const keyDeleteMat = new BABYLON.StandardMaterial('keyDeleteMat');
        const keyCancelMat = new BABYLON.StandardMaterial('keyCancelMat');
        const keyMat = [key1Mat,key2Mat,key3Mat,key4Mat,key5Mat,key6Mat,key7Mat,key8Mat,key9Mat,keyDeleteMat, keyCancelMat, keySubmitMat];
        
        keySubmitMat.diffuseColor = new BABYLON.Color3(0,0.6,0);
        keyCancelMat.diffuseColor = new BABYLON.Color3(0.6,0,0);
        keyDeleteMat.diffuseColor = new BABYLON.Color3(0.6,0.6,0);
        keyMat.diffuseColor = new BABYLON.Color3(0,0,0.6);

        const positions = [
            new BABYLON.Vector3(position['x']+ keyScaling['x']*1.5+0.2, base.scaling.y/2, position['z']-0.3+0.5*scaling),
            new BABYLON.Vector3(position['x']+ keyScaling['x']*0.5+0.1, base.scaling.y/2, position['z']-0.3+0.5*scaling),
            new BABYLON.Vector3(position['x']- keyScaling['x']*0.5, base.scaling.y/2, position['z']-0.3+0.5*scaling),
            
            new BABYLON.Vector3(position['x']+ keyScaling['x']*1.5+0.2, base.scaling.y/2, position['z']+keyScaling['z']-0.2+0.5*scaling),
            new BABYLON.Vector3(position['x']+ keyScaling['x']*0.5+0.1, base.scaling.y/2, position['z']+keyScaling['z']-0.2+0.5*scaling),
            new BABYLON.Vector3(position['x']- keyScaling['x']*0.5, base.scaling.y/2, position['z']+keyScaling['z']-0.2+0.5*scaling),

            new BABYLON.Vector3(position['x']+ keyScaling['x']*1.5+0.2, base.scaling.y/2, position['z']+keyScaling['z']*2-0.1+0.5*scaling),
            new BABYLON.Vector3(position['x']+ keyScaling['x']*0.5+0.1, base.scaling.y/2, position['z']+keyScaling['z']*2-0.1+0.5*scaling),
            new BABYLON.Vector3(position['x']- keyScaling['x']*0.5, base.scaling.y/2, position['z']+keyScaling['z']*2-0.1+0.5*scaling),
        ]

        const positions2 = [
            new BABYLON.Vector3(position['x']- keyScaling['x']*1.5-0.2, base.scaling.y/2, position['z']-0.3+0.5*scaling),
            new BABYLON.Vector3(position['x']- keyScaling['x']*1.5-0.2, base.scaling.y/2, position['z']+keyScaling['z']-0.2+0.5*scaling),
            new BABYLON.Vector3(position['x']- keyScaling['x']*1.5-0.2, base.scaling.y/2, position['z']+keyScaling['z']*2-0.1+0.5*scaling)
        ]
        let sequence = [];
        for(let i = 0; i < keys.length;i++){
            keys[i].scaling = keyScaling;
            keys[i].actionManager = new BABYLON.ActionManager(scene);
            keys[i].material = keyMat[i];
            
            if(i < 9){
                keyMat[i].diffuseColor = new BABYLON.Color3(0,0,0.6);
                this.onHover(keys[i],keyMat[i],'blue');
                keys[i].position = positions[i];
                initKeyPadAction(keys[i],i+1)
            }else{
                keys[i].position = positions2[i-9];
            }

        }
        const ghostkey1 = new BABYLON.MeshBuilder.CreateBox('ghostkey1',{});
        this.meshList.push(ghostkey1);
        const ghostkey2 = new BABYLON.MeshBuilder.CreateBox('ghostkey2',{});
        this.meshList.push(ghostkey2);
        const ghostkey3 = new BABYLON.MeshBuilder.CreateBox('ghostkey3',{});
        this.meshList.push(ghostkey3);
        const ghostkey4 = new BABYLON.MeshBuilder.CreateBox('ghostkey4',{});
        this.meshList.push(ghostkey4);
        const ghostkey = [ghostkey1,ghostkey2,ghostkey3,ghostkey4];
        ghostkey1.position = new BABYLON.Vector3(key1.position['x'],0,key1.position['z']);
        ghostkey2.position = new BABYLON.Vector3(key2.position['x'],0,key2.position['z']);
        ghostkey3.position = new BABYLON.Vector3(key3.position['x'],0,key3.position['z']);
        ghostkey4.position = new BABYLON.Vector3(keyDelete.position['x'],0,keyDelete.position['z']);
        for(let i = 0; i < ghostkey.length;i++){
            ghostkey[i].scaling = keyScaling;
        }
        this.onHover(keys[9],keyMat[9],'yellow');
        this.onHover(keys[10],keyMat[10],'red');
        this.onHover(keys[11],keyMat[11],'green');
        initKeyPadAction(keys[9],'Delete')
        initKeyPadAction(keys[10],'Cancel')
        initKeyPadAction(keys[11],'Submit')

        const textBoxes = [];
        const displayBackground = BABYLON.Mesh.CreatePlane('displayBackground');
        const displayBackgroundMat = new BABYLON.StandardMaterial('displayBackgroundMat');
        displayBackgroundMat.diffuseColor = new BABYLON.Color3(0,0,0);
        displayBackground.material = displayBackgroundMat;
        displayBackground.parent = base;
        displayBackground.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI, 0);
        displayBackground.position = new BABYLON.Vector3(0,base.scaling['y']/2+0.01,-0.18)
        displayBackground.scaling = new BABYLON.Vector3(0.9,0.2,0);

        const keyDisplay1 = BABYLON.Mesh.CreatePlane('keyDisplay1');
        const keyDisplay2 = BABYLON.Mesh.CreatePlane('keyDisplay2');
        const keyDisplay3 = BABYLON.Mesh.CreatePlane('keyDisplay3');
        const keyDisplay4 = BABYLON.Mesh.CreatePlane('keyDisplay4');
        const keyDisplay5 = BABYLON.Mesh.CreatePlane('keyDisplay5');
        const keyDisplay6 = BABYLON.Mesh.CreatePlane('keyDisplay6');
        const keyDisplay7 = BABYLON.Mesh.CreatePlane('keyDisplay7');
        const keyDisplay8 = BABYLON.Mesh.CreatePlane('keyDisplay8');
        const keyDisplay9 = BABYLON.Mesh.CreatePlane('keyDisplay9');
        const keyDisplayDel = BABYLON.Mesh.CreatePlane('keyDisplayDel');
        const keyDisplayCan = BABYLON.Mesh.CreatePlane('keyDisplayCan');
        const keyDisplaySub = BABYLON.Mesh.CreatePlane('keyDisplaySub');
        const keyDisplays = [keyDisplay1,keyDisplay2,keyDisplay3,keyDisplay4,keyDisplay5,keyDisplay6,keyDisplay7,keyDisplay8,keyDisplay9,keyDisplayDel,keyDisplayCan,keyDisplaySub];
        const keyTexts = ['1','2','3','4','5','6','7','8','9','↩','X','✓']

        for(let i = 0; i < keyDisplays.length; i++){
            keyDisplays[i].parent = keys[i];
            keyDisplays[i].isPickable = false;
            keyDisplays[i].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI, 0);
            keyDisplays[i].position = new BABYLON.Vector3(0, 0.51, 0);
            let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(keyDisplays[i]);
            const textBox = new BABYLON.GUI.TextBlock();
            textBox.text = keyTexts[i];
            textBox.color = "white";
            textBox.fontSize = 800;
            advancedTexture.addControl(textBox);
        }

        const display1 = BABYLON.Mesh.CreatePlane('display1');
        const display2 = BABYLON.Mesh.CreatePlane('display2');
        const display3 = BABYLON.Mesh.CreatePlane('display3');
        const display4 = BABYLON.Mesh.CreatePlane('display4');

        const displays = [display1, display2, display3, display4];
        for(let i = 0; i<displays.length; i++){
            displays[i].parent = ghostkey[i];
            displays[i].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI, 0);
            displays[i].position = new BABYLON.Vector3(0,1.8,-1.5-0.1*scaling);
            initTextBoxToPlane(displays[i]);
        }

        function initTextBoxToPlane(mesh){
            let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(mesh);
            const textBox = new BABYLON.GUI.TextBlock();
            textBox.color = "white";
            textBox.fontSize = 800;
            advancedTexture.addControl(textBox);
            textBoxes.push(textBox);
        }
        let downFlag = false;
        function initKeyPadAction(mesh, value){
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function(){
                        if(downFlag == false){
                            scene.registerBeforeRender(keypadCallback1);
                            if(value == 'Submit'){
                                sequence = submitKeyPadSequence(sequence,name,uid);
                                updateTextBox(sequence,textBoxes)
                            }

                            else if(value == 'Delete'){
                                if(sequence.length>=1){
                                    sequence.pop()
                                    updateTextBox(sequence,textBoxes)
                                }
                            }

                            else if (value == 'Cancel'){
                                sequence = []
                                updateTextBox(sequence,textBoxes)
                            }

                            else{
                                if(sequence.length<4){
                                sequence.push(value);
                                updateTextBox(sequence,textBoxes)
                                }
                            }
                            
                        }

                        function keypadCallback1(){
                            downFlag = true;
                            if(mesh.position.y > 0.15){
                                mesh.position.y -= 0.01;
                            } else{
                                scene.registerBeforeRender(keypadCallback2);
                                scene.unregisterBeforeRender(keypadCallback1);
                            }
                        }

                        function keypadCallback2(){
                            if(mesh.position.y < 0.5){
                                mesh.position.y += 0.01;
                            } else{
                                downFlag = false;
                                scene.unregisterBeforeRender(keypadCallback2);
                            }
                        }
                    }
                )
            )
        }

        function submitKeyPadSequence(sequence,name,uid){
            console.log([sequence,name,uid]);
            socket.emit('sequence', sequence, uid)
            sequence = [];
            return sequence;
        }
    
        function updateTextBox(sequence, textBoxes){
            for(let i = 0; i < textBoxes.length; i++){
                if(sequence[i] != undefined){
                    textBoxes[i].text = sequence[i];
                } else {
                    textBoxes[i].text = "";
                }
            }
        }

    }

    generateToggleButton(position,scaling,scene,orientation,name,uid){  
        const base = this.generateBase(scaling, position, orientation,name);
        const button1 = new BABYLON.MeshBuilder.CreateBox('button1',{});
        this.meshList.push(button1);
        const button2 = new BABYLON.MeshBuilder.CreateBox('button2',{});
        this.meshList.push(button2);
        const button3 = new BABYLON.MeshBuilder.CreateBox('button3',{});
        this.meshList.push(button3);
        const button1Mat = new BABYLON.StandardMaterial('button1Mat');
        const button2Mat = new BABYLON.StandardMaterial('button2Mat');
        const button3Mat = new BABYLON.StandardMaterial('button3Mat');
        button1Mat.diffuseColor = new BABYLON.Color3(0.6,0,0);
        button2Mat.diffuseColor = new BABYLON.Color3(0,0.6,0);
        button3Mat.diffuseColor = new BABYLON.Color3(0,0,0.6);
        const colors = [new BABYLON.Color3(0.6,0,0), new BABYLON.Color3(0,0.6,0), new BABYLON.Color3(0,0,0.6), new BABYLON.Color3(0.6,0.6,0), new BABYLON.Color3(0.6,0,0.6)];
        const buttonScaling = new BABYLON.Vector3(2,0.5,2);
        const buttons = [button1,button2,button3];
        const buttonMats = [button1Mat, button2Mat, button3Mat];
        let positions = (orientation == 'vertical')? [
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']-buttonScaling['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']+buttonScaling['z'])
        ] : [
        new BABYLON.Vector3(position['x']-buttonScaling['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x']+buttonScaling['x'],base.scaling.y/2,position['z'])
        ]
        if(scaling == 3){
            const button4 = new BABYLON.MeshBuilder.CreateBox('button4',{});
            this.meshList.push(button4);
            const button5 = new BABYLON.MeshBuilder.CreateBox('button5',{});
            this.meshList.push(button5);
            const button4Mat = new BABYLON.StandardMaterial('button4Mat');
            const button5Mat = new BABYLON.StandardMaterial('button5Mat');
            button4Mat.diffuseColor = new BABYLON.Color3(0.6,0.6,0);
            button5Mat.diffuseColor = new BABYLON.Color3(0.6,0,0.6);
            buttons.push(button4);
            buttons.push(button5);
            buttonMats.push(button4Mat);
            buttonMats.push(button5Mat);

            positions = (orientation == 'vertical')? [
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']-2*buttonScaling['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']-buttonScaling['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']+buttonScaling['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']+2*buttonScaling['z'])
        ] : [
            new BABYLON.Vector3(position['x']-2*buttonScaling['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x']-buttonScaling['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x']+buttonScaling['x'],base.scaling.y/2,position['z']),
            new BABYLON.Vector3(position['x']+2*buttonScaling['x'],base.scaling.y/2,position['z'])
        ]
            button4.actionManager = new BABYLON.ActionManager(scene);
            button5.actionManager = new BABYLON.ActionManager(scene);
            initToggleButtonAction(button4,button4Mat, 4);
            initToggleButtonAction(button5,button5Mat, 5);
        }
        for(let i = 0; i < buttons.length; i++){
            buttons[i].scaling = buttonScaling;
            buttons[i].position = positions[i];
            buttons[i].material = buttonMats[i];
            if(i <3){buttons[i].actionManager = new BABYLON.ActionManager(scene);}
        }
        
        initToggleButtonAction(button1,button1Mat, 1);
        initToggleButtonAction(button2,button2Mat, 2);
        initToggleButtonAction(button3,button3Mat, 3);

        function initToggleButtonAction(mesh, meshMat, color){
            let newColor = new BABYLON.Color3(0,0,0);
            if(color ===  1){
                newColor = new BABYLON.Color3(1,0,0);
            } else if(color ===  3){
                newColor = new BABYLON.Color3(0,0,1);
            } else if(color ===  2){
                newColor = new BABYLON.Color3(0,1,0);
            } else if(color ===  4){
                newColor = new BABYLON.Color3(1,1,0);
            } else{newColor = new BABYLON.Color3(1,0,1);}

            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function(){
                        console.log([color,name,uid]);
                        socket.emit('numeric', color, uid)
                        meshMat.diffuseColor = newColor;
                        scene.registerBeforeRender(toggleButtonCallback);
                        for(let i = 0;i<buttonMats.length;i++){
                            if(buttonMats[i] != meshMat){
                                buttonMats[i].diffuseColor = colors[i]
                            }
                        }

                        function toggleButtonCallback(){
                            for(let i = 0; i < buttons.length;i++){
                                if(buttons[i] != mesh){
                                    if(buttons[i].position.y < 0.5){
                                        buttons[i].position.y += 0.01
                                    }
                                }
                            }
                            if(mesh.position.y > 0.3){
                                mesh.position.y -= 0.01;
                            } else {
                                scene.unregisterBeforeRender(toggleButtonCallback);
                            }
                            
                        }
                    }
                )
            )
        }

    }

    onHover(mesh, material, color){
        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOverTrigger,
                function(){
                    if(color == 'blue'){
                        material.diffuseColor = new BABYLON.Color3(0,0,1);
                    }
                    else if(color == 'red'){
                        material.diffuseColor = new BABYLON.Color3(1,0,0);
                    }
                    else if(color == 'green'){
                        material.diffuseColor = new BABYLON.Color3(0,1,0);
                    }
                    else if(color == 'yellow'){
                        material.diffuseColor = new BABYLON.Color3(1,1,0);
                    }
                }
            )
        );
        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOutTrigger,
                function(){
                    const curColor = material.diffuseColor;
                    if(color == 'blue'){
                        material.diffuseColor = new BABYLON.Color3(0,0,0.6);
                    }
                    else if(color == 'red'){
                        material.diffuseColor = new BABYLON.Color3(0.6,0,0);
                    }
                    else if(color == 'green'){
                        material.diffuseColor = new BABYLON.Color3(0,0.6,0);
                    }
                    else if(color == 'yellow'){
                        material.diffuseColor = new BABYLON.Color3(0.6,0.6,0);
                    }
                }
            ),
            
        );
    }
     
}