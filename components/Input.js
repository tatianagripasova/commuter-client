import React from "react";
import { TextInput, StyleSheet } from "react-native";

const Input = props => {
    return  <TextInput {...props} style={{ ...styles.input, ...props.style }} />
};

const styles = StyleSheet.create({
    input: {
        alignItems: "center",
        marginTop: 60,
        marginBottom: 30,
        width: "100%",
        height: 40,
        borderColor: "#B9B5B5",
        borderWidth: 1 
    }
});

export default Input;
