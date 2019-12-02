import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Input from "../components/Input";
import ConditionalView from "../components/ConditionalView";
import Autocomplete from "../screens/Autocomplete";

const Picker = props => {
    const [fromLocation, setFromLocation] = useState(props.location);
    const [toLocation, setToLocation] = useState({});
    const [autocomplete, setAutocomplete] = useState(false);

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