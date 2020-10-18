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
    timeout: 5000,
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
function getBrunnenData(map){
  let brunnen = [];
  let artTypes = new Set();
  fetch("kunstWien.json")
  .then(response => response.json())

  .then(data => {
    data.features.forEach(artType =>{
      artTypes.add(artType.properties.TYP);
    })

    //Only once the data is loaded request adding the markers
    //addMarkers(brunnen,map);
    
  })
  console.log(artTypes);
};







//Start everything  
function initMap() {

  //Set variable so that they will be accessible to other function in the initMap
  let initialPosition;
  let map;
  let positionMarker;

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
      
      //Request data about the brunnen - this can be done only once the map has been created
      //getBrunnenData(map);
    },
    onError: err =>
      alert(`Error: ${getPositionErrorMessage(err.code) || err.message}`)
  });


  //Do real-time tracking of user's location
  trackLocation({
    onSuccess: ({coords: {latitude: lat, longitude: lng}}) => {
      positionMarker.setPosition({lat, lng});
      //map.panTo({lat, lng}); //Continuously center the map to the user's postion
    },
    onError: err =>
      alert(`Error: ${getPositionErrorMessage(err.code) || err.message}`)
  });

}