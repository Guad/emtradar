/// <reference path="google.maps.d.ts" />

declare var fermata: any;
let api = fermata.json('api');
let mainMap: google.maps.Map = null;

let busesDict: { [id: number]: IBusData } = {};

let updateRate = 30000;
let lastOpenedInfoWindow: google.maps.InfoWindow;
let mainInterval = null;
let mainFriendlyName: string = null;


interface ILine {
    name: string;
    direction: number;
}

interface IParada {
    id: number;
    lines: ILine[];
    lat: number;
    long: number;
}

interface IBusData {
    lineId: string;
    destination: string;
    busId: number;
    busTimeLeft: number;
    busDistance: number;
    latitude: number,
    longitude: number,

    lastUpdate?: number;
    marker?: google.maps.Marker & { data: any };
}


function ready() {
    createMap();
}

function createMap() : void {
    var mapProp = {
        center: new google.maps.LatLng(40.415998, -3.704095),
        zoom: 12,
    };
    
    mainMap = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

function clickButten() {
    var inp: any = document.getElementById('buslineSelection');
    startBusMonitor(inp.value);
}

function clearBus(bus: IBusData): void {
    if (bus.marker.data.info)
        bus.marker.data.info.close();
    if (bus.marker.data.anim)
        clearInterval(bus.marker.data.anim);

    bus.marker.setMap(null);
}

function startBusMonitor(linea: string) {
    if (mainInterval) {
        clearInterval(mainInterval);

        for (var bus in busesDict) {
            clearBus(busesDict[bus]);
        }

        busesDict = {};
    }

    mainFriendlyName = linea;
    api.bus.label2line(linea).get((err, data) => {
        if (data.found) {
            mainInterval = setInterval(ponerBusesDeLinea, updateRate, linea);
            ponerBusesDeLinea(data.value);            
        } else {
            var linN: number = Number(linea);
            mainInterval = setInterval(ponerBusesDeLinea, updateRate, linN);
            ponerBusesDeLinea(linN);            
        }
    });

}

function ponerBusesDeLinea(linea: number): void {
    api.bus.paradas(linea).get((err, data) => {
        for (var i = 0; i < data.length; i++) {
            var lin: IParada = data[i];
            api.bus(lin.id).get((err, data) => {
                for (var j = 0; j < data.length; j++) {
                    var bus: IBusData = data[j];

                    if (bus.lineId !== mainFriendlyName)
                        continue;

                    if (!busesDict[bus.busId]) {
                        busesDict[bus.busId] = bus;
                        busesDict[bus.busId].marker = createMarker(bus.latitude, bus.longitude);
                        attachInfoWindow(busesDict[bus.busId].marker,
                            'Bus #: ' +
                            bus.busId +
                            '<br>' +
                            'Linea: ' +
                            bus.lineId +
                            '<br>' +
                            'Destino: ' +
                            bus.destination);
                    } else {
                        startAnimation(busesDict[bus.busId].marker, new google.maps.LatLng(bus.latitude, bus.longitude));
                    }

                    busesDict[bus.busId].lastUpdate = new Date().getTime();
                }
            });
        }
    });

    for (var key in busesDict) {
        if (busesDict.hasOwnProperty(key)) {
            if (busesDict[key].lastUpdate && new Date().getTime() - busesDict[key].lastUpdate > 60000)
            {
                clearBus(busesDict[key]);
                delete busesDict[key];
            }
        }
    }
}

function startAnimation(marker: google.maps.Marker & { data: any }, destination: google.maps.LatLng): void {
    if (marker.data.anim) {
        clearInterval(marker.data.anim);
        marker.data.anim = null;
    }

    var startPos = marker.getPosition();
    marker.data.anim = setInterval(animate, 33);
    var frame = 0;
    function animate() {
        frame++;
        if (frame * 33 > updateRate) {
            clearInterval(marker.data.anim);
            marker.data.anim = null;
            return;
        }

        var delta = (frame * 33) / updateRate;
        var long = (startPos.lng() + (destination.lng() - startPos.lng()) * delta);
        var lat = (startPos.lat() + (destination.lat() - startPos.lat()) * delta);

        marker.setPosition(new google.maps.LatLng(lat, long));
    }
}

function ponerTodasParadas() {
    api.bus.paradas.get((err, data) => {
        for (var i = 0; i < data.length; i++) {
            var parada: IParada = data[i];
            
            var options: google.maps.MarkerOptions = {
                position: new google.maps.LatLng(parada.lat, parada.long),
                //animation: google.maps.Animation.DROP,
                map: mainMap,
                //icon: 'img/bus.png'
            };

            var marker = new google.maps.Marker(options);
        }
    });
}


function fetchBuses(parada: number): void {
    api.bus(parada).get((err, data) => {
        for (var i = 0; i < data.length; i++) {
            var bus: IBusData = data[i];

            var marker = createMarker(bus.latitude, bus.longitude);

            attachInfoWindow(marker, 'Linea: ' + bus.lineId + '<br>' +
                'Destino: ' + bus.destination + '<br>' +
                'Distancia hasta parada: ' + bus.busDistance);
        }
    });
}

function createMarker(lat: number, long: number): google.maps.Marker & { data: any } {
    var options: google.maps.MarkerOptions = {
        position: new google.maps.LatLng(lat, long),
        animation: google.maps.Animation.DROP,
        map: mainMap,
        icon: 'img/bus.png'
    };

    var myMarker: any = new google.maps.Marker(options);
    myMarker.data = {};

    return myMarker;
}

function attachInfoWindow(marker: google.maps.Marker & { data: any}, content: string): void {
    marker.data.info = new google.maps.InfoWindow({
        content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
        if (lastOpenedInfoWindow)
            lastOpenedInfoWindow.close();
        marker.data.info.open(mainMap, marker);
        lastOpenedInfoWindow = marker.data.info;
    });
}