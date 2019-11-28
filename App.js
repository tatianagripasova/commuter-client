import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Autocomplete  from "./components/Autocomplete";
import { defaultRegion, getLocationAsync } from "./utils/geolocation";

const defaultOptions = [
  { label: 'Home', id: 'cry', description: '255 SW 11th'},
  { label: 'Work', id: 'me', description: 'McLaughlin ave.'}
];

export default function App() {
  const [autoOptions, setAutoOptions] = useState([]);
  const [autocomplete, setAutocomplete] = useState(true);
  const [region, setRegion] = useState(defaultRegion);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    getLocation();
  }, [])

  const getLocation = async () => {
    const { region, status } = await getLocationAsync();
    setRegion(region);
    setPermission(status);
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

  const selectHandler = async(value) => {
    console.log(value);
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Autocomplete 
        visible={autocomplete}
        autocompleteOptions={autoOptions}
        defaultOptions={defaultOptions}
        dividerTitle={"Your favourite addresses"}
        onInputChange={inputHandler}
        onSelect={selectHandler}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
