import React, { useContext } from "react";
import { StyleSheet, View, Text, Dimensions, ScrollView, Image, AsyncStorage, Alert } from "react-native";
import { Button } from "react-native-elements";

import AuthContext from "../context/auth";
import ShowScreen from "../context/screens";

const window = Dimensions.get('window');

const Menu = props => {
    const { setNewEvent, setPlaces, setEvents } = useContext(ShowScreen);
    const { email, showAuth } = useContext(AuthContext);

    const showPlacesPage = () => {
        setPlaces(true);
        setEvents(false);
        props.setMenuOpen(false);
    };

    const showPickerPage = () => {
        setNewEvent(true);
        setEvents(false);
        props.setMenuOpen(false);
    };

    const showLogOutAlert = () => {
        Alert.alert(
            "Are you sure you want to log out?",
            "",
            [
                {
                    text: "Log Out", onPress: () => logOutHandler()
                },
                {
                    text: 'Cancel',
                    style: "cancel",
                }
            ]
        )
    };

    const logOutHandler = async () => {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("email");
        showAuth();
    };

    const { visible } = props;
    if (!visible) {
        return null;
    } 
    return(
        <ScrollView scrollsToTop={false} style={styles.sideMenu}>
            <View style={styles.avatarContainer}>
                <Image
                    style={styles.avatar}
                    source={require("../images/user.png")}
                />
                <Text style={styles.email}>{email}</Text>
            </View>
            <View>
                <View style={styles.menuButton}>
                    <Button
                        title={"My Addresses"}
                        type="clear"
                        titleStyle={styles.item}
                        onPress={showPlacesPage}
                    />
                    <Button
                        title={"Add new route"}
                        type="clear"
                        titleStyle={styles.item}
                        onPress={showPickerPage}
                    />
                    <Button
                        title={"Log Out"}
                        type="clear"
                        titleStyle={styles.item}
                        onPress={showLogOutAlert}
                    />
                </View>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    sideMenu: {
        flex: 1,
        width: window.width,
        height: window.height,
        backgroundColor: "#CCCCCC",
        paddingTop: 35
    },
    avatarContainer: {
        flex: 1,
        paddingBottom: 20,
        paddingTop: 20,
        paddingLeft: 20
    },
    avatar: {
        width: 53,
        height: 53,
        borderRadius: 24,
        flex: 1,
    },
    email: {
        paddingTop: 5,
        fontFamily: "System",
        fontSize: 18
    },
    menuButton: {
        flex: 1,
        alignItems: "flex-start",
        paddingLeft: 20
    },
    item: {
        fontFamily: "System",
        fontSize: 18
    }
  });

export default Menu;