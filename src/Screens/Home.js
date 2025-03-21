
// import React, { Component } from 'react';
// import { View, Text, StyleSheet, Button, Platform } from 'react-native';



// const Home = ({ navigation }) => {

//     return (
//         <View style={styles.container}>
//             <Text>Home Screen</Text>
//             <Button title='Go To Setting' onPress={() => navigation.navigate('Settings')} />
//             <View style={{ marginVertical: 16 }} />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
// });

// //make this component available to the app
// export default Home;


import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Vibration } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('Foreground Notification:', remoteMessage);
            Vibration.vibrate(1000);
            Alert.alert(
                remoteMessage.notification?.title || 'New Notification',
                remoteMessage.notification?.body,
                [{ text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }]
            );
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('App Opened from Notification:', remoteMessage);
            if (remoteMessage?.notification) {
                [{ text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }]
            }
        });

        messaging().getInitialNotification().then((remoteMessage) => {
            if (remoteMessage) {
                console.log('App Launched from Notification:', remoteMessage);
                [{ text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }]
            }
        });

        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log('Background Notification:', remoteMessage);
            await notifee.displayNotification({
                title: remoteMessage.notification?.title || 'No Title',
                body: remoteMessage.notification?.body || 'No Body',
                android: {
                    channelId: 'default',
                    importance: AndroidImportance.HIGH,
                    smallIcon: 'ic_launcher',
                    pressAction: { id: 'open-settings' },
                },
            });
        });
    }, []);

    return (
        <View style={styles.container}>
            <Text>Home Screen</Text>
            <Button title='Go To Setting' onPress={() => navigation.navigate('Settings')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Home;
