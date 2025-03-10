import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
const Header = () => {
    const navigation =useNavigation()
  return (
    <View style={{backgroundColor:'#fff'}}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={()=>navigation.goBack()}>
      <AntDesign name="left" size={20} color='white'/>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Image
        source={require('../../assets/images/Logo-Flikup.png')} // Replace with your logo URL
        style={styles.logo}
        resizeMode='contain'
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16161a',
    paddingHorizontal: 20,
    borderBottomEndRadius:30,
    borderBottomLeftRadius:40,
    paddingVertical: 10,
    // marginBottom:10,
    
  },
  backButton: {
    justifyContent: 'center',
    flexDirection:'row',
    gap:10,
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
  },
  logo: {
    width: 90,
    height: 50, // Adjust size according to your logo
  },
});

export default Header;
