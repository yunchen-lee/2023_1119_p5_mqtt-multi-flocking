/// *Flocking* ///----------------------------
let flocks = {};
let flocks_array;
// let flock;

/// *Html text element* ///-------------------
let h5;

/// *MQTT* ///--------------------------------
let mqtt_initialized = false;
let broker = {
    hostname: 'public.cloud.shiftr.io',
    port: 443
};

// MQTT client:
let client;

let creds = {
    clientID: 'p5Client',
    userName: 'public',
    password: 'public'
}

let subscribe_topicList = {
    "113XNature_KMFA/Animabotany": {
        "Radar": { min: 1, max: 5 },
        "Coral": { min: 0, max: 255 },
        "Airbag": { min: 220, max: 420 },
        population: 20,
        clr: "#ffc803",
        pos: [0, 0],
        desiredseparation: 20,
        r: 5
    },
    "113XNature_KMFA/Echoes": {
        "Volume": { min: 0, max: 1 },
        population: 20,
        clr: "#6b6960",
        pos: [100, 0],
        desiredseparation: 20,
        r: 5
    },
    "113XNature_KMFA/EMILS": {
        "Height": { min: 0, max: 4400 },
        "Blow": { min: 0, max: 1 },
        population: 20,
        clr: "#ffffff",
        pos: [20, 0],
        desiredseparation: 20,
        r: 5
    }
};

// # ======================================================================
function setup() {
    createCanvas(1080, 1920, WEBGL);
    // angleMode(DEGREES);
    background(220);

    // rotate_ang = 0;

    /// flock initialization
    // flock = new Flock({});
    // for (let i = 0; i < 100; i++) {
    //     let b = new Boid({ R: random(400, 800) });
    //     flock.addBoid(b);
    // }

    // subscribe_topicList.forEach(t => {
    //     let flock = new Flock({
    //         maxLength: t.population
    //     })

    //     let c = color(random(255), random(255), random(255));
    //     for (let i = 0; i < t.population; i++) {
    //         let b = new Boid({ R: random(400, 800), clr: c });
    //         flock.addBoid(b);
    //     }
    //     flocks[t.topic] = flock;
    // })
    // flocks_array = Object.values(flocks);
    // console.log(flocks)

    // console.log(Object.entries(subscribe_topicList));
    let subscribe_topicList_array = Object.entries(subscribe_topicList)
    subscribe_topicList_array.forEach(t => {
        let flock = new Flock({
            maxLength: t[1].population
        })
        for (let i = 0; i < t[1].population; i++) {
            let b = new Boid({
                R: random(400, 800),
                vec: createVector(3, 3),
                clr: t[1].clr,
                desiredseparation: t[1].desiredseparation,
                r: t[1].r
            });
            flock.addBoid(b);
        }
        flocks[t[0]] = flock;
    })

    flocks_array = Object.values(flocks);


    /// light setting
    ambientLight(200);
    directionalLight(255, 255, 255, 0, 0, 1);


    /// test for html element ---------
    // h5 = createElement('h5', 'im an h5 p5.element!');
    // h5.style('color', '#00a1d3');
    // console.log((windowWidth - width * windowHeight / height) / 2)
    // h5.position((windowWidth - width * windowHeight / height) / 2, 0);


    /// *MQTT* ///--------------------------------
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, broker.port, creds.clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect to the MQTT broker:
    client.connect({
        onSuccess: onConnect, // callback function for when you connect
        userName: creds.userName, // username
        password: creds.password, // password
        //useSSL: true // use SSL
        useSSL: true
    });


}


// # ======================================================================
function draw() {

    // /// draw background
    background(220);


    push();
    // rotate world axis
    rotateX(frameCount / 1500);
    rotateY(frameCount / 1500);
    rotateZ(frameCount / 1500);
    rotateX(PI / 3);
    rotateY(PI / 3);


    /// draw plane and axis
    stroke(0);
    line(0, 0, 800, 0, 0, -800);
    fill(230);
    rectMode(CENTER);
    rect(0, 0, 400, 400);

    // flock.run();
    flocks_array.forEach(f => {
        f.run();
    })


    // Set transparency for the sphere
    // 要最後畫透明度才會蓋過去
    fill(220, 150);
    noStroke();
    sphere(380);

    pop();



}

// # ======================================================================
function mouseClicked() {


    let x = 0;
    let y = 0;

    let topic = "113XNature_KMFA/Animabotany/Airbag".match(/\w*$/)[0];
    let flock_topic = "113XNature_KMFA/Animabotany/Airbag".match(/^\w*\/\w*/)[0];

    // console.log(flock_topic);
    // console.log(topic);
    // console.log(subscribe_topicList[flock_topic])


    // console.log(group)
    let b = new Boid({
            vec: createVector(3, 3),
            pos: createVector(x, y),
            R: 800,
            clr: subscribe_topicList[flock_topic].clr
        })
        // flock.addBoid(b);
    flocks[flock_topic].addBoid(b);
}

// function windowResized() {
//     h5.position((windowWidth - width * windowHeight / height) / 2, 0);
// }




/// *MQTT* ///--------------------------------
// called when a message arrives
function onMessageArrived(message) {
    // console.log('I got a message:' + message.payloadString + ", from: " + message.destinationName);
    // createP('got msg: <span style="background-color: #FFFF00">' + message.payloadString + "</span>, at " + hour() + ":" + minute() + ":" + second());
    // p.style("color:red;");

    // changeBgc_gotMsg = true;
    // changeCountDown = 0;
    // let x = 0;
    // let y = 0;

    let flock_topic = message.destinationName.match(/^\w*\/\w*/)[0];
    // let topic = "113XNature_KMFA/Animabotany/Airbag".match(/\w*$/)[0];

    let b = new Boid({
        vec: createVector(3, 3),
        pos: createVector(0, 0),
        R: 800,
        clr: subscribe_topicList[flock_topic].clr,
        pos: createVector(subscribe_topicList[flock_topic].pos[0], subscribe_topicList[flock_topic].pos[1]),
        desiredseparation: subscribe_topicList[flock_topic].desiredseparation,
        r: subscribe_topicList[flock_topic].r
    })
    flocks[flock_topic].addBoid(b);

}

function MQTT_subscribe(target_Topic) {
    client.subscribe(target_Topic)
    // console.log("Topic subscribed: " + target_Topic)
}


// called when the client connects
function onConnect() {
    console.log('client is connected');

    let sub_list = Object.keys(subscribe_topicList);
    // console.log(sub_list);
    sub_list.forEach(t => {
        MQTT_subscribe(t + "/#");
    })

}


// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) console.log('onConnectionLost:' + response.errorMessage);
}



// called when you want to send a message:
// function sendMqttMessage() {
//     // if the client is connected to the MQTT broker:
//     if (client.isConnected()) {
//         // start an MQTT message:
//         message = new Paho.MQTT.Message(input3.value());
//         // choose the destination topic:
//         message.destinationName = input2.value();
//         // send it:
//         client.send(message);
//         // print what you sent:
//         console.log('I sent: ' + message.payloadString);
//         createP('I sent: ' + message.payloadString);
//     }
// }       // choose the destination topic:
//         message.destinationName = input2.value();
//         // send it:
//         client.send(message);
//         // print what you sent:
//         console.log('I sent: ' + message.payloadString);
//         createP('I sent: ' + message.payloadString);
//     }
// }


function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}
