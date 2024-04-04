"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import styles from "./page.module.css";
import Loader from "./components/loader/loader";

const LOCATIONS = [
  {
    name: "MG Road, Bangalore",
    coordinates: {
      lat: 12.9758,
      lng: 77.6045,
    },
  },
  {
    name: "Koramangala, Bangalore",
    coordinates: {
      lat: 12.9352,
      lng: 77.6245,
    },
  },
  {
    name: "Indiranagar, Bangalore",
    coordinates: {
      lat: 12.9784,
      lng: 77.6408,
    },
  },
  {
    name: "Whitefield, Bangalore",
    coordinates: {
      lat: 12.9698,
      lng: 77.7499,
    },
  },
  {
    name: "Jayanagar, Bangalore",
    coordinates: {
      lat: 12.9308,
      lng: 77.5838,
    },
  },
  {
    name: "Electronic City, Bangalore",
    coordinates: {
      lat: 12.8456,
      lng: 77.6603,
    },
  },
  {
    name: "Yelahanka, Bangalore",
    coordinates: {
      lat: 13.1007,
      lng: 77.5963,
    },
  },
  {
    name: "Malleshwaram, Bangalore",
    coordinates: {
      lat: 13.0068,
      lng: 77.5692,
    },
  },
  {
    name: "Bannerghatta Road, Bangalore",
    coordinates: {
      lat: 12.8876,
      lng: 77.597,
    },
  },
  {
    name: "Hebbal, Bangalore",
    coordinates: {
      lat: 13.0359,
      lng: 77.597,
    },
  },
];

const darkModeOptions = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
];

const containerStyle = {
  width: "600px",
  height: "600px",
  borderRadius: "0.3rem",
};

const center = {
  lat: 12.9784,
  lng: 77.6408,
};

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState("0 km");
  const [coordinates, setCoordinates] = useState([]);
  const [mapResponse, setMapResponse] = useState(null);

  const handleChange = async (event) => {
    setRouteData(null);
    setCoordinates([]);
    setMapResponse(null);

    const selected = LOCATIONS.find(
      (location) => location.name === event.target.value
    );
    setSelectedLocation(selected);
    setIsLoading(true);

    let data = {
      startLocation: {
        lat: selected.coordinates.lat,
        lng: selected.coordinates.lng,
      },
    };

    const response = await axios.post(
      "https://611xkinx68.execute-api.ap-south-1.amazonaws.com/v1/calculate-route",
      data
    );
    console.log(response.data);
    setRouteData(response.data.data);
    setIsLoading(false);

    let coordinates = [];
    const totalDistanceKm = response.data.data.reduce((total, location) => {
      const distanceParts = location.shortestDistanceText.split(" ");
      const distance = parseFloat(distanceParts[0]);
      const unit = distanceParts[1];
      coordinates.push(location.coordinates);

      let finalDistance = 0;

      if (unit === "km") {
        finalDistance = distance;
      } else if (unit === "m") {
        finalDistance = distance / 1000;
      }

      return total + finalDistance;
    }, 0);
    setTotalDistanceKm(totalDistanceKm.toFixed(1) + " km");
    setCoordinates(coordinates);

    const directionsService = new window.google.maps.DirectionsService();

    // Define waypoints excluding the first and last coordinates
    const waypoints = coordinates.slice(1, -1).map((coord) => ({
      location: new window.google.maps.LatLng(coord.lat, coord.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(
          coordinates[0].lat,
          coordinates[0].lng
        ),
        destination: new window.google.maps.LatLng(
          coordinates[coordinates.length - 1].lat,
          coordinates[coordinates.length - 1].lng
        ),
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setMapResponse(result);
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Delivery route optimizer</h2>
      </div>
      <div className={styles.main_container}>
        <div>
          <h2>Select start location</h2>
          <select
            value={selectedLocation?.name}
            onChange={handleChange}
            className={styles.selector}
          >
            <option value="">Select location</option>
            {LOCATIONS.map((location, index) => (
              <option key={index} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
          {selectedLocation && (
            <div className={styles.selected_area}>
              <p>
                Lat: {selectedLocation.coordinates.lat}, Lng:{" "}
                {selectedLocation.coordinates.lng}
              </p>
            </div>
          )}
          {isLoading && (
            <div className={styles.loading}>
              <p>Calculating shortest route...</p>
              <Loader />
            </div>
          )}
          {routeData && (
            <div className={styles.route_container}>
              <h2>
                Shortest Path Found{" "}
                <span className={styles.total_distance_value}>
                  {totalDistanceKm}
                </span>
              </h2>
              {routeData.map((route, index) => (
                <>
                  <div key={index} className={styles.route_main}>
                    <div className={styles.circle}>{index + 1}</div>
                    {/* {index !== routeData.length - 1 && (
                    <>
                      <div className={styles.line}></div>
                      <div className={styles.distance_main}>
                        <p>{routeData[index + 1].shortestDistanceText}</p>
                      </div>
                    </>
                  )} */}
                    <div className={styles.route_data}>
                      <p>
                        Location: <span>{route.name}</span>
                      </p>
                      <div className={styles.distance_container}>
                        <p>
                          Lat: <span>{route.coordinates.lat}</span>, Lng:{" "}
                          <span>{route.coordinates.lng}</span>
                        </p>
                        {index !== 0 && index !== routeData.length && (
                          <p>{routeData[index].shortestDistanceText}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>
        <div className={styles.map_container}>
          <LoadScript googleMapsApiKey="AIzaSyC2znSVKp2NenYkrawAuAUv8V379X_V9WI">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              options={{
                styles: darkModeOptions,
              }}
            >
              {mapResponse && (
                <>
                  <DirectionsRenderer
                    options={{
                      directions: mapResponse,
                      suppressMarkers: true,
                    }}
                  />
                  {coordinates.map((coord, index) => (
                    <Marker
                      key={index}
                      position={{ lat: coord.lat, lng: coord.lng }}
                      label={(index + 1).toString()}
                    />
                  ))}
                </>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default Home;
