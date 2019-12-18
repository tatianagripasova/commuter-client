import React, { useContext } from "react";
import { StyleSheet, View, Text, Dimensions, ScrollView, Image } from "react-native";
import { Button } from "react-native-elements";
import ShowScreen from "../context/screens";

const window = Dimensions.get('window');
const uri = 'https://pickaface.net/gallery/avatar/Opi51c74d0125fd4.png';

const Menu = props => {
    const { setPicker, setPlaces, setEvents } = useContext(ShowScreen);

    const showPlacesPage = () => {
        setPlaces(true);
        setEvents(false);
        props.setMenuOpen(false);
    };

    const showPickerPage = () => {
        setPicker(true);
        setEvents(false);
        props.setMenuOpen(false);
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
                    source={{ uri }}
                />
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
        width: 48,
        height: 48,
        borderRadius: 24,
        flex: 1,
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