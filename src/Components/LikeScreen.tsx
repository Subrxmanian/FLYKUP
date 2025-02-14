import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const likeData = [
  {
    id: '1',
    name: 'Daffa Kereh',
    time: '39m',
    message: 'From your contact is on HackLife as daffa_cabul.',
    image: require('../assets/images/makkapa1.png'), 
    follow: true,
  },
  {
    id: '2',
    name: 'Fridolina Chang',
    time: '1h',
    message: 'From your contact is on HackLife as linaaselele.',
    image: require('../assets/images/profile-1.jpg'),
    follow: true,
  },
  {
    id: '3',
    name: 'Fridolina and others',
    time: '4h',
    message: 'Liked your videos.',
    image: require('../assets/images/profile-2.jpg'),
    follow: false,
  },
  {
    id: '4',
    name: 'Mahmud',
    time: '12h',
    message: 'Liked your videos.',
    image: require('../assets/images/profile-3.jpg'),
    follow: true,
  },
];

const LikeScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.userImage} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {item.follow && (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.heading}>
        <Text style={styles.headingtext}>New</Text>
      </TouchableOpacity>
      <FlatList
        data={likeData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading:{
    backgroundColor:'rgb(235 235 251)',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:10,
    // flex:1,
  },
  headingtext:{
    fontSize:16,
    marginBottom:10,
    // textAlign:'center',
    color:"blue"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    color: '#555',
    fontSize: 14,
  },
  time: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  followButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  followText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LikeScreen;