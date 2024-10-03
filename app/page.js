"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import { MdOutlineContentCopy } from "react-icons/md";
import styles from "./page.module.css";
import Loader from "./components/loader/loader";

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
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState("0 km");
  const [coordinates, setCoordinates] = useState([]);
  const [mapResponse, setMapResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (jsonInput == "") {
      setErrorMessage("");
    }
  }, [jsonInput]);

  const handleJsonChange = (event) => {
    setJsonInput(event.target.value);
  };

  const handleCalculateRoute = async () => {
    setRouteData(null);
    setCoordinates([]);
    setMapResponse(null);

    setIsLoading(true);

    try {
      const parsedJson = JSON.parse(jsonInput);

      if (
        parsedJson &&
        Array.isArray(parsedJson.coordinates) &&
        parsedJson.coordinates.length >= 2
      ) {
        setErrorMessage("");
        await calculateRoute(parsedJson);
        setIsLoading(false);
      } else {
        setErrorMessage(
          'Invalid JSON format: "coordinates" array must have at least two elements.'
        );
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage("Invalid JSON format.");
      setIsLoading(false);
    }
  };

  const calculateRouteCoordiantes = async (coordinates) => {
    let startLocation = coordinates[0];
    let unvisitedLocations = [...coordinates];
    let route = [];
    let addressesMap = new Map();

    while (unvisitedLocations.length > 0) {
      let nearestLocation = null;
      let shortestDistance = Infinity;
      let shortestDistanceText = null;

      for (const location of unvisitedLocations) {
        const distanceData = await calculateDistance(
          startLocation,
          location,
          addressesMap
        );

        const distanceInMeters = distanceData.distanceInMeters;
        const distanceText = distanceData.distance;

        if (distanceInMeters < shortestDistance) {
          shortestDistance = distanceInMeters;
          nearestLocation = location;
          shortestDistanceText = distanceText;
        }
      }

      if (nearestLocation) {
        nearestLocation.originAddress = addressesMap.get(
          `${nearestLocation.lat},${nearestLocation.lng}`
        );
        nearestLocation.shortestDistanceText = shortestDistanceText;
        route.push(nearestLocation);
        unvisitedLocations = unvisitedLocations.filter(
          (loc) =>
            loc.lat !== nearestLocation.lat || loc.lng !== nearestLocation.lng
        );
        startLocation = {
          lat: nearestLocation.lat,
          lng: nearestLocation.lng,
        };
      }
      // else {
      //   throw new Error("Failed to find the nearest location.");
      // }
    }

    return route;
  };

  const calculateDistance = async (source, destination, addressesMap) => {
    const apiKey = "AIzaSyAg1jbL4bRBmiqWx5ZQImooTyRSMQTOtcs";
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${source.lat},${source.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;

    const response = await axios.get(apiUrl);

    if (response.data.status === "OK") {
      const distance = response.data.rows[0]?.elements[0]?.distance?.text;
      const duration = response.data.rows[0]?.elements[0]?.duration?.text;
      const originAddresses = response.data.origin_addresses[0];
      const destinationAddresses = response.data.destination_addresses[0];

      const sourceKey = `${source.lat},${source.lng}`;
      const destKey = `${destination.lat},${destination.lng}`;
      if (!addressesMap.has(sourceKey)) {
        addressesMap.set(sourceKey, originAddresses);
      }
      if (!addressesMap.has(destKey)) {
        addressesMap.set(destKey, destinationAddresses);
      }

      const distanceInMeters =
        response.data.rows[0]?.elements[0]?.distance?.value;

      return {
        distance,
        distanceInMeters,
        duration,
        originAddresses,
        destinationAddresses,
      };
    }
  };

  const calculateRoute = async (request) => {
    // depricated api
    // const response = await axios.post(
    //   "https://611xkinx68.execute-api.ap-south-1.amazonaws.com/v1/calculate-route",
    //   request
    // );

    let data = await calculateRouteCoordiantes(request);

    setRouteData(data);

    let coordinates = [];
    const totalDistanceKm = response.data.data.reduce((total, location) => {
      const distanceParts = location.shortestDistanceText.split(" ");
      const distance = parseFloat(distanceParts[0]);
      const unit = distanceParts[1];
      coordinates.push({ lat: location.lat, lng: location.lng });

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

  const copySampleData = () => {
    const sampleData = `{
        "coordinates": [
            {
                "lat": 12.9784,
                "lng": 77.6408
            },
            {
              "lat": 12.9698,
              "lng": 77.7499
            },
            {
              "lat": 12.9352,
              "lng": 77.6245
            },
            {
              "lat": 13.1007,
              "lng": 77.5963
            },
            {
                "lat": 13.0359,
                "lng": 77.597
            },
            {
                "lat": 12.9308,
                "lng": 77.5838
            },
            {
              "lat": 12.8456,
              "lng": 77.6603
            },
            {
              "lat": 13.0068,
              "lng": 77.5692
            },
            {
              "lat": 12.8876,
              "lng": 77.597
            },
            {
              "lat": 12.9758,
              "lng": 77.6045
            }
        ]
    }`;
    navigator.clipboard
      .writeText(sampleData)
      .then(() => alert("Sample data copied to clipboard"))
      .catch((error) => console.error("Unable to copy sample data: ", error));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Delivery route optimizer</h2>
      </div>
      <div className={styles.main_container}>
        <div className={styles.left_panel}>
          <div className={styles.instructions_main}>
            <p>
              Please enter the delivery coordinates in the following JSON
              format:
            </p>
            <button onClick={copySampleData} className={styles.copy_button}>
              <MdOutlineContentCopy /> Click to copy sample JSON data
            </button>
          </div>
          <h2>Enter Delivery coordinates</h2>
          <textarea
            value={jsonInput}
            onChange={handleJsonChange}
            className={styles.textarea}
            placeholder="Enter JSON data here"
          />
          <br></br>
          <span className={styles.error_message}>{errorMessage}</span>
          {isLoading ? (
            <div className={styles.loading}>
              <p>Calculating shortest route...</p>
              <Loader />
            </div>
          ) : (
            <button
              onClick={handleCalculateRoute}
              className={styles.calculate_button}
            >
              Calculate Route
            </button>
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
                        Location: <span>{route.originAddress}</span>
                      </p>
                      <div className={styles.distance_container}>
                        <p>
                          Lat: <span>{route.lat}</span>, Lng:{" "}
                          <span>{route.lng}</span>
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
