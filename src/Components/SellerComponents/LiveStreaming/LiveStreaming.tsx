import React, { useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Modal,
  ToastAndroid,
} from 'react-native';
import Header from '../Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import api from '../../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native-paper';
import {generateSignedUrl} from '../../../Utils/aws';


const LiveStreaming = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [shows, setshows] = useState([]);
  const [loading, setloading] = useState(false);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setselectedId] = useState('');
  const backcolor = status => {
    switch (status) {
      case 'created':
        return 'green';
      case 'Upcoming':
        return 'orange';
      default:
        return 'red';
    }
  };
  const renderItem = ({item}) => {
    return (
      <View style={styles.renderContent}>
        <View style={styles.itemContainer}>
          <Image
            source={{uri: item.thumbnailImage}}
            style={styles.thumbnailImage}
          />
          <View style={styles.textContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems:'center',
                width: '70%',
              }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text
                style={[
                  styles.status,
                  {backgroundColor: backcolor(item.showStatus)},
                ]}>
                {item.showStatus}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name='pie-chart' size={20} color='brown'/>
            <Text style={styles.category}>{item.category} {item.subCategory}</Text>
            </View>
  

            <View style={styles.row}>
              <MaterialIcons name='access-time' size={18} color='#5a52e6'/>
            <Text style={styles.time}>
              {item.time} {new Date(item.date).toLocaleDateString()}
            </Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          
          {item.showStatus!="cancelled" && item.showStatus!='ended'?
             <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Streaming', {item})}>
            <Text style={styles.buttonText}>Start Show</Text>
          </TouchableOpacity>:null}
          {item.showStatus!='ended'?
          <>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditLs', {item})}>
            <Feather name="edit" size={15} color="white" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
           <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setIsModalVisible(true);
              setselectedId(item._id);
            }}>
            <Icon name="close" size={16} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          </>:null}
         
        </View>
      </View>
    );
  };
  const handleReject = async () => {
    setloading(true);
    // console.log(id);
    try {
      const response = await api.patch(`/shows/${id}/cancel`, {showStatus: 'cancelled'});
      fetchShows();
      ToastAndroid.show('Show Cancelled', ToastAndroid.SHORT);
    } catch (error) {
      console.log('error cancelling the show', error);
    } finally {
      setloading(false);
      setIsModalVisible(false);
    }
  };
  const fetchShows = async () => {
    setloading(true);
    try {
      const id = (await AsyncStorage.getItem('sellerId')) || '';
      const response = await api.get(`/shows/seller/${id}`);

      const updatedData = await Promise.all(
        response.data.data.map(async item => {
          const url = await generateSignedUrl(item.thumbnailImage);
          return {...item, thumbnailImage: url};
        }),
      );
      // console.log(updatedData)
      setshows(updatedData);
    } catch (error) {
      console.log('Error', error);
    } finally {
      setloading(false);
    }
  };
   useFocusEffect(
      React.useCallback(() => {
        fetchShows();
        return () => {
               
        };
      }, [])
    );
  const filteredShows =
    activeTab === 'all'
      ? shows
      : shows.filter(show => show?.showStatus?.toLowerCase() === activeTab.toLowerCase());
  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <ActivityIndicator color="gray" size={20} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      ) : null}
      {/* <View style={{backgroundColor:'#ff'}}> */}
       <Animatable.View
              animation={'slideInDown'}
              iterationCount={1}
              style={styles.iconContainer}>
          <Header />
        </Animatable.View>
 
      <View style={styles.container}>
    
        <FlatList
          data={filteredShows}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{paddingBottom:100}}
          ListHeaderComponent={<>
            <Animatable.View
              animation={'fadeInLeft'}
              iterationCount={1}
              style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LiveStreamForm')}>
          <Feather name="plus" color="" size={20} />
          <Text style={{fontSize: 16}}>Create Show</Text>
        </TouchableOpacity>
        </Animatable.View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.tabBar}
          showsHorizontalScrollIndicator={false}>
          {/* All Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}>
            <Animatable.View
              animation={activeTab === 'all' ? 'pulse' : 'pulse'}
              iterationCount="infinite"
              style={styles.iconContainer}>
              <Foundation
                name="list"
                size={20}
                color={activeTab === 'all' ? '#16161a' : '#fff'}
              />
            </Animatable.View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeText,
              ]}>
              All
            </Text>
          </TouchableOpacity>

          {/* Upcoming Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Created' && styles.activeTab]}
            onPress={() => setActiveTab('Created')}>
            <Animatable.View
              animation={activeTab === 'Created' ? 'pulse' : 'swing'}
              iterationCount="infinite"
              style={styles.iconContainer}>
              <Feather
                name="slack"
                size={20}
                color={activeTab === 'Created' ? '#16161a' : '#fff'}
              />
            </Animatable.View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'Created' && styles.activeText,
              ]}>
              Created
            </Text>
          </TouchableOpacity>

          {/* Live Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'live' && styles.activeTab]}
            onPress={() => setActiveTab('live')}>
            <Animatable.View
              animation={activeTab === 'live' ? 'rotate' : 'rotate'}
              iterationCount="infinite"
              style={styles.iconContainer}>
              <Icon
                name="play-circle"
                size={20}
                color={activeTab === 'live' ? '#16161a' : '#fff'}
              />
            </Animatable.View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'live' && styles.activeText,
              ]}>
              Live
            </Text>
          </TouchableOpacity>

          {/* Ended Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
            onPress={() => setActiveTab('cancelled')}>
            <Animatable.View
              animation={activeTab === 'cancelled' ? 'pulse' : 'pulse'}
              iterationCount="infinite"
              style={styles.iconContainer}>
              <Icon
                name="close"
                size={20}
                color={activeTab === 'cancelled' ? '#16161a' : '#fff'}
              />
            </Animatable.View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'cancelled' && styles.activeText,
              ]}>
              Cancelled
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ended' && styles.activeTab]}
            onPress={() => setActiveTab('ended')}>
            <Animatable.View
              animation={activeTab === 'ended' ? 'bounce' : 'fadeIn'}
              iterationCount="infinite"
              style={styles.iconContainer}>
              <Icon
                name="stop-circle"
                size={20}
                color={activeTab === 'ended' ? '#16161a' : '#fff'}
              />
            </Animatable.View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'ended' && styles.activeText,
              ]}>
              Ended
            </Text>
          </TouchableOpacity>
        </ScrollView>
          </>}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                marginTop: 100,
                // flex:1,
                // backgroundColor:'#fff',
                alignSelf: 'center',
                // height:'100%',
                gap:10
              }}>
              <Feather name="cpu" color="#777" size={30} />
              <Text style={{color: '#777', fontSize: 16, textAlign: 'center'}}>
                No Shows in {activeTab} category.  </Text>
            </View>
          }
        />
      </View>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Are you Sure want to cancel the Show ?
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.submitButtonText}>Return</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleReject()}>
                <Text style={styles.closeButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* </View> */}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height:'100%'
    paddingHorizontal: 20,
    // backgroundColor:'#fff',
  },
  actions: {
    flexDirection: 'row',
    marginBottom:10,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
  },
  row:{
    flexDirection:'row',
    gap:5,
    marginBottom:10,
    flexWrap:1,
    alignItems:'center'
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    // height: '60%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flex: 1, // Ensures the checkbox and text take up the available space
  },
  tagText: {
    fontSize: 16,
    marginLeft: 10,
  },

  submitButton: {
    backgroundColor: '#fcd34d',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '50%',
  },
  submitButtonText: {
    // color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 5,
    width: '50%',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 7,
    backgroundColor: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    // padding: 10,
    marginTop: 10,
    paddingBottom: 10,
  },
  renderContent: {
    // marginBottom: 50,
    // alignItems:'c'
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  thumbnailImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    // width:140
    textAlign:'left',width:130
  },
  category: {
    fontSize: 14,
    // marginBottom: 5,
    width:'70%',
    color: 'gray',
  },
  subCategory: {
    fontSize: 14,
    marginBottom: 5,
    color: 'gray',
  },
  time: {
    fontSize: 14,
    color: 'gray',
    // marginBottom: 5,
  },
  streamUrl: {
    fontSize: 12,
    color: 'blue',
    marginBottom: 10,
  },
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
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  button: {
    paddingVertical: 7,
    gap:10,
    marginTop:10,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  status: {
    backgroundColor: '#333',
    textTransform: 'capitalize',
    color: 'white',
    fontSize: 16,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 50,
    alignItems: 'center',
    marginBottom: 20, // Remove any unwanted space
  },
  tab: {
    height: 40,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFD700', // Golden color for active tab
  },
  iconContainer: {},
  tabText: {
    color: '#fff', // White text for tab labels
    fontSize: 14,
  },
  activeText: {
    color: '#16161a', // Dark text for active tab
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 18,
    color: '#16161a',
  },
});

export default LiveStreaming;
