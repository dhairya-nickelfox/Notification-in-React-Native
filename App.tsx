import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, View, Button, Image, Platform, TouchableOpacity, Text } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { launchImageLibrary } from 'react-native-image-picker';

const App = () => {
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

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground Notification:', remoteMessage);
      if (remoteMessage.notification) {
        Alert.alert('New Notification', remoteMessage.notification.body);
      }
    });

    return unsubscribe;
  }, []);

  const handleBackgroundNotification = () => {
    messaging()
      .setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background Notification:', remoteMessage);
      });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App Opened from Notification:', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App Launched from Notification:', remoteMessage);
        }
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      
      <TouchableOpacity onPress={imagePicker} style={{
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Pick Image from Gallery</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75, // Circular shape
            borderWidth: 3,
            borderColor: '#fffff',
          }}
        />
      )}
    </View>
  );
};

export default App;
