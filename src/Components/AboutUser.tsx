import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const AboutUserPage = () => {
  // Example data
  const user = {
    name: 'M.K.P.Anandh',
    profileImage: require('../assets/images/Index.png'),
    following: 78,
    followers: 926,
    likes: 1443,
    gallery: [
      { id: '1', image:  require('../assets/images/Index.png'), views: '400k' },
      { id: '2', image:  require('../assets/images/profile.jpg'), views: '1.2M' },
      { id: '3', image:  require('../assets/images/logo.png'), views: '250k' },
      { id: '4', image:  require('../assets/images/profile.jpg'), views: '1.9M' },
      { id: '5', image: require('../assets/images/Index.png'), views: '12k' },
      { id: '6', image: require('../assets/images/Index.png'), views: '56k' },
    ],
  };

  const renderGalleryItem = ({ item }: { item: { id: string; image: string; views: string } }) => (
    <View style={styles.galleryItem}>
      <Image source={item.image?item.image: require('../assets/images/Index.png')} style={styles.galleryImage} />
      <Text style={styles.galleryViews}>{item.views}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image source={ user.profileImage } style={styles.profileImage} />
        <Text style={styles.userName}>{user.name}</Text>
        {/* <View style={styles.iconRow}>
          <TouchableOpacity style={styles.icon} />
          <TouchableOpacity style={styles.icon} />
        </View> */}
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.likes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
      </View>

      {/* Gallery Section */}
      <FlatList
        data={user.gallery}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.galleryContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: '#ccc',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  navText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  galleryContainer: {
    marginTop: 10,
  },
  galleryItem: {
    flex: 1,
    margin: 5,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    // aspectRatio: 1,
    height:200,
    borderRadius: 10,
  },
  galleryViews: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
  },
});

export default AboutUserPage;