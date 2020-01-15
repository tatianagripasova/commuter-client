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

const SIGNIFICANT_CHANGE = 20;

const Events = props => {
    const [datePicker, setDatePicker] = useState(false);
    const [eventDate, setEventDate] = useState(moment().format("MMM Do YY"));
    const [events, setEvents] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const { token, showAuth } = useContext(AuthContext);
    const { refreshEvents, setRefreshEvents, setNewEvent, setEvents: setEventsPage, dark } = useContext(ShowScreen);

    const showNewEventPage = () => {
        setNewEvent(true);
        setEventsPage(false);
    };

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
        const result = await fetch("http://commuter.guru/events", {
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
                    recurrent: event[`every${moment(eventDate, "MMM Do YY").format("dddd")}`],
                    increasePercent: (event.realTime - event.estimatedTime) * 100 / event.estimatedTime
                }
            ));
            setEvents(fields);
        } else if (result.status === 401) {
            showAuth();
        }
    };

    const sendDeleteEventRequest = async (id, todayOnly = false) => {
        const result = await fetch(`http://commuter.guru/deleteEvent/${id}`, {
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
                "You Are Trying to Delete a Recurring Route",
                "",
                [
                    {
                        text: "Delete Only for Today",
                        onPress: () => sendDeleteEventRequest(id, true)
                    },
                    {
                        text: "Remove This Event Completely", 
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
                        titleStyle={{ fontSize: 16 }}
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
                </View>
                <View style={styles.eventList}>
                    {!events.length && (
                        <View style={styles.emptyListContainer}>
                            <View style={styles.addEventText}>
                                <Text style={styles.text}>It seems you don't have any events for this date yet.</Text>
                            </View>
                        </View>
                    )}
                    <ScrollView>
                        <SwipeListView
                            closeOnRowPress={true}
                            data={events}
                            keyExtractor={item => item.id.toString()}
                            renderItem={(event) => {
                                const fromAddressArr = event.item.fromAddress.split(", ");
                                const toAddressArr = event.item.toAddress.split(", ");
                                if(fromAddressArr[fromAddressArr.length - 1] === toAddressArr[toAddressArr.length - 1]) {
                                    fromAddressArr.pop();
                                    toAddressArr.pop();
                                }
                                let trafficColor = "green";
                                if (event.item.realtimeEstimate) {
                                    if(event.item.increasePercent >= SIGNIFICANT_CHANGE) {
                                        trafficColor = "red";
                                    }
                                };
                                return (
                                <View style={styles.rowFront}>
                                    <View style={styles.addressContainer}>
                                        <View style={styles.arrowImage}>
                                            <Image
                                                source={require("../images/arrow.png")}
                                            />
                                        </View>
                                        <View style={styles.addresses}>
                                            <Text style={styles.text}>{fromAddressArr.join(", ")}</Text>
                                            <Text style={styles.text}>{toAddressArr.join(", ")}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.timeContainer}>
                                        <View style={styles.arrival}>
                                            <View style={styles.timeImage}>
                                                <Image
                                                    source={require("../images/time.png")}
                                                    style={{ width: 25, height: 25 }}
                                                />
                                            </View>
                                            <View style={styles.arrivalTime}>
                                                <Text style={{ ...styles.text, paddingTop: 4}}>{event.item.time}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.drive}>
                                            <View style={styles.carImage}>
                                                <Image
                                                    source={require("../images/car.png")}
                                                    style={{ width: 25, height: 25 }}
                                                />
                                            </View>
                                            <View style={styles.timeInTraffic}>
                                                <Text style={{ ...styles.text, color: trafficColor, paddingTop: 4 }}>{event.item.realtimeEstimate || event.item.estimate} drive</Text>
                                            </View>
                                        </View>
                                    </View>
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
                <View style={styles.addNewEvent}>
                    <View style={styles.addEventImage}>
                        <ImageButton
                            imageStyle={styles.addButtonImage}
                            source={require("../images/add.png")}
                            onPress={showNewEventPage}
                        />
                    </View>
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
        paddingTop: 30,
        paddingRight: 50
    },
    header: {
        fontFamily: "System",
        fontSize: 18
    },
    emptyListContainer: {
        flex: 1,
        alignItems: "center",
        alignContent: "center"
    },
    addEventText: {
        flex: 1,
        padding: 20
    },
    addEventImage: {
        flex: 1
    },
    addButtonImage: {
        width: 50,
        height: 50
    },
    dateWrapper: {
        flex: 1,
        alignContent: "center", 
        alignItems: "center",
        backgroundColor: "#ffffff"
    },
    eventList: {
        flex: 7,
        width: "100%",
        paddingLeft: 10,
        backgroundColor: "#ffffff"
    },
    addressContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    arrowImage: {
        flex: 1
    },
    addresses: {
        flex: 10,
        paddingLeft: 10
    },
    text: {
        fontFamily: "System",
        fontSize: 16,
        paddingBottom: 17
    },
    timeContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    arrival: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    timeImage: {
        flex: 1,
    },
    arrivalTime: {
        flex: 2
    },
    drive: {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    carImage: {
        flex: 1
    },
    timeInTraffic: {
        flex: 6
    },
    rowFront: {
        paddingLeft: 15,
        backgroundColor: "#ffffff",
        borderBottomColor: "#B9B5B5",
        borderBottomWidth: 1,
        minHeight: 60,
        paddingTop: 7,
        paddingBottom: 7,
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
    addNewEvent: {
        flex: 2,
        backgroundColor: "#ffffff"
    }
});

export default Events;