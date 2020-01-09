import React, { useState, useEffect, useRef, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Button } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import WeekdayPicker from "react-native-weekday-picker"
import moment from "moment";
import _ from "lodash";


import ConditionalView from "../components/ConditionalView";
import AuthContext from "../context/auth";
import Autocomplete from "../components/Autocomplete";
import Input from "../components/Input";
import ImageButton from "../components/ImageButton";
import ShowScreen from "../context/screens";
import GetPlaces from "../context/places";

const GOOGLE_MAPS_APIKEY = "AIzaSyCa_RJAP1ZYeIiBcl-KvvuFW6IuJwTAGb4";
const DEFAULT_DAYS = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };

const NewEvent = props => {
    const [fromLocation, setFromLocation] = useState({});
    const [fromCoordinates, setFromCoordinates] = useState({});
    const [toCoordinates, setToCoordinates] = useState({});
    const [toLocation, setToLocation] = useState({});
    const [autocomplete, setAutocomplete] = useState(false);
    const [timePicker, setTimePicker] = useState(false);
    const [datePicker, setDatePicker] = useState(false);
    const [eventTime, setEventTime] = useState(null);
    const [eventDate, setEventDate] = useState(null);
    const [recurringDays, setRecurringDays] = useState(null);

    const [addressOptions, setAddressOptions] = useState([]);
    const [autocompleteField, setAutocompleteField] = useState(null);

    const { token, showAuth } = useContext(AuthContext);
    const { setEvents, setNewEvent, setRefreshEvents, address } = useContext(ShowScreen);
    const { favouritePlaces } = useContext(GetPlaces);

    useEffect(() => {
        setFromLocation(address);
    }, [address]); 

    useEffect(() => {
        getCoordinates();
    }, [fromLocation, toLocation]);

    const getCoordinates = async () => {
        if (!_.isEmpty(fromLocation) && !_.isEmpty(toLocation)) {
            const placeIds = [fromLocation.id, toLocation.id];
            const result = await fetch(
                `http://commuter.guru/coordinates`, {
                    method: "POST",
                    headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Auth-Token": token
                    },
                    body: JSON.stringify({
                        placeIds
                    })
                }
            )
            if(result.status === 200) {
                const [ origin, destination ] = await result.json();
                setFromCoordinates(origin);
                setToCoordinates(destination);
                mapRef.current.fitToCoordinates([origin, destination], {
                    edgePadding: {
                        bottom: 70, right: 70, top: 70, left: 70,
                    },
                    animated: true,
                });
            } else if (result.status === 401) {
                showAuth();
            }
        }
    };

    const showEventsPage = () => {
        setRefreshEvents(true);
        setEvents(true);
        setNewEvent(false);
    };

    const mapRef = useRef();

    const showAutocomplete = (field) => {
        setAutocompleteField(field);
        setAutocomplete(true);
    };

    const selectAddress = async (location) => {
        if (autocompleteField == 'from') {
            setFromLocation(location);
        } else if (autocompleteField == 'to') {
            setToLocation(location);
        }
        setAutocomplete(false);
    }

    const showTimePicker = () => {
        setTimePicker(true);
      };
    
    const hideTimePicker = () => {
        setTimePicker(false);
    };
    
    const handleTimeConfirm = time => {
        const eventTime = moment(time).format("LT");
        setEventTime(eventTime);
        hideTimePicker();
    };

    const showDatePicker = () => {
        setDatePicker(true);
    };

    const hideDatePicker = () => {
        setDatePicker(false)
    };

    const handleDateConfirm = date => {
        const eventDate = moment(date).format("MMM Do YY");
        setEventDate(eventDate);
        setRecurringDays(null);
        hideDatePicker();
    };

    const selectRecurringDays = days => {
        setRecurringDays({ ...days });
        setEventDate(null);
    };

    const autocompleteInputHandler = async (text) => {
        if (text.length > 1) {
          const result = await fetch("http://commuter.guru/address", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Auth-Token": token
            },
            body: JSON.stringify({
              input: text, 
              location: props.region
            })
          })
          if(result.status === 200) {
            const data = await result.json();
            setAddressOptions(data);
          } else if (result.status === 401) {
            showAuth();
          }
        }
      };

    const submitEvent = async() => {
        let error;
        if (_.isEmpty(fromLocation)) {
            error = "Please choose starting point";
            
        } else if (_.isEmpty(toLocation)) {
            error = "Please choose destination";
    
        } else if (!eventDate && !recurringDays) {
            error = "Please choose a specific date or a day";
        } else if (!eventTime) {
            error = "Please pick a time";
        }
        if (error) {
            Alert.alert(
                "Enable to save the event", 
                error
            )
        } else {
            const results = {
                fromLocation,
                toLocation, 
                eventTime, 
                eventDate, 
                recurringDays,
                utcOffset: moment().utcOffset()
            };
            const result = await fetch("http://commuter.guru/event", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Auth-Token": token
                },
                body: JSON.stringify({
                    ...results
                })
            })
            setFromLocation(address);
            setFromCoordinates({});
            setToLocation({});
            setToCoordinates({});
            if(result.status === 200) {
                showEventsPage();
            } else if (result.status === 401) {
                showAuth();
            }
        }
    };

    const hideAutocomplete = () => {
        setAutocomplete(false);
    }

    return (
        <ConditionalView 
            visible={props.visible}
            style={styles.conditionalView}
        >
            <Autocomplete 
                visible={autocomplete}
                autocompleteOptions={addressOptions}
                defaultOptions={favouritePlaces.map(place => ({
                    label: place.label,
                    description: place.formattedAddress,
                    id: place.placeId
                }))}
                dividerTitle={"Your Favourite Addresses"}
                onInputChange={autocompleteInputHandler}
                onSelect={selectAddress}
                hideAutocomplete={hideAutocomplete}
            />
            <View style={styles.inputsContainer}>
                <TouchableOpacity style={styles.inputWrapper} onPress={() => showAutocomplete("from")}>
                    <Input
                        style={styles.inputFrom}
                        value={fromLocation.description}
                        pointerEvents={"none"}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputWrapper} onPress={() => showAutocomplete("to")}>
                    <Input
                        style={styles.inputTo}
                        value={toLocation.description}
                        placeholder={"where"}
                        pointerEvents={"none"}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.dateWrapper}>
                <Button 
                    title={eventTime ? eventTime : "Select Arrival Time"} 
                    type="clear"
                    onPress={showTimePicker} 
                />
                <DateTimePickerModal
                    isVisible={timePicker}
                    mode={"time"}
                    onConfirm={handleTimeConfirm}
                    onCancel={hideTimePicker}
                />
                <Button 
                    title={eventDate ? eventDate : "Select Date"} 
                    type="clear"
                    onPress={showDatePicker} 
                />
                <DateTimePickerModal
                    isVisible={datePicker}
                    mode={"date"}
                    onConfirm={handleDateConfirm}
                    onCancel={hideDatePicker}
                />
                <Text style={styles.text}>Or Repeat Every:</Text>
                <WeekdayPicker
                    days={recurringDays ? recurringDays : {...DEFAULT_DAYS}}
                    onChange={selectRecurringDays}
                    style={styles.dayStyle}
                />
            </View>
            <View style={styles.mapWrapper}>
            <MapView
                initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsUserLocation={true} 
                showsMyLocationButton={true} 
                ref={mapRef}
            >
                {!_.isEmpty(fromCoordinates) && !_.isEmpty(toCoordinates) && (
                    <MapViewDirections
                        origin={fromCoordinates}
                        destination={toCoordinates}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                    />
                )}
                
            </MapView>
            </View>
            <View style={styles.buttons}>
                <Button 
                    title="Save"
                    type="clear"
                    onPress={submitEvent}
                />
                    <ImageButton
                        imageStyle={styles.cancelButton}
                        style={styles.cancel}
                        source={require("../images/cancel.png")}
                        onPress={showEventsPage}
                    />
            </View>
        </ConditionalView>
    )
};

const styles = StyleSheet.create({
    conditionalView: {
        flex: 1,
        alignItems: "center",
        width: "100%"
    }, 
    inputsContainer: {
        flex: 2,
        alignItems: "center",
        width: "80%"
    },
    inputWrapper: {
        width: "100%"
    },
    inputFrom: {
        marginTop: 60,
        marginBottom: 30,
        paddingLeft: 10
    },
    inputTo: {
        paddingLeft: 10
    },
    dateWrapper: {
        flex: 2,
        alignContent: "center", 
        alignItems: "center"
    },
    mapWrapper: {
        flex: 4, 
        width: "100%",
        zIndex: 10
    },
    map: {
       ...StyleSheet.absoluteFillObject
    },
    text: {
        margin: 5,
        fontSize: 18
    }, 
    buttons: {
        flex: 1, 
        paddingTop: 20
    },
    cancelButton: {
        width: 30,
        height: 30,
    },
    cancel: {
        paddingBottom: 18
    }

});

export default NewEvent;