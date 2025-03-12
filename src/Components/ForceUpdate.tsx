import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';

const ForceUpdate = () => {
  return (
    <View style={styles.container}>
      {/* Set the status bar to dark content */}
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Rocket Image */}
        <Image
          source={require('../assets/images/rocket.png')} // Add a rocket image in the assets folder
          style={styles.rocket}
        />
        
        {/* Update message */}
        <Text style={styles.title}>New update is available</Text>
        
        {/* Informational Text */}
        <Text style={styles.subtitle}>
          The current version of this application is no longer supported. We apologize for any inconvenience we may have caused you.
        </Text>
        
        {/* Update Button */}
        <TouchableOpacity style={styles.button} >
          <Text style={styles.buttonText}>Update now</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>No, Thanks! Close the app</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black theme
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    textAlign: 'center',
  },
  rocket: {
    width: 200,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e90ff', // Blue button
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForceUpdate;