import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

export const getPushTokenAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    let token = await Notifications.getExpoPushTokenAsync();
    return {
        status: status === "granted",
        token
    }
};
