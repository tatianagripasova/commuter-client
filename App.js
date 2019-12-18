import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, AsyncStorage } from 'react-native';

import Picker from "./screens/Picker";
import Places from "./screens/Places";
import Events from "./screens/Events";
import { defaultRegion, getLocationAsync } from "./utils/geolocation";
import { Authenticate } from "react-native-expo-auth";
import AuthContext from "./context/auth";
import ShowScreen from "./context/screens";

export default function App() {
  const [address, setAddress] = useState({});
  const [picker, setPicker] = useState(false);
  const [places, setPlaces] = useState(false);
  const [events, setEvents] = useState(true);
  const [region, setRegion] = useState(defaultRegion);
  const [permission, setPermission] = useState(false);

  const [authDialog, setAuthDialog] = useState(false);
  const [token, setToken] = useState("none");
  const [logins, setLogins] = useState([]);

  const [refreshEvents, setRefreshEvents] = useState(false);

  useEffect(() => {
    getLocation();
    getPushToken();
    getTokenAndEmailFromStorage();
  }, []);

  const getTokenAndEmailFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const logins = await AsyncStorage.getItem("logins");
      if(token !== null) {
        setToken(token);
        setLogins(JSON.parse(logins));
        setAuthDialog(false);
      } else {
        setAuthDialog(true);
      }
    } catch(e) {
      setAuthDialog(true);
    }
  };

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
        "Content-Type": "application/json",
        "Auth-Token": token
      },
      body: JSON.stringify({
        location: region
      })
    }) 
    if(result.status === 200) {
      const data = await result.json();
      setAddress(data);
    } else if(result.status === 401) {
        showAuth();
    }
  };

  const submitAuth = async(data, route) => {
    const signUpRaw = await fetch(`http://localhost:3000/${route}`, {
      method: "POST", 
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(data)
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
      />
      <AuthContext.Provider value={{token, showAuth}}>
        <ShowScreen.Provider value={{setPicker, setEvents, setPlaces, refreshEvents, setRefreshEvents}}>
          <Events 
            visible={events}
          />
          <Picker
            visible={picker}
            location={address}
            region={region}
          />
          <Places 
            visible={places}
            region={region}
          />
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
