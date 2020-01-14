import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-elements";
import { SwipeListView } from 'react-native-swipe-list-view';

import Input from "../components/Input";
import Autocomplete from "../components/Autocomplete";
import ImageButton from "../components/ImageButton";
import AuthContext from "../context/auth";
import GetPlaces from "../context/places";
import ShowScreen from "../context/screens";

const height = Math.round(Dimensions.get('window').height);

const Places = props => {
    const [autocomplete, setAutocomplete] = useState(false);
    const [label, setLabel] = useState("");
    const [address, setAddress] = useState({});
    const [addressOptions, setAddressOptions] = useState([]);

    const { token, showAuth } = useContext(AuthContext);
    const { setPlaces: setPlacesWindow, setEvents } = useContext(ShowScreen);
    const { getPlaces, favouritePlaces } = useContext(GetPlaces);

    useEffect(() => {
        if (token && token !== "none") {
            getPlaces();
        }
    }, [token]); 

    const showEventsPage = () => {
        setEvents(true);
        setPlacesWindow(false);
    };

    const showAutocomplete = () => {
        setAutocomplete(true);
    };

    const labelHandler = inputValue => {
        setLabel(inputValue)
    };

    const selectAddress = (value) => {
        setAddress(value);
        setAutocomplete(false);
    };
    
    const submitPlace = async () => {
        const place = { label, address };
        const result = await fetch("http://commuter.guru/place", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Auth-Token": token
            },
            body: JSON.stringify({
               place
            })
        })
        setLabel("");
        setAddress("");
        if(result.status === 200) {
            const data = await result.json();
            getPlaces();
        } else if (result.status === 401) {
            showAuth();
        }
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
          } else if(result.status === 401) {
                showAuth();
          }
        }
      };

    const deletePlace = async(id) => {
        const result = await fetch(`http://commuter.guru/delete/${id}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Auth-Token": token
            }
        })
        if(result.status === 200) {
            await getPlaces();
        } else if (result.status === 401) {
            showAuth();
        }
    };

    const hideAutocomplete = () => {
        setAutocomplete(false);
    };

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
                <Autocomplete 
                    visible={autocomplete}
                    autocompleteOptions={addressOptions}
                    defaultOptions={[]}
                    onInputChange={autocompleteInputHandler}
                    onSelect={selectAddress}
                    hideAutocomplete={hideAutocomplete}
                />
                <View style={styles.inputsContainer}>
                    <View style={styles.inputWrapper}>
                        <Input
                            style={styles.inputLabel}
                            value={label}
                            placeholder={"Home"}
                            onChangeText={labelHandler}
                        />
                    </View>
                    <TouchableOpacity style={styles.inputWrapper} onPress={showAutocomplete}>
                        <View pointerEvents={"none"}>
                            <Input
                                style={styles.inputAddress}
                                value={address.description}
                                placeholder={"Address"}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.addButton}>
                        <Button
                            title={"Add Place"} 
                            type="clear"
                            onPress={submitPlace} 
                        />
                    </View>
                </View>
                <View style={styles.addressList}>
                    <ScrollView>
                        <SwipeListView
                            data={favouritePlaces}
                            keyExtractor={item => Math.random().toString()}
                            renderItem={(place) => {
                                return (
                                <View style={styles.rowFront}>
                                    {place.item.label && (<Text style={styles.textLabel}>{place.item.label}</Text>)}
                                    <Text style={styles.textAddress}>{place.item.formattedAddress}</Text>
                                </View>
                            )}}
                            renderHiddenItem={(place) => (
                                <View style={styles.rowBack}>
                                <ImageButton
                                    imageStyle={styles.cancelButtonImage}
                                    source={require("../images/trash.png")}
                                    onPress={() => deletePlace(place.item.id)}
                                />
                                </View>
                            )}
                            leftOpenValue={0}
                            rightOpenValue={-75}
                        />
                    </ScrollView>
                    <View>
                        <ImageButton
                            imageStyle={styles.cancelButton}
                            source={require("../images/cancel.png")}
                            onPress={showEventsPage}
                        />
                    </View>
                </View>
       
        </Modal>
    )
};

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
        height: height
    }, 
    headerContainer: {
        marginTop: 30
    },
    header: {
        fontFamily: "System",
        fontSize: 18
    },
    inputsContainer: {
        flex: 1,
        alignItems: "center",
        width: "80%"
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
        paddingTop: 15
    },
    addressList: {
        flex: 3, 
        width: "100%", 
        marginTop: 20,
        marginBottom: 40
    }, 
    textContainer: {
        padding: 15
    },
    textLabel: {
        fontSize: 16, 
        fontWeight: "bold"
    },
    textAddress: {
        fontSize: 16
    },
    rowFront: {
        paddingLeft: 10,
        backgroundColor: "#ffffff",
        borderBottomColor: "#B9B5B5",
        borderBottomWidth: 1,
        justifyContent: "center",
        minHeight: 60,
        paddingTop: 7,
        paddingBottom: 7
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
    },
    cancelButton: {
        width: 30,
        height: 30,
        paddingBottom: 30
    }
});

export default Places;
