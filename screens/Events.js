import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Text, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { Button } from "react-native-elements";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SideMenu from "react-native-side-menu";
import { SwipeListView } from 'react-native-swipe-list-view';
import moment from "moment";

import AuthContext from "../context/auth";
import ConditionalView from "../components/ConditionalView";
import ImageButton from "../components/ImageButton";
import Menu from "../components/Menu";
import ShowScreen from "../context/screens";

const Events = props => {
    const [datePicker, setDatePicker] = useState(false);
    const [eventDate, setEventDate] = useState(moment().format("MMM Do YY"));
    const [events, setEvents] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const { token, showAuth } = useContext(AuthContext);
    const { refreshEvents, setRefreshEvents } = useContext(ShowScreen);

    useEffect(() => {
        if (token && token !== 'none') {
            getEvents();
        }
    }, []);

    useEffect(() => {
        if (token && token !== 'none') {
            getEvents();
        }
    }, [eventDate, token]);

    useEffect(() => {
        if (refreshEvents === true && token && token !== 'none') {
            getEvents();
            setRefreshEvents(false);
        }
    }, [refreshEvents]);

    const hideDatePicker = () => {
        setDatePicker(false);
    };

    const showDatePicker = () => {
        setDatePicker(true);
    };

    const handleDateConfirm = date => {
        const eventDate = moment(date).format("MMM Do YY");
        setEventDate(eventDate);
        hideDatePicker();
    };

    const getEvents = async() => {
        const date = eventDate;
        const result = await fetch("http://localhost:3000/events", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Auth-Token": token
            },
            body: JSON.stringify({
                date,
                utcOffset: moment().utcOffset()
            })
        })
        if(result.status === 200) {
            const data = await result.json();
            const fields = data.map((event) => (
                {
                    id: event.id,
                    fromAddress: event.origin.formattedAddress,
                    toAddress: event.destination.formattedAddress,
                    time: moment(event.time, "H:mm:ss").add(moment().utcOffset(), "minutes").format("hh:mm A"),
                    estimate: moment.duration(event.estimatedTime, "seconds").humanize(),
                    realtimeEstimate: event.realTime ? moment.duration(event.realTime, "seconds").humanize() : null,
                    recurrent: event[`every${moment(eventDate, "MMM Do YY").format("dddd")}`]
                }
            ));
            setEvents(fields);
        } else if (result.status === 401) {
            showAuth();
        }
    };

    const sendDeleteEventRequest = async (id, todayOnly = false) => {
        const result = await fetch(`http://localhost:3000/deleteEvent/${id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Auth-Token": token
            },
            body: JSON.stringify({
                todayOnly,
                eventDate
            })
        })
        if(result.status === 200) {
            getEvents();
        } else if (result.status === 401) {
            showAuth();
        }
    };

    const deleteEvent = async({id, recurrent}) => {
        if(recurrent) {
            Alert.alert(
                "You are trying to delete a recurring route",
                "My Alert Msg",
                [
                    {
                        text: "Only for today",
                        onPress: () => sendDeleteEventRequest(id, true)
                    },
                    {
                        text: "Remove this event completely", 
                        onPress: () => sendDeleteEventRequest(id)
                    },
                    {
                        text: "Cancel", 
                        onPress: () => console.log("Cancel")
                    }
                ]
            )
        } else {
            sendDeleteEventRequest(id);
        }
    };
    const menu = <Menu visible={menuOpen} navigator={navigator} setMenuOpen={setMenuOpen}/>

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    };

    return (
        <ConditionalView
            visible={props.visible}
            style={styles.conditionalView}
        > 
            <SideMenu
                menu={menu} 
                isOpen={menuOpen} 
                onChange={setMenuOpen}
            >
                <View style={styles.container}>
                    <View style={styles.menuButton}>
                        <TouchableOpacity
                            onPress={toggleMenu}
                        >
                        <Image
                            source={require("../images/menu.png")}
                            style={styles.menuImage}
                        />
                        </TouchableOpacity>
                     </View>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Your Daily Commute</Text>
                    </View>
                </View>
                <View style={styles.dateWrapper}>
                    <Button 
                        title={eventDate} 
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
                <View style={styles.addressList}>
                    <ScrollView>
                        <SwipeListView
                            closeOnRowPress={true}
                            data={events}
                            keyExtractor={item => item.id.toString()}
                            renderItem={(event) => {
                                return (
                                <View style={styles.rowFront}>
                                    <Text style={styles.text}>To: {event.item.fromAddress}</Text>
                                    <Text style={styles.text}>From: {event.item.toAddress}</Text>
                                    <Text style={styles.text}>At: {event.item.time}</Text>
                                    <Text style={styles.text}>Estimated Time: {event.item.estimate}</Text>
                                    {event.item.realtimeEstimate && (<Text style={styles.text}>Time In Traffic: {event.item.realtimeEstimate}</Text>)}
                                </View>
                            )}}
                            renderHiddenItem={(event, rowMap) => (
                                <View style={styles.rowBack}>
                                <ImageButton
                                    imageStyle={styles.cancelButtonImage}
                                    source={require("../images/trash.png")}
                                    onPress={() => {
                                        deleteEvent(event.item);
                                        rowMap[event.item.id.toString()].closeRow();
                                    }}
                                />
                                </View>
                            )}
                            leftOpenValue={0}
                            rightOpenValue={-75}
                        />
                    </ScrollView>
                </View>
            </SideMenu>
        </ConditionalView>
    )
};

const styles = StyleSheet.create({
    conditionalView: {
        flex: 1,
        alignItems: "center",
        width: "100%",
    },
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 30,
        backgroundColor: "#ffffff"
    },
    menuButton: {
        paddingTop: 20, 
        paddingLeft: 10,
        paddingLeft: 20
    },
    menuImage: {
        width: 40, 
        height: 40
    },
    headerContainer: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
        paddingTop: 22,
        paddingRight: 50
    },
    header: {
        fontFamily: "System",
        fontSize: 20
    },
    dateWrapper: {
        flex: 1,
        alignContent: "center", 
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingTop: 10
    },
    addressList: {
        flex: 5,
        width: "100%",
        backgroundColor: "#ffffff"
    }, 
    textContainer: {
        padding: 15
    },
    text: {
        fontSize: 18
    },
    rowFront: {

        paddingLeft: 15,
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
    }
});

export default Events;