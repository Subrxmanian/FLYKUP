import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
const Comment = () => {
  // Sample chat data
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Mahmud',
      message: 'Typing message...',
      time: '04.04',
      unreadCount: 7,
      avatar: require('../assets/images/Index.png'),
    },
    {
      id: '2',
      name: 'Daffa Kereh',
      message: 'What was the best year of your life?',
      time: '04.08',
      unreadCount: 0,
      avatar: require('../assets/images/profile.jpg'),
    },
    {
      id: '3',
      name: 'Fridolina Chang',
      message: 'Wow look amazing',
      time: '04.09',
      unreadCount: 0,
      avatar: require('../assets/images/makkapa3.png'),
    },
    {
      id: '4',
      name: 'Pemuda Pancaindra',
      message: "Don't forget karaoke at 10 pm",
      time: '13:17',
      unreadCount: 25,
      avatar: require('../assets/images/Index.png'),
    },
    {
      id: '5',
      name: 'Nano Nao',
      message: 'Is that original AI?',
      time: 'Saturday',
      unreadCount: 0,
      avatar: require('../assets/images/profile-1.jpg'),
    },
    {
      id: '6',
      name: 'Listi Chan',
      message: 'Have a nice day',
      time: 'Monday',
      unreadCount: 1,
      avatar:require('../assets/images/profile-3.jpg'),
    },
  ]);

  // Function to render each chat item
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.chatItem}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.overlay}>
                  <View style={styles.overlayContainer}>
                 
                    <Text style={styles.loadingText}>Comming Soon</Text>
                  </View>
                </View>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatroom</Text>
        <TouchableOpacity style={styles.addButton}>
          {/* <Text style={styles.addButtonText}>+</Text>
          0 */}
          <AntDesign name="plus" size={20}/>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContainer: {
    // backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 10,
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    // backgroundColor: '#007BFF',
    borderWidth:1,
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    // color: '#fff',
    fontWeight: 'bold',
  },
  chatList: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth:1,
    borderBottomColor:'#ccc'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
    marginBottom:15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginBottom:10
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Comment;