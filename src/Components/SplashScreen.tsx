import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, ActivityIndicator, ToastAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import api from '../Utils/Api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const [versions, setVersions] = useState(null); // Set to null to check if version is not fetched yet
  const [loading, setLoading] = useState(true); // Manage loading state for fetching version

  // Animation values
  const logoOpacity = new Animated.Value(0);
  const logoTranslateY = new Animated.Value(50);
  const textOpacity = new Animated.Value(0);

  // Start animation and navigation after splash screen display
  useEffect(() => {
    // Sequence for animation
    Animated.sequence([
      // Fade in and slide up logo
      Animated.parallel([
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
      ]),
      // Fade in text
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      handleNavigation();
    }, 3000);

    // Clean up timer on component unmount
    return () => clearTimeout(timer);
  }, [versions]);

  // Fetch app version and compare it with the server version
  const fetchVersion = async () => {
    try {
      const response = await api.get('/settings/get');
      setVersions(response.data.data.appSettings);
      setLoading(false); // Set loading to false when the version is fetched
    } catch (error) {
      ToastAndroid.show("No Internet",ToastAndroid.SHORT)
      console.log('Error fetching version:', error);
      
      setLoading(false);
    }
  };

  const handleNavigation = async () => {
    const currentVersion = await DeviceInfo.getVersion();
    // AsyncStorage.removeItem("userName")
    // If the version is not fetched yet, try fetching it again
    if (!versions) {
      fetchVersion();
      return;
    }

    // Navigate based on the version comparison
    if (currentVersion === versions.userAppVersion) {
      const name = await AsyncStorage.getItem("userName")||''
      if(!name)
      navigation.navigate('Login');
    else{
      navigation.navigate("bottomtabbar")
    }
    } else {
      navigation.navigate('update');
    }
  };

  // If loading, show a loader
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          source={require('../assets/images/logo.png')} // Logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

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
    width: width * 0.9, // Adjust logo size for better visual balance
    height: width * 0.7, // Maintain aspect ratio with width
  },
  title: {
    fontSize: 36, // Increased font size for better visibility
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18, // Slightly larger font for better readability
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SplashScreen;
