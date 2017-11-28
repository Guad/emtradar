/// <reference path="google.maps.d.ts" />
var api = fermata.json('api');
var mainMap = null;
var busesDict = {};
var updateRate = 30000;
var lastOpenedInfoWindow;
var mainInterval = null;
var mainFriendlyName = null;
function ready() {
    createMap();
}
function createMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.415998, -3.704095),
        zoom: 12
    };
    mainMap = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}
function clickButten() {
    var inp = document.getElementById('buslineSelection');
    var parada = Number(inp.value);
    startBusMonitor(parada);
}
function startBusMonitor(linea) {
    if (mainInterval) {
        clearInterval(mainInterval);
        for (var bus in busesDict) {
            if (busesDict[bus].marker.data.info)
                busesDict[bus].marker.data.info.close();
            if (busesDict[bus].marker.data.anim)
                clearInterval(busesDict[bus].marker.data.anim);
            busesDict[bus].marker.setMap(null);
        }
        busesDict = {};
    }
    mainFriendlyName = linea.toString();
    api.bus.line2label(linea).get(function (err, data) {
        if (data.found)
            mainFriendlyName = data.value;
    });
    mainInterval = setInterval(ponerBusesDeLinea, updateRate, linea);
    ponerBusesDeLinea(linea);
}
function ponerBusesDeLinea(linea) {
    api.bus.paradas(linea).get(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            var lin = data[i];
            api.bus(lin.id).get(function (err, data) {
                for (var j = 0; j < data.length; j++) {
                    var bus = data[j];
                    if (bus.lineId !== mainFriendlyName)
                        continue;
                    if (!busesDict[bus.busId]) {
                        busesDict[bus.busId] = bus;
                        busesDict[bus.busId].marker = createMarker(bus.latitude, bus.longitude);
                        attachInfoWindow(busesDict[bus.busId].marker, 'Bus #: ' +
                            bus.busId +
                            '<br>' +
                            'Linea: ' +
                            bus.lineId +
                            '<br>' +
                            'Dist Left: ' +
                            bus.busDistance +
                            'm<br>' +
                            'Destino: ' +
                            bus.destination);
                    }
                    else {
                        startAnimation(busesDict[bus.busId].marker, new google.maps.LatLng(bus.latitude, bus.longitude));
                    }
                }
            });
        }
    });
}
function startAnimation(marker, destination) {
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
    api.bus.paradas.get(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            var parada = data[i];
            var options = {
                position: new google.maps.LatLng(parada.lat, parada.long),
                //animation: google.maps.Animation.DROP,
                map: mainMap
            };
            var marker = new google.maps.Marker(options);
        }
    });
}
function fetchBuses(parada) {
    api.bus(parada).get(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            var bus = data[i];
            var marker = createMarker(bus.latitude, bus.longitude);
            attachInfoWindow(marker, 'Linea: ' + bus.lineId + '<br>' +
                'Destino: ' + bus.destination + '<br>' +
                'Distancia hasta parada: ' + bus.busDistance);
        }
    });
}
function createMarker(lat, long) {
    var options = {
        position: new google.maps.LatLng(lat, long),
        animation: google.maps.Animation.DROP,
        map: mainMap,
        icon: 'img/bus.png'
    };
    var myMarker = new google.maps.Marker(options);
    myMarker.data = {};
    return myMarker;
}
function attachInfoWindow(marker, content) {
    marker.data.info = new google.maps.InfoWindow({
        content: content
    });
    google.maps.event.addListener(marker, 'click', function () {
        if (lastOpenedInfoWindow)
            lastOpenedInfoWindow.close();
        marker.data.info.open(mainMap, marker);
        lastOpenedInfoWindow = marker.data.info;
    });
}
