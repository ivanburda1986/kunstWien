//Create a map
const createMap = ({lat, lng}) =>{
  return new google.maps.Map(document.getElementById('map'),{
    center: {lat, lng},
    zoom: 13
  });
};

//Create a geolocation marker
const createGeoMarker = ({position, icon, map}) => {
  return new google.maps.Marker({position, icon, map});
};

//Get current position
const getCurrentPosition = ({onSuccess, onError = ()=>{}}) =>{
if('geolocation' in navigator === false){
  return onError(new Error ('Geolocation is not supported by your browser.'));
}
return navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

//Track location
const trackLocation = ({onSuccess, onError = () => {}}) =>{
  if('geolocation' in navigator === false){
    return onError(new Error('Geolocation is not supported in your browser.'));
  }
  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

//Get and evaluate position-retrieval related error messages
const getPositionErrorMessage = code => {
  switch(code){
    case 1:
      return 'Permission denied.';
    case 2:
      return 'Position unavailable';
    case 3:
      return 'Timeout reached';
  }
}


// Load external JSON data about the art objects
function getArtData(map, initialPosition, acceptableDistance){
  console.log(arguments);
  let artCollection = {};
  fetch("kunstWien.json")
  .then(response => response.json())
  .then(data => {
    //Here we take one art data item after another
    data.features.forEach(artObject =>{
      //If the artCollection object already has an entry representing the art-type of the specific art data item, we just push the item into the entry array
      if(artObject.properties.TYP in artCollection){
        if(getDistanceBetweenTwoPointsInM(initialPosition.lat,initialPosition.lng,artObject.geometry.coordinates[1],artObject.geometry.coordinates[0]) < acceptableDistance){
          pushData();
        }
      //Else we first create an entry representing the art type and push the art data item into it only afterwards
      } else{
        artCollection[artObject.properties.TYP] = [];
        if(getDistanceBetweenTwoPointsInM(initialPosition.lat,initialPosition.lng,artObject.geometry.coordinates[1],artObject.geometry.coordinates[0]) < acceptableDistance){
          pushData();
        }
      }
      //Pushes specific art data item into the entry-array of its type within the artCollection
      function pushData(){
        artCollection[artObject.properties.TYP].push({
          id: artObject.properties.ID,
          name: artObject.properties.OBJEKTTITEL,
          coordinates: {lat: artObject.geometry.coordinates[1], lng: artObject.geometry.coordinates[0]},
          buildIn: artObject.properties.ENTSTEHUNG,
          author: artObject.properties.KUENSTLER,
        });
      }

    })
    //Only once the data is loaded request adding the markers

      addMarkers(Object.entries(artCollection)[0][1],map);
      addMarkers(Object.entries(artCollection)[1][1],map);
      addMarkers(Object.entries(artCollection)[2][1],map);
      addMarkers(Object.entries(artCollection)[3][1],map);
      addMarkers(Object.entries(artCollection)[4][1],map);
      addMarkers(Object.entries(artCollection)[5][1],map);
      addMarkers(Object.entries(artCollection)[6][1],map);
  })
  console.log(initialPosition);
};

//Add a location marker onto the map
function addMarkers(artObjects,map){
  let artObjectMarkers = [];
  let infoWindows = [];
  artObjects.forEach(artObject =>{
    artObjectMarkers.push(new google.maps.Marker({position: artObject.coordinates, map: map})); //removed the label: {text: brunne.name, fontWeight: "500"},
    infoWindows.push(new google.maps.InfoWindow({content: `${artObject.name}, ${artObject.author}, ${artObject.buildIn}`}));
  });
  //Attach info windows
  attachInfoWindows(artObjectMarkers, infoWindows, map);
  //Once the markers have been added request clustering them
  clusterMarkers(artObjectMarkers, map);
}

//Cluster the markers
function clusterMarkers(artObjectMarkers, map){
  new MarkerClusterer(map, artObjectMarkers, {
    imagePath:
      "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  });
}

//Attach info windows to markers
function attachInfoWindows(artObjectMarkers, infoWindows, map){
  for(let i = 0; i<artObjectMarkers.length; i++){
    artObjectMarkers[i].addListener('click', ()=>{
      closeInfoWindows(infoWindows);
      infoWindows[i].open(map, artObjectMarkers[i]);
    });
  }
}

//Close all open info windows when a new one gets clicked
function closeInfoWindows(infoWindows){
  infoWindows.forEach(window =>{
    window.close();
  })
}



//Start everything  
function initMap() {

  //Set variable so that they will be accessible to other function in the initMap
  let initialPosition;
  let map;
  let positionMarker;
  const acceptableDistance = 500; //Art object located at this maximum distance (in meters) from the initial position should be displayed on the map.

  //Gets current location of the user
  getCurrentPosition({
    onSuccess: ({coords: {latitude:lat, longitude: lng}}) =>{
      //Sets the initial position to the current location of the user
      initialPosition = {lat, lng};

      //Requests creating a map center at to the position of the user
      map = createMap(initialPosition);
      
      //Create a marker for the user's position
      let geoMarkerIcon = 'myPositionDot.png';
      positionMarker = createGeoMarker({position:initialPosition, icon:geoMarkerIcon, map:map});
      
      //Request data about the artObject - this can be done only once the map has been created
      getArtData(map, initialPosition,acceptableDistance);
    },
    onError: err =>
      alert(`Error: ${getPositionErrorMessage(err.code) || err.message}`)
  });


  //Do real-time tracking of user's location
  trackLocation({
    onSuccess: ({coords: {latitude: lat, longitude: lng}}) => {
      positionMarker.setPosition({lat, lng});
      getArtData(map, initialPosition,acceptableDistance);
      //map.panTo({lat, lng}); //Continuously center the map to the user's postion
    },
    onError: err =>
      alert(`Error: ${getPositionErrorMessage(err.code) || err.message}`)
  });

}

function getDistanceBetweenTwoPointsInM(lat1,lng1,lat2,lng2){
  //
  var R = 6371;
  var dLat = deg2rad(lat2-lat1);
  var dLng = deg2rad(lng2-lng1);
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 1000; //distance in m
  return d;

function deg2rad(deg){
  return deg * (Math.PI/180);
}

}

