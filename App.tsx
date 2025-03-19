import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, View, Button, Image, Platform, TouchableOpacity, Text, Vibration,StyleSheet } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { launchImageLibrary } from 'react-native-image-picker';
import { Route } from './src/Navigation/Routes';
import notifee, { AndroidImportance } from '@notifee/react-native';
import  Settings  from './src/Screens/Setting';



import { NavigationProp } from '@react-navigation/native';

const App = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const imagePicker = async () => {
    console.log("Button Pressed");

    const permissionGranted = await requestStoragePermission();
    if (!permissionGranted) return;

    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      console.log("Response:", response);

      if (response.didCancel) {
        Alert.alert('Cancelled', 'You did not select any image');
      } else if (response.errorMessage) {
        Alert.alert('Image Picker Error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
        console.log("Image Selected:", response.assets[0].uri);
      }
    });
  };

  useEffect(() => {
    requestPermission();
    createNotificationChannel(); 
    getToken();
    handleBackgroundNotification();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification Permission Granted');
      } else {
        console.log('Notification Permission Denied');
      }
    }
  };

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
  };

  async function createNotificationChannel() {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground Notification:', remoteMessage);
      Vibration.vibrate(1000);
  
      if (remoteMessage.notification) {
        // Show an alert first
        Alert.alert(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body,
          [
            {
              text: 'OK',
              onPress: async () => {
               
                await notifee.displayNotification({
                  title: remoteMessage.notification?.title || 'No Title',
                  body: remoteMessage.notification?.body,
                  android: {
                    channelId: 'default',
                    importance: AndroidImportance.HIGH,
                    
                  },
                });
              },
            },
          ]
        );
      }
    });
  
    return unsubscribe;
  }, []);

  const handleBackgroundNotification = () => {
    // App is in background, user taps the notification
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App Opened from Notification:', remoteMessage);
      if (remoteMessage?.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
    });


    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App Launched from Notification:', remoteMessage);
          if (remoteMessage?.notification) {
            navigation.navigate('Settings');
          }
        }
      });
      
  // };
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background Notification:', remoteMessage);
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'No Title',
      body: remoteMessage.notification?.body || 'No Body',
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'open-settings',
        },
      },
    });
  });
};

  return (
    <View style={styles.container}>
      <Route />
      <TouchableOpacity onPress={imagePicker} style={styles.button}>
        <Text style={styles.buttonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={styles.image}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});


export default App;
