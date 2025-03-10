/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Animated,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../Utils/Api';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {FAB} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
const Dasboard = () => {
  const Navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('User');
  const [drawerAnimation] = useState(new Animated.Value(250));
  const [user, setuser] = useState();
  const stories = [
    {id: '1', name: 'Andrew', image: require('../assets/images/profile-1.jpg')},
    {id: '2', name: 'Saro', image: require('../assets/images/profile-3.jpg')},
    {
      id: '3',
      name: 'Sridhar',
      image: require('../assets/images/profile-2.jpg'),
    },
    {
      id: '4',
      name: 'Saranya',
      image: require('../assets/images/profile-5.jpg'),
    },
    {id: '5', name: 'charu', image: require('../assets/images/profile-4.jpg')},
    // {id: '4', name: 'Anandh', image: require('../assets/images/logo.png')},
  ];

  const recentlyWatched = [
    {
      id: '1',
      userId: 'New Arrival Upgrade your setup! join Now',
      category: 'Jordyn Shop',
      live: true,
      tech: 'Tech',
      views: 59,
      image: require('../assets/images/makkapa1.png'),
    },
    {
      id: '2',
      userId: 'Still Looking for an ramjan outfit? Join Here~',
      views: 100,
      category: 'Saris Seasons',
      live: true,
      image: require('../assets/images/profile-4.jpg'),
      tech: 'colths',
    },
    // {id: '3', userId: 'USER ID', category: 'Category', live: false, image: ''},
    // {id: '4', userId: 'USER ID', category: 'Category', live: true, image: ''},
  ];
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 250 : 0,
      useNativeDriver: true,
    }).start();
  };
  const Handlelogout = async () => {
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('sellerId');
    Navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }),
    );
  };
  const [modalVisible, setModalVisible] = useState(false);
  const categories = ['Followed', 'Trending', 'Cloths', 'Accessories'];

  const fetchuser = async () => {
    try {
      const id = (await AsyncStorage.getItem('userId')) || '';
      // console.log(id)
      // console.log(await generateSignedUrl("LiveStreamThumbnails/d35ed8c4-f38a-41a7-9a22-f539f6e0dd5e_1000073024.jpg"))
      const response = await api.get(`/user/id/${id}`);
      setuser(response.data.data);
      await AsyncStorage.setItem(
        'sellerId',
        response?.data?.data?.sellerInfo?._id,
      );
      // console.log("success",user.role)
    } catch (err) {
      console.log('error fetching', err);
    }
  };
  useEffect(() => {
    fetchuser();
  }, []);
  let buttonText = '';
  let onPressAction = () => {};
  if (user?.sellerInfo?.approvalStatus === 'approved') {
    buttonText = 'Seller Hub';
    onPressAction = () => setSelectedTab('Seller');
  } else if (user?.sellerInfo?.approvalStatus === 'rejected') {
    buttonText = 'Rejected';
    onPressAction = () => setModalVisible(true);
  } else if (user?.sellerInfo?.approvalStatus === 'pending') {
    buttonText = 'Approval Pending';
    onPressAction = () =>
      ToastAndroid.show('Approval is Still Pending', ToastAndroid.SHORT);
  } else {
    buttonText = 'Become Seller';
    onPressAction = () => Navigation.navigate('SellerRegister');
    // Default icon for undefined status
  }
  if (user?.sellerInfo?.approvalStatus === 'pending') {
    setInterval(fetchuser, 5000);
  }
  // console.log(user.role)
  return (
    <>
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{
                textAlign: 'left',
                fontSize: 20,
                marginBottom: 10,
                fontWeight: '700',
              }}>
              Rejected Reason{' '}
            </Text>
            <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 10}}>
              {user?.sellerInfo?.rejectedReason || 'N/A'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  Navigation.navigate('SellerRegister');
                }}
                style={[styles.modelbutton, {backgroundColor: 'green'}]}>
                <Text style={styles.modelbuttonText}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modelbutton,
                  {backgroundColor: 'rgb(37 99 235)'},
                ]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modelbuttonText}>Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.container}>
        {/* #2563eb */}
        <View style={styles.header}>
          <Text style={styles.logo}>FLYKUP</Text>
          <View style={styles.headerIcons}>
            {/* */}
            <AntDesign name="mail" size={25} />
            <MaterialCommunityIcons name="bell-badge" size={25} />
            <MaterialCommunityIcons name="message-outline" size={25} />
            <TouchableOpacity
              style={[
                styles.avatar,
                {
                  height: 45,
                  width: 45,
                  // backgroundColor:'white'
                },
              ]}
              onPress={() => toggleDrawer()}>
              {/* <Text style={{fontSize: 28, fontWeight: '700'}}>
                    {user?.name.charAt(0)}
                  </Text> */}
              <Icon name="list" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Stories Section */}
        <View style={styles.story}>
          <View>
            <Image
              source={require('../assets/images/makkapa3.png')}
              style={{width: 70, height: 70, marginBottom: 5, borderRadius: 35}}
            />
            <TouchableOpacity style={styles.plusButton}>
              <Icon name="plus" size={15} color="white" />
            </TouchableOpacity>

            <Text style={styles.storyText}>{'Add to Story'}</Text>
          </View>
          <FlatList
            horizontal
            data={stories}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <>
                <View style={{marginRight: 10}}>
                  <Image source={item.image} style={styles.storyImage} />
                  <Text style={styles.storyText}>{item.name}</Text>
                  <Text
                    style={[
                      styles.plusButton,
                      {backgroundColor: 'red', color: 'white', bottom: 20},
                    ]}>
                    Live
                  </Text>
                </View>
              </>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
          />
        </View>
        {/* Recently Watched Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently watched</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentlyWatched}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.overlay}>
                <View style={styles.overlayContainer}>
                  <Text style={styles.loadingText}>
                    The Seller Panel in the Onboarding User Panel is upcoming.
                  </Text>
                </View>
              </View>
              <Image source={item.image} style={styles.cardImage} />

              {/* Overlay */}
              <View style={styles.cardOverlay}>
                <Text
                  style={{
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    width: 60,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    paddingVertical: 4,
                    paddingRight: 4,
                  }}>
                  {item.tech}
                </Text>

                <Text style={styles.cardText}>{item.userId}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  position: 'absolute',
                  bottom: 190,
                  left: 0,
                  right: 0,
                  padding: 10,
                  zIndex: 1, // Ensure this is above the image overlay
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'red',
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    borderRadius: 20,
                  }}>
                  <MaterialIcons name="group" size={20} color="white" />
                  <Text style={{color: 'white'}}>{item.views}</Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    alignItems: 'center',
                    padding: 5,
                  }}>
                  <Feather name="bookmark" size={26} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.cardContainer}
        />
        {/* For You Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For You</Text>
        </View>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* More Cards (can repeat the FlatList for "For You" content if needed) */}
        <FlatList
          data={recentlyWatched}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.overlay}>
                <View style={styles.overlayContainer}>
                  <Text style={styles.loadingText}>Comming Soon</Text>
                </View>
              </View>
              <Image source={item.image} style={styles.cardImage} />

              {/* Overlay */}
              <View style={styles.cardOverlay}>
                <Text
                  style={{
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    width: 60,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    paddingVertical: 4,
                    paddingRight: 4,
                  }}>
                  {item.tech}
                </Text>

                <Text style={styles.cardText}>{item.userId}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  position: 'absolute',
                  bottom: 190,
                  left: 0,
                  right: 0,
                  padding: 10,
                  zIndex: 1, // Ensure this is above the image overlay
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'red',
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    borderRadius: 20,
                  }}>
                  <MaterialIcons name="group" size={20} color="white" />
                  <Text style={{color: 'white'}}>59</Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    alignItems: 'center',
                    padding: 5,
                  }}>
                  <Feather name="bookmark" size={26} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.cardContainer}
        />
        {/* <View style={styles.upComing}>
          <Text style={{textAlign:'left',fontSize:16,fontWeight:'700',
            textDecorationLine:'underline',textDecorationColor:'gray'
          }}>Note: </Text>
          <Text style={styles.upComingText}></Text>
        </View> */}
      </ScrollView>
      <Animatable.View animation={'bounce'} iterationCount={10}>
        <FAB
          icon="plus"
          color="white"
          style={styles.fab}
          label="Start Live"
          onPress={() => console.log('Pressed')}
        />
      </Animatable.View>
      <Animated.View
        style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
        <ScrollView>
          <View style={styles.drawerContent}>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                onPress={toggleDrawer}
                style={styles.closeButton}>
                <MaterialIcons
                  name="cancel"
                  size={40}
                  color="gray"
                  onPress={toggleDrawer}
                />
              </TouchableOpacity>
              <View style={styles.profileHeader}>
                <TouchableOpacity style={styles.avatar}>
                  <Text style={{fontSize: 22, fontWeight: '700'}}>
                    {user?.name.charAt(0)}
                  </Text>
                  <View style={styles.dotStyle}></View>
                </TouchableOpacity>

                <TouchableOpacity style={{marginTop: 10, width: '75%'}}>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  <Text style={styles.editProfile}>{user?.emailId}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.sellerButton,
                {
                  backgroundColor:
                    user?.sellerInfo?.approvalStatus === 'approved'
                      ? 'rgb(0 169 110)'
                      : user?.sellerInfo?.approvalStatus === 'rejected'
                      ? 'red'
                      : user?.sellerInfo?.approvalStatus === 'pending'
                      ? '#2563eb'
                      : 'rgb(255 190 0)', // Default color if none of the conditions are met
                },
              ]}
              onPress={onPressAction}>
              <AntDesign name={'user'} size={20} color={'white'} />
              <Text
                style={[
                  styles.buttonText,
                  user?.sellerInfo?.approvalStatus === 'rejected' &&
                    styles.rejected,
                ]}>
                {buttonText}
              </Text>
            </TouchableOpacity>

            <View style={styles.tabContainer}>
              {['User', 'Seller'].map(tab => {
                if (tab === 'Seller' && user?.role == 'user') {
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tab,
                      selectedTab === tab && styles.selectedTab,
                    ]}
                    onPress={() => setSelectedTab(tab)}>
                    {tab === 'Seller' ? (
                      <Icon
                        name="building"
                        color={selectedTab === tab ? 'black' : 'white'}
                        size={20}
                      />
                    ) : (
                      <Icon
                        name="user"
                        color={selectedTab === tab ? 'black' : 'white'}
                        size={20}
                      />
                    )}

                    <Text
                      style={[
                        styles.tabText,
                        selectedTab === tab && styles.selectedTabText,
                      ]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {user?.sellerInfo?.approvalStatus === 'approved' &&
            selectedTab == 'Seller' ? (
              <ScrollView>
                <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() => Navigation.navigate('LiveStream' as never)}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <MaterialIcons name="live-tv" color="#fbdd74" size={20} />
                    <Text style={styles.drawerItem}>Live Stream</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() => Navigation.navigate('Inventory' as never)}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <MaterialIcons name="inventory" color="#fbdd74" size={20} />
                    <Text style={styles.drawerItem}>Inventory</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() => Navigation.navigate('Products' as never)}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <AntDesign name="shoppingcart" color="#fbdd74" size={20} />
                    <Text style={styles.drawerItem}>Products</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() =>
                    Navigation.navigate('ViewSellerHistory' as never)
                  }>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <MaterialIcons
                      name="bookmark-border"
                      color="#fbdd74"
                      size={20}
                    />
                    <Text style={styles.drawerItem}>Order Details</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() => Navigation.navigate('userShows' as never)}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <MaterialIcons name="live-tv" color="#fbdd74" size={20} />
                    <Text style={styles.drawerItem}>Live Shows</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.drawerrow}
                  onPress={() => Navigation.navigate('userShows' as never)}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <MaterialIcons name="live-tv" color="#fbdd74" size={20} />
                    <Text style={styles.drawerItem}>Live Streamings</Text>
                  </View>
                  <AntDesign name="right" color="gray" size={20} />
                </TouchableOpacity> */}
              </>
            )}
          </View>
          <TouchableOpacity onPress={Handlelogout}>
            <Text style={styles.Logout}>
              {'Log Out'} <AntDesign name="logout" size={30} color={'white'} />
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
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
    color: '#fff',
  },
  upComingText: {
    // textTransform:'uppercase',
    // fontWeight:'500',
    fontSize: 16,
    textAlign: 'center',
  },
  upComing: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 100,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 70,
    // alignItems: 'center',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
    marginTop: 2,
    borderRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    width: '50%',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  selectedTab: {
    backgroundColor: '#fbdd74',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  selectedTabText: {
    color: 'black',
  },
  chatContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    // margin: 16,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#7057bb',
    alignItems: 'center',
    // height:50,
    // right: 30,
    alignSelf: 'center',
    bottom: 0,
  },
  plusButton: {
    position: 'absolute',
    bottom: 30,
    right: 1,
    padding: 4,
    borderRadius: 30,
    backgroundColor: '#7057bb', // Facebook blue, you can change this
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  modelbuttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  modelbutton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    // borderWidth: 1,
    elevation: 3,
    // borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  drawerrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#2e2e31',
    paddingVertical: 10,
    borderRadius: 10,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    height: '110%',
    width: 250,
    backgroundColor: '#16161a',
    borderLeftWidth: 1,
    // borderColor: '#ddd',
    zIndex: 1000,
  },
  drawerContent: {
    justifyContent: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: '#2e2e31',
    borderRadius: 10,
    paddingVertical: 10,
    padding: 10,
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontWeight: 'bold',
    color: '#ffbd00',
    fontSize: 16,
  },
  editProfile: {
    color: 'gray',
    // width:180,
    textAlign: 'justify',
    marginTop: 5,
    // backgroundColor:'red',
    marginBottom: 10,
  },
  closeButton: {
    // alignItems: 'flex-end',
    alignSelf: 'flex-end',
    // justifyContent: 'flex-end',
    // padding: 10,
  },
  Logout: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    color: 'white',
  },
  drawerItem: {
    fontSize: 18,
    fontWeight: 'bold',
    // margin: 10,
    color: 'white',
  },
  avatar: {
    backgroundColor: '#fbdd74',
    height: 50,
    width: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Important for positioning the dot relative to this container
  },
  dotStyle: {
    position: 'absolute',
    bottom: 4,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6, // Making it a circle
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: '#fff', // Optional: White border around the dot for better visibility
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  sellerButton: {
    backgroundColor: 'rgb(255 190 0)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 10,
    borderRadius: 10,
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent:'space-evenly'
    gap: 20,
  },
  icon: {
    width: 24,
    height: 24,
    // backgroundColor: '#ccc',
    borderRadius: 12,
    marginLeft: 10,
  },
  storiesContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  story: {
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 10,
    flexDirection: 'row',
  },
  storyImage: {
    width: 70,
    height: 70,
    marginBottom: 5,
    borderRadius: 35,

    borderWidth: 2,
    borderColor: '#7057bb',
  },
  storyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    color: '#007BFF',
  },
  cardContainer: {
    paddingHorizontal: 15,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 250,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardCategory: {
    color: '#fff',
    fontSize: 12,
  },
  liveTag: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  categoryChip: {
    backgroundColor: '#eee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 5,
  },
  categoryText: {
    fontSize: 14,
  },
});

export default Dasboard;
