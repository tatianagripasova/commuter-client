import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Autocomplete  from "./screens/Autocomplete";
import Picker from "./screens/Picker";
import { defaultRegion, getLocationAsync } from "./utils/geolocation";

const defaultOptions = [
  { label: 'Home', id: 'cry', description: '255 SW 11th'},
  { label: 'Work', id: 'me', description: 'McLaughlin ave.'}
];

export default function App() {
  const [autoOptions, setAutoOptions] = useState([]);
  const [address, setAddress] = useState({});
  const [autocomplete, setAutocomplete] = useState(false);
  const [picker, setPicker] = useState(true);
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

  const inputHandler = async (text) => {
    if (text.length > 1) {
      const result = await fetch("http://localhost:3000/address", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: text, 
          location: region
        })
      })
      const data = await result.json();
      setAutoOptions(data);
    }
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
    console.log(data);
  };

  const selectHandler = async(value) => {
    console.log(value);
  };

  return (
    <View style={styles.container}>
      <Autocomplete 
        visible={autocomplete}
        autocompleteOptions={autoOptions}
        defaultOptions={defaultOptions}
        dividerTitle={"Your favourite addresses"}
        onInputChange={inputHandler}
        onSelect={selectHandler}
      />
      <Picker
        visible={picker}
        location={address}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
