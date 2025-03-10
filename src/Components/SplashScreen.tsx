import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, ToastAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import api from '../Utils/Api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Snackbar from 'react-native-snackbar';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const [internetConnected, setInternetConnected] = useState(true); // Track if internet is available
  const [wasDisconnected, setWasDisconnected] = useState(false); // To show a toast/snackbar when reconnecting
  const logoOpacity = new Animated.Value(0);
  const logoTranslateY = new Animated.Value(50);
  const textOpacity = new Animated.Value(0);

  // Use to check the internet connection and perform API logic
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;
      setInternetConnected(isConnected);

      if (!isConnected) {
        setWasDisconnected(true);
        Snackbar.show({
          text: 'No Internet Connection',
          backgroundColor: 'red',
        });
      } else {
        if (wasDisconnected) {
          Snackbar.dismiss(); // Dismiss "No Internet" Snackbar
          setTimeout(() => {
            Snackbar.show({
              text: 'Back to Online',
              backgroundColor: 'green',
            });
          }, 250);
        }
        setWasDisconnected(false);
        fetchVersion(); // Fetch version when connected
      }
    });

    return () => unsubscribe();
  }, [wasDisconnected]);

  // Function to fetch version and handle logic
  const fetchVersion = async () => {
    try {
      const response = await api.get('/settings/get');
      const currentVersion = await DeviceInfo.getVersion();

      if (currentVersion === response?.data?.data?.appSettings?.userAppVersion) {
        const name = await AsyncStorage.getItem("userName") || '';
        if (!name) navigation.navigate('Login');
        else navigation.navigate("bottomtabbar");
      } else {
        navigation.navigate('update');
      }
    } catch (error) {
      console.log('Error fetching version:', error);
      // ToastAndroid.show("No Internet. Retrying...", ToastAndroid.SHORT);
    }
  };

  // Initial animation sequence for logo and text
  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 1000, // Fade out the logo
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000, 
          useNativeDriver: true,
        }).start();
      }, 1000); // Start text animation after logo fade out
    }, 3000); // Delay before starting the fade-out and text animation
  }, []);

  return (
    <View style={styles.container}>
      {/* Show logo with animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/logo.png')} // Path to your logo image
          style={styles.logo}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Show title and subtitle with animation */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
          },
        ]}
      >
        FLYKUP
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: textOpacity,
          },
        ]}
      >
        Your Flykup Journey Begins Here
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 159,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SplashScreen;
