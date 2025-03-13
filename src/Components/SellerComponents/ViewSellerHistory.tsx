import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import { AddressSelection } from '../Shows/AddressSelection';

const ViewSellerHistory = () => {
  const Navigaiton = useNavigation()
  return (
    <>
    <Header/>
    <View style={styles.container}>
      {/* Icon Image */}
      <Ionicons name="bag-outline" size={80} color="#b0b0b0" style={styles.icon} />
      
      {/* Main Message */}
      <Text style={styles.title}>No Orders Yet</Text>
      <Text style={styles.subtitle}>
        You haven't received any orders yet. Your orders will appear here once customers start making purchases.
      </Text>
      
      {/* Button to go to Seller Hub */}
      <TouchableOpacity style={styles.button} onPress={()=>Navigaiton.goBack()}>
        <Text style={styles.buttonText}>Go to Seller Hub</Text>
      </TouchableOpacity>
      
      
    </View>
    </>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#ffb900',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 30,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  options: {
    width: '100%',
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ViewSellerHistory;