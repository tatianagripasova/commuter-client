import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import MapView, { Marker } from "react-native-maps";
import Input from "../components/Input";
import ConditionalView from "../components/ConditionalView";
import Autocomplete from "../screens/Autocomplete";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const Picker = props => {
    const [fromLocation, setFromLocation] = useState(props.location);
    const [toLocation, setToLocation] = useState({});
    const [autocomplete, setAutocomplete] = useState(false);
    const [timePicker, setTimePicker] = useState(false);
    const [datePicker, setDatePicker] = useState(false);
    const [eventTime, setEventTime] = useState(null);
    const [eventDate, setEventDate] = useState(null);

    // TODO: Don't mutate state, remove once main page is ready.
    useEffect(() => {
        setFromLocation(props.location);
    }, [props.location]); 

    const showAutocomplete = () => {
        console.log('BLA')
        setAutocomplete(true);
    };

    const selectAddress = (aa) => {
        console.log('>>>>>>>>>>>>>>>', aa);
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
        hideDatePicker();
    }

    return (
        <ConditionalView 
            visible={props.visible}
            style={styles.conditionalView}
        >
            <Autocomplete 
                visible={autocomplete}
                autocompleteOptions={[{id:7, description:"bla"}]}
                defaultOptions={[]}
                dividerTitle={"Your favourite addresses"}
                onInputChange={console.log}
                onSelect={selectAddress}
            />
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.inputWrapper} onPress={showAutocomplete}>
                    <Input
                        style={styles.input}
                        value={fromLocation.description}
                        pointerEvents={"none"}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputWrapper} onPress={showAutocomplete}>
                <Input
                    style={styles.input}
                    value={toLocation.description}
                    placeholder={"where"}
                    pointerEvents={"none"}
                />
            </TouchableOpacity>
            <View>
                <Button 
                    title={eventTime ? eventTime : "Pick Time"} 
                    type="clear"
                    onPress={showTimePicker} 
                />
                <DateTimePickerModal
                    isVisible={timePicker}
                    mode={"time"}
                    onConfirm={handleTimeConfirm}
                    onCancel={hideTimePicker}
                />
            </View>
            <View>
                <Button 
                    title={eventDate ? eventDate : "Once"} 
                    type="clear"
                    onPress={showDatePicker} 
                />
                <DateTimePickerModal
                    isVisible={datePicker}
                    mode={"date"}
                    onConfirm={handleDateConfirm}
                    onCancel={hideDatePicker}
                />
            </View>
            <View>
                <Button 
                    title={eventDate ? eventDate : "Repeat"} 
                    type="clear"
                    onPress={showDatePicker} 
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
    inputContainer: {
        flex: 2,
        alignItems: "center",
        width: "80%"
    }, 
    inputWrapper: {
        width: "100%"
    },
    input: {
        paddingLeft: 10
    }
});

export default Picker;