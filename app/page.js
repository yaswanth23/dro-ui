"use client";

import React, { useState } from "react";
import axios from "axios";
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

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const handleChange = async (event) => {
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
    setRouteData(response.data);
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Delivery route optimizer</h2>
      </div>
      <div className={styles.main_container}>
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
      </div>
    </div>
  );
};

export default Home;
