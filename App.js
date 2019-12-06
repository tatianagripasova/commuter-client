import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Picker from "./screens/Picker";
import Places from "./screens/Places";
import { defaultRegion, getLocationAsync } from "./utils/geolocation";

const defaultOptions = [
  { label: 'Home', id: 'cry', description: '255 SW 11th'},
  { label: 'Work', id: 'me', description: 'McLaughlin ave.'}
];

export default function App() {
  const [address, setAddress] = useState({});
  const [picker, setPicker] = useState(false);
  const [places, setPlaces] = useState(true);
  const [region, setRegion] = useState(defaultRegion);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const { region, status } = await getLocationAsync();
    setRegion(region);
    setPermission(status);
    await getAddressByLocation(region);
  };

  const getAddressByLocation = async(region) => {
    const result = await fetch("http://localhost:3000/location", {
      method: "POST", 
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        location: region
      })
    })
    const data = await result.json();
    setAddress(data);
  };

  return (
    <View style={styles.container}>
      <Picker
        visible={picker}
        location={address}
        region={region}
      />
      <Places 
        visible={places}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center", 
    fontFamily: "System",
    fontSize: 18
  }
});
