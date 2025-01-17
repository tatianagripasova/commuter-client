import React, { useState, useEffect, useRef, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from "react-native";
import { Button } from "react-native-elements";
import { CheckBox } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";
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

const height = Math.round(Dimensions.get('window').height);

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
    const [alwaysNotify, setAlwaysNotify]= useState(false);
    const [spinner, setSpinner] = useState(false);

    const [addressOptions, setAddressOptions] = useState([]);
    const [autocompleteField, setAutocompleteField] = useState(null);

    const { token, showAuth } = useContext(AuthContext);
    const { setEvents, setNewEvent, setRefreshEvents, address, dark } = useContext(ShowScreen);
    const { favouritePlaces } = useContext(GetPlaces);

    const mapRef = useRef();

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
                if (origin && destination && mapRef && mapRef.current) {
                    setFromCoordinates(origin);
                    setToCoordinates(destination);
                    mapRef.current.fitToCoordinates([origin, destination], {
                        edgePadding: {
                            bottom: 70, right: 70, top: 70, left: 70,
                        },
                        animated: true,
                    });
                }
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
                alwaysNotify,
                utcOffset: moment().utcOffset()
            };
            setSpinner(true);
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
            });
            setSpinner(false);
            setFromLocation(address);
            setFromCoordinates({});
            setToLocation({});
            setToCoordinates({});
            setEventDate(null);
            setEventTime(null);
            setRecurringDays(null);
            setAlwaysNotify(false);
            if(result.status === 200) {
                showEventsPage();
            } else if (result.status === 401) {
                showAuth();
            }
        }
    };

    const hideAutocomplete = () => {
        setAutocomplete(false);
    };

    const alwaysNotifyHandler = () => {
        setAlwaysNotify(!alwaysNotify);
    };

    return (
        <ConditionalView 
            visible={props.visible}
            style={styles.conditionalView}
        >   
            <Spinner
                visible={spinner}
                textContent={"Saving..."}
                textStyle={styles.spinnerTextStyle}
                overlayColor={"rgba(0, 0, 0, 0.75)"}
            />
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
                    <View pointerEvents={"none"}>
                        <Input
                            style={styles.inputFrom}
                            value={fromLocation.description}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputWrapper} onPress={() => showAutocomplete("to")}>
                    <View pointerEvents={"none"}>
                        <Input
                            style={styles.inputTo}
                            value={toLocation.description}
                            placeholder={"where"}
                            pointerEvents={"none"}
                        />
                    </View>
                </TouchableOpacity>
                <Button 
                    title={eventTime ? eventTime : "Select Arrival Time"} 
                    type="clear"
                    onPress={showTimePicker}
                    style={styles.arrivalTimeButton}
                />
                <DateTimePickerModal
                    isVisible={timePicker}
                    mode={"time"}
                    onConfirm={handleTimeConfirm}
                    onCancel={hideTimePicker}
                    isDarkModeEnabled={dark}
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
                    isDarkModeEnabled={dark}
                />
                <Text style={styles.text}>Or Repeat Every:</Text>
                <WeekdayPicker
                    days={recurringDays ? recurringDays : {...DEFAULT_DAYS}}
                    onChange={selectRecurringDays}
                    style={styles.dayStyle}
                />
                <CheckBox
                    title="Always Notify Me About This Event"
                    iconType="feather"
                    iconLeft
                    checkedIcon="check-square"
                    uncheckedIcon="square"
                    containerStyle={{ borderWidth: 0, backgroundColor: "white" }}
                    textStyle={{ fontWeight: "100" }}
                    titleProps={{ style: {color:"black", fontSize:16, fontFamily:"System", paddingLeft: 10 }} }
                    checked={alwaysNotify}
                    onPress={alwaysNotifyHandler}
                />
            </View>
            <View style={styles.mapWrapper}>
            <MapView
                initialRegion={props.region}
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
                <View style={styles.cancel}>
                    <ImageButton
                        imageStyle={styles.cancelButton}
                        style={styles.cancel}
                        source={require("../images/cancel.png")}
                        onPress={showEventsPage}
                    />
                </View>
                <View style={styles.save}>
                    <Button 
                        title="Save"
                        type="clear"
                        onPress={submitEvent}
                    />
                </View>
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
    spinnerTextStyle: {
        color: "#CCCCCC",
        fontFamily: "System",
        fontSize: 18
    },
    inputsContainer: {
        flex: 4,
        alignItems: "center",
        width: "90%"
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
    arrivalTimeButton: {
        marginTop: 20
    },
    mapWrapper: {
        flex: height < 700 ? 2 : 3, 
        width: "100%",
        zIndex: 10
    },
    map: {
       ...StyleSheet.absoluteFillObject
    },
    text: {
        margin: 5,
        fontSize: 16
    }, 
    buttons: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    cancel: {
        flex: 1
    },
    save: {
        flex: 1,
        justifyContent: "center"
    },
    cancelButton: {
        width: 30,
        height: 30
    }

});

export default NewEvent;