import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export const defaultRegion = {
    latitude: 16.704070,
    longitude: -2.411928,
    latitudeDelta: 0.05,
    longitudeDelta: 0.025
  };

export const getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
  
    let location = await Location.getCurrentPositionAsync({});

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    const region = { 
        latitude: latitude,
        longitude: longitude, 
        latitudeDelta: 0.05,
        longitudeDelta: 0.025
    }

    return {
        status: status === "granted",
        region
    }
};



    