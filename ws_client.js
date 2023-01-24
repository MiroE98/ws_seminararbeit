import WebSocket from 'ws';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();
let tempZaehlerstand = null;

function connect() {
    let ws = new WebSocket(`wss://iot.fhh-infra.de/api/v1/devices/${process.env.device}/readings/socket?auth=${process.env.apiKey}`);

    ws.on('open', function open() {
        console.log('[open] connection established');
        console.log('connected to ElementIoT');
        ws.ping();
        console.log('ping');
    });

    ws.on('message', async function message(data) {
        console.log(`received message: ${data}`);

        try {
            const json = JSON.parse(data);
            tempZaehlerstand = json[0].body.data.zahlerstand_m_3;
        await fetch(`http://localhost:8087/set/0_userdata.0.gaszaehler?val=${tempZaehlerstand}&prettyPrint`);
            console.log(`received Zaehlerstand: ${tempZaehlerstand}`);
        } catch (error) {
            console.log(error);
        }
    });

    ws.on('error', function (error) {
        console.log(error);
    });

    ws.on('close', function (){
        console.log('[close] connection closed');
        connect();
    });

    ws.on('pong', function () {
        console.log('received: pong');
        setTimeout(ping, 55000);
    });

    function ping() {
        ws.ping();
        console.log('ping');
    };
};

connect();
