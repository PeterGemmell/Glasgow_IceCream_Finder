import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import MapAutoComplete from '../components/MapAutoComplete';
import MapMarker from '../components/MapMarker';
import PlaceCard from '../components/PlaceCard';
import ConstraintSlider from '../components/ConstraintSlider';

import { Button, Input, Divider, message } from 'antd';

const GLA_COOR = { lat: 55.8642, lng: 4.2518 };


class MapContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
    constraints: [{ name: '', time: 0}],
    searchResults: [],
    mapsLoaded: false,
    markers: [],
    map: {},
    mapsApi: {},
    glasgowLatLng: {},
    autoCompleteService: {},
    placesService: {},
    geoCoderService: {},
    directionService: {},
  };
  }

  // Update name for constraint with index === key.
  updateConstraintName = ((event, key) => {
    event.preventDefault();
    const prevConstraints = this.state.constraints;
    const constraints = Object.assign([], prevConstraints);
    constraints[key].name = event.target.value;
    this.setState({ constraints });
  });

  // Updates distance (in KM) for constraint with index == key.
  updateConstraintTime = ((key, value) => {
  const prevConstraints = this.state.constraints;
  const constraints = Object.assign([], prevConstraints);
  constraints[key].time = value;
  this.setState({ constraints });
});

// Adds a Marker to the GoogleMaps component.
addMarker = ((lat, lng, name) => {
  const prevMarkers = this.state.markers;
  const markers = Object.assign([], prevMarkers);

// If name already exists in marker list just replace lat & lng.
let newMarker = true;
for(let i=0; i <markers.length; i++){
  if(markers[i].name === name){
    newMarker = false;
    markers[i].lat = lat;
    markers[i].lng = lng;
    message.success(`Updated "${name}" Marker`);
    break;
  }
}
// Name does not exist in marker list. Create new marker.
if(newMarker) {
  markers.push({lat, lng, name});
  message.success(`Added new "${name}" Marker`);
}

this.setState({markers});
});

// Runs once when the Google Maps library is ready.
// Initializes all services that we need.
apiHasLoaded = ((map, mapsApi) => {
  this.setState({
    mapsLoaded: true,
    map,
    mapsApi,
    glasgowLatLng: new mapsApi.LatLng(GLA_COOR.lat, GLA_COOR.lng),
    autoCompleteService: new mapsApi.places.autoCompleteService(),
    placesService: new mapsApi.places.PlacesService(map),
    geoCoderService: new mapsApi.Geocoder(),
    directionService: new mapsApi.DirectionsService(),
  });
});

// With the constraints, find some places serving ice-cream.
handleSearch = (() => {
  const { markers, constraints, placesService, directionService, mapsApi } = this.state;
  if(markers.length === 0){
    message.warn('Add a constraint and try again!');
    return;
  }
  const filteredResults = [];
  const marker = markers[0];
  const timeLimit = constraints[0].time;
  const markerLatLng = new mapsApi.LatLng(marker.lat, marker.lng);

  const placesRequest = {
    location: markerLatLng,
    type: ['restaurant', 'cafe'],
    query: 'ice cream',
    rankBy: mapsApi.places.rankBy.DISTANCE,
  };

  // First, search for ice cream shops.
  placesService.textSearch(placesRequest, ((response) => {
  // Only look at the nearest top 5.
  const responseLimit = Math.min(5, response.length);
  for(let i=0; i < responseLimit; i++){
    const iceCreamPlace = response[i];
    const { rating, name } = iceCreamPlace;
    const address = iceCreamPlace.formated_address; // for example 5 Buchanan Street, Glasgow.
    const priceLevel = iceCreamPlace.price_level;
    let photoUrl = '';
    let openNow = false;
    if(iceCreamPlace.opening_hours){
      openNow = iceCreamPlace.opening_hours.open_now; // e.g true or false is it open.
    }
    if(iceCreamPlace.photos && iceCreamPlace.photos.length > 0){
      photoUrl = iceCreamPlace.photos[0].getUrl();
    }

    // Second, For each iceCreamPlace, check if it is within acceptable travelling distance.
    const directionRequest = {
      origin: markerLatLng,
      destination: address, // Address of the ice cream place.
      travelMode: 'DRIVING',
    }
    directionService.route(directionRequest, ((result, status) => {
      if(status !== 'OK') { return }
      const travellingRoute = result.routes[0].legs[0]; // { duration: { text: 1mins, value: 600 } }
      const travellingTimeInMinutes = travellingRoute.duration.value / 60;
      if(travellingTimeInMinutes < timeLimit){
        const distanceText = travellingRoute.distance.text; //for example 10kms away.
        const timeText = travellingRoute.duration.text; //for example its 15 mins away.
        filteredResults.push({
          name,
          rating,
          address,
          openNow,
          priceLevel,
          photoUrl,
          distanceText,
          timeText,
        });
      }
      // Finally, Add results to state.
      this.setState({ searchResults: filteredResults });
    }));
  }
 }));
});

render(){
  
}







}
