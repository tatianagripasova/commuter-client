import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableWithoutFeedback, Keyboard }  from "react-native";
import Modal from "react-native-modal";
import Input from "./Input";

const Autocomplete = props => {
    const [textValue, setTextValue] = useState("");

    const onValueSelect = (value) => {
        props.onSelect(value);
    };

    const onTextChange = textValue => {
        setTextValue(textValue);
        props.onInputChange(textValue);
    };

    return (
        <Modal
            style={styles.modal}
            coverScreen={true} 
            backdropColor={"#FFFFFF"}
            backdropOpacity={1} 
            isVisible={props.visible}
        >
            <View style={styles.container}>
                <ScrollView>
                    <View style={styles.inputContainer}>
                        <Input
                            style={styles.input}
                            value={textValue}
                            onChangeText={onTextChange}
                            autoFocus={true}
                        />
                    </View>
                    <View style={styles.optionContainer}> 
                        {props.autocompleteOptions.map((autoOption) => {
                            return (
                                <View style={styles.option} key={autoOption.id}>
                                    <TouchableWithoutFeedback
                                        onPress={() => onValueSelect(autoOption)}
                                    >
                                        <View>
                                            <Text>
                                                {autoOption.description}
                                            </Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            )
                        })}
                        <View style={styles.dividerTitle}>
                            <Text>{props.dividerTitle}</Text>
                        </View>
                        {props.defaultOptions.map((defaultOption) => {
                            return (
                                <View style={styles.option} key={defaultOption.id}>
                                
                                    <TouchableWithoutFeedback
                                        onPress={() => onValueSelect(defaultOption)}
                                    >
                                        <View>
                                            <Text>{defaultOption.label}</Text>
                                            <Text>{defaultOption.description}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: "center",
        alignItems: "center"
    }, 
    container: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
    }, 
    inputContainer: {
        flex: 1
    }, 
    dividerTitle: {
        padding: 20
    },
    optionContainer: {
        flex: 5, 
        alignItems: "center" 
    }, 
    option: {
        padding: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: "#E7E3E3",
        width: "90%"
    },
    input: {
        marginTop: 60,
        marginBottom: 30
    }
});

export default Autocomplete;