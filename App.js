import React, { useState, useEffect } from 'react';
import { StyleSheet, View, AsyncStorage, Text } from 'react-native';

import NewEvent from "./screens/NewEvent";
import Places from "./screens/Places";
import Events from "./screens/Events";
import { defaultRegion, getLocationAsync } from "./utils/geolocation";
import { getPushTokenAsync } from "./utils/notifications";
import { Authenticate } from "react-native-expo-auth";
import AuthContext from "./context/auth";
import GetPlaces from "./context/places";
import ShowScreen from "./context/screens";

export default function App() {
  const [address, setAddress] = useState({});
  const [newEvent, setNewEvent] = useState(false);
  const [places, setPlaces] = useState(false);
  const [events, setEvents] = useState(true);
  const [region, setRegion] = useState(defaultRegion);

  const [authDialog, setAuthDialog] = useState(false);
  const [token, setToken] = useState("none");
  const [email, setEmail] = useState("none");
  const [pushToken, setPushToken] = useState(null);
  const [logins, setLogins] = useState([]);

  const [refreshEvents, setRefreshEvents] = useState(false);

  const [favouritePlaces, setFavouritePlaces] = useState([]);

  useEffect(() => {
    getLocation();
    getPushToken();
    getTokenAndEmailFromStorage();
    // AsyncStorage.clear();
  }, []);

  const getTokenAndEmailFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const logins = await AsyncStorage.getItem("logins");
      const email = await AsyncStorage.getItem("email");

      if (logins) {
        setLogins(JSON.parse(logins));
      }

      if(token !== null) {
        setToken(token);
        setEmail(email);
        setAuthDialog(false);
      } else {
        setAuthDialog(true);
      }
    } catch(e) {
      setAuthDialog(true);
    }
  };

  const getPushToken = async () => {
    const { token } = await getPushTokenAsync();
    setPushToken(token);
  };

  const getLocation = async () => {
    const { region, status } = await getLocationAsync();
    setRegion(region);
    await getAddressByLocation(region);
  };

  const getAddressByLocation = async(region) => {
    const result = await fetch("http://commuter.guru/location", {
      method: "POST", 
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        location: region
      })
    }) 
    if(result.status === 200) {
      const data = await result.json();
      setAddress(data);
    }
  };

  const getPlaces = async() => {
    const result = await fetch("http://commuter.guru/places", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Auth-Token": token
        }
    })
    if(result.status === 200) {
        const places = await result.json();
        setFavouritePlaces(places);
    } else if (result.status === 401) {
        showAuth();
    }
};

  const submitAuth = async(data, route) => {
    const signUpRaw = await fetch(`http://commuter.guru/${route}`, {
      method: "POST", 
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        ...data,
        pushToken
      })
    });
    if(signUpRaw.status !== 200) {
      return {
        success: false,
        error: await signUpRaw.text()
      };
    }
    const { token, emails } = await signUpRaw.json();
    if (token) {
      setToken(token);
      setLogins(emails);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("logins", JSON.stringify(emails));
      if (data.email) {
        await AsyncStorage.setItem("email", data.email);
        setEmail(data.email);
      }
      setAuthDialog(false);
    }
    return {
      success: true
    };
  };

  const submitSignIn = async (data) => await submitAuth(data, "signin");
  const submitSignUp = async (data) => await submitAuth(data, "signup");
  const submitBioLogin = async (data) => await submitAuth(data, "biologin");
  const submitPinCodeRequest = async (data) => await submitAuth(data, "reset");
  const submitNewPassword = async (data) => await submitAuth(data, "doreset");

  const showAuth = () => {
    setAuthDialog(true);
  };

  return (
    <View style={styles.container}>
      <Authenticate
        visible={authDialog}
        onLogin={submitSignIn} 
        onSignUp={submitSignUp}
        onBioLogin={submitBioLogin}
        logins={logins}
        onPinCodeRequest={submitPinCodeRequest}
        onSubmitNewPassword={submitNewPassword}
        enableBio={true}
      >
        <Text>LOGO</Text>
      </Authenticate>
      <AuthContext.Provider value={{token, email, showAuth}}>
        <ShowScreen.Provider value={{setNewEvent, setEvents, setPlaces, refreshEvents, setRefreshEvents, address}}>
          <GetPlaces.Provider value={{getPlaces, favouritePlaces}}>
            <Events 
              visible={events}
            />
            <NewEvent
              visible={newEvent}
              region={region}
            />
            <Places 
              visible={places}
              region={region}
            />
          </GetPlaces.Provider>
       </ShowScreen.Provider>
      </AuthContext.Provider>
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
