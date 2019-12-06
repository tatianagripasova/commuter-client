import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import Modal from "react-native-modal";
import Input from "../components/Input";
import { Button } from "react-native-elements";
import { SwipeListView } from 'react-native-swipe-list-view';
import ImageButton from "../components/ImageButton";

const Places = props => {
    const Places = [
        {
            label: "Home", 
            address: "11 Bla St, Miami",
            id: 1
        }
    ];
    return (
        <Modal
            style={styles.modal}
            coverScreen={true} 
            backdropColor={"#FFFFFF"}
            backdropOpacity={1} 
            isVisible={props.visible}
        >   
            <View style={styles.headerContainer}>
                <Text style={styles.header}> Your Favourite Places</Text>
            </View>
            <View style={styles.inputsContainer}>
                <TouchableOpacity style={styles.inputWrapper}>
                    <Input
                        style={styles.inputLabel}
                        //value={labelValue}
                        placeholder={"Home"}
                        pointerEvents={"none"}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputWrapper}>
                    <Input
                        style={styles.inputAddress}
                        //value={addressValue}
                        placeholder={"Address"}
                        pointerEvents={"none"}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.addButton}>
                    <Button
                        title={"Add New Place"} 
                        type="clear"
                        //onPress={} 
                    />
            </View>
            <View style={styles.addressList}>
                <ScrollView>
                <SwipeListView
                    data={Places}
                    keyExtractor={item => Math.random().toString()}
                    renderItem={(place, rowMap) => {
                        return (
                        <View style={styles.rowFront}>
                            <Text style={styles.text}>{place.item.label}: {place.item.address}</Text>
                        </View>
                    )}}
                    renderHiddenItem={ (place, rowMap) => (
                        <View style={styles.rowBack}>
                        <ImageButton
                            imageStyle={styles.cancelButtonImage}
                            source={require("../images/trash.png")}
                            //onPress={}
                        />
                        </View>
                    )}
                    leftOpenValue={0}
                    rightOpenValue={-75}
                />
                </ScrollView>
            </View>
        </Modal>
    )
};

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }, 
    headerContainer: {
        marginTop: 30,
        borderWidth: 1
    },
    header: {
        fontFamily: "System",
        fontSize: 20
    },
    inputsContainer: {
        flex: 1,
        alignItems: "center",
        width: "80%", 
        borderWidth: 1
    },
    inputWrapper: {
        width: "100%"
    },
    inputLabel: {
        marginTop: 20,
        marginBottom: 30,
        paddingLeft: 10
    },
    inputAddress: {
        paddingLeft: 10
    },
    addButton: {
        flex: 1,
        paddingTop: 20,
        borderWidth: 1
    }, 
    addressList: {
        flex: 3,
        borderWidth: 1, 
        width: "100%", 
        marginBottom: 15
    }, 
    textContainer: {
        padding: 15
    },
    text: {
        fontSize: 18
    },
    rowFront: {
        paddingLeft: 10,
        backgroundColor: "#ffffff",
        borderBottomColor: "#B9B5B5",
        borderBottomWidth: 1,
        justifyContent: "center",
        height: 50,
      },
      rowBack: {
        alignItems: "flex-end",
        backgroundColor: "#ffffff",
        flex: 1,
        justifyContent: "space-between",
        paddingLeft: 15,
        borderBottomColor: "#B9B5B5",
        borderBottomWidth: 1,
      }, 
      cancelButtonImage: {
        width: 35,
        height: 35, 
        marginRight: 30
    }
});

export default Places;
