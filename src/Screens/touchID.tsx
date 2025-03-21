import { View, Text, Alert, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true // Enables Android 12+ native biometric UI
});

const TouchIDScreen = () => {
    const [isAuth , setAuth] = React.useState(false)
    
    const optionalConfigObject = {
        title: 'Authentication Required', // Android
        imageColor: '#e00606', // Android
        imageErrorColor: '#ff0000', // Android
        sensorDescription: 'Touch sensor', // Android
        sensorErrorDescription: 'Failed', // Android
        cancelText: 'Cancel', // Android
        fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
        unifiedErrors: false, // use unified error messages (default false)
        passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
      };

      useEffect(() => {
        checkAuthStatus()
        }, [])

        const checkAuthStatus = async() =>{
            const authStatus = await AsyncStorage.getItem('auth')
            if(authStatus !== 'true'){
                handleBiometricAuth();
            }else{
                setAuth(true)
            }
        }



        const handleBiometricAuth = async () => {
            try {
                const { available, biometryType } = await rnBiometrics.isSensorAvailable();
                
                if (available && (biometryType === 'Biometrics' || biometryType === 'Fingerprint')) {
                    const result = await rnBiometrics.simplePrompt({ promptMessage: 'Authenticate to Continue' });
                    
                    if (result.success) {
                        await AsyncStorage.setItem('isAuthenticated', 'true');
                        setAuth(true);
                        Alert.alert('Authenticated Successfully');
                    } else {
                        Alert.alert('Authentication Failed');
                        BackHandler.exitApp();
                    }
                } else {
                    Alert.alert('Biometric Authentication Not Available');
                }
            } catch (error) {
                Alert.alert('Error', 'Biometric authentication failed.');
            }
        };

  return (
    <View>
      <Text>{isAuth ? 'Authenticated' : 'Please Authenticate'}</Text>
      </View>
  )
}

export default TouchIDScreen