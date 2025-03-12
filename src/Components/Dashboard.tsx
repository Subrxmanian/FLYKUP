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
  Pressable,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import api from '../Utils/Api';
// import { generateSignedUrl } from '../Utils/aws';


const Dasboard = () => {
  const Navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [drawerAnimation] = useState(new Animated.Value(250));
  const [user, setuser] = useState();
  const stories = [
    {id: '1', name: 'Subramani', image: require('../assets/images/logo.png')},
    {id: '2', name: 'Saran', image: require('../assets/images/logo.png')},
    {id: '3', name: 'Sridhar', image: require('../assets/images/logo.png')},
    {id: '4', name: 'Anandh', image: require('../assets/images/logo.png')},
  ];

  const recentlyWatched = [
    {id: '1', userId: 'USER ID', category: 'Category', live: true, image: ''},
    {id: '2', userId: 'USER ID', category: 'Category', live: true, image: ''},
    {id: '3', userId: 'USER ID', category: 'Category', live: false, image: ''},
    {id: '4', userId: 'USER ID', category: 'Category', live: true, image: ''},
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
    Navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }),
    );
  };
  const [modalVisible, setModalVisible] = useState(false);
  const categories = ['Electronics', 'Music', 'Movies', 'Products'];
  // console.log(await generateSignedUrl("ProductImage/54f72522-ac97-4414-ab16-8f9e57713d22_1000298683.jpg"))
  useEffect(() => {
    const fetchuser = async () => {
      // console.log(await generateSignedUrl("ProductImage/59f3f4dd-60ce-478e-bbdf-3c769662e00d_image1.JPG"))
      try {
        const id = (await AsyncStorage.getItem('userId')) || '';
        console.log(id)
        const response = await api.get(`/user/id/${id}`);
        setuser(response.data.data);
      } catch (err) {
        console.log('error fetching', err);
      }
    };
    fetchuser();
  }, []);
  let buttonText = '';
  let onPressAction = () => {};
  if (user?.sellerInfo?.approvalStatus === 'approved') {
    buttonText = 'Seller Hub';
    onPressAction = () => toggleDrawer();

  } else if (user?.sellerInfo?.approvalStatus === 'rejected') {
    buttonText = 'Rejected';
    onPressAction = () => setModalVisible(true);

  } else if (user?.sellerInfo?.approvalStatus === 'pending') {
    buttonText = 'Pending Approval';
onPressAction=()=>ToastAndroid.show("Approval is Still Pending",ToastAndroid.SHORT)
  } else {
    buttonText = 'Become Seller';
    onPressAction = () => Navigation.navigate('SellerRegister');
  // Default icon for undefined status
  }

  // }
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
                  style={{fontSize: 16, textAlign: 'center', marginBottom: 10}}>
                  {user?.rejected}
                </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                    onPress={()=>Navigation.navigate('SellerRegister')}
                  style={[styles.modelbutton, {backgroundColor: 'green'}]}>
                  <Text style={styles.modelbuttonText}>Proceed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'rgb(37 99 235)'}]}
                  onPress={()=>setModalVisible(false)}
                 >
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
            <AntDesign name={"user"} size={20} color={'white'} />
            <Text
              style={[
                styles.buttonText,
                user?.sellerInfo?.approvalStatus === 'rejected' &&
                  styles.rejected,
              ]}>
              {buttonText}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.icon} >
            <AntDesign name="mail" size={25}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}  >
            <AntDesign name="shoppingcart" size={25}/>
            </TouchableOpacity> */}
        </View>
      </View>

      {/* Stories Section */}
      <FlatList
        horizontal
        data={stories}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.story}>
            <Image
              source={require('../assets/images/profile.jpg')}
              style={styles.storyImage}
            />
            <Text style={styles.storyText}>{item.name}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
      />

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
            <Image
              source={
                item.image
                  ? {uri: item.image}
                  : require('../assets/images/Index.png')
              }
              style={styles.cardImage}
            />

            <View style={styles.cardOverlay}>
              <Text style={styles.cardText}>{item.userId}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
              {item.live && <Text style={styles.liveTag}>LIVE</Text>}
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
            <Image source={{uri: item.image}} style={styles.cardImage} />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardText}>{item.userId}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
              {item.live && <Text style={styles.liveTag}>LIVE</Text>}
            </View>
          </View>
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.cardContainer}
      />
    </ScrollView>
    <Animated.View
          style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
          <ScrollView>
            <View style={styles.drawerContent}>
              <View style={styles.profileContainer}>
              <TouchableOpacity
                    onPress={toggleDrawer}
                    style={styles.closeButton}>
                    <MaterialIcons name="cancel" size={40} color="gray"/>
                  </TouchableOpacity>
                <View style={styles.profileHeader}>
                
                  <TouchableOpacity  style={styles.avatar}>
                    <Text style={{fontSize:28,fontWeight:'700'}}>{user?.emailId.charAt(0)}</Text>
                  </TouchableOpacity>
                    <Text style={styles.profileName}>{user?.name}</Text>
                <TouchableOpacity >
                  <Text style={styles.editProfile}>{user?.emailId}</Text>
                </TouchableOpacity>

              
                </View>
              
              </View>
              <Pressable style={styles.drawerrow}>
              <MaterialIcons name="inventory" color="#fbdd74" size={20}/>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('AddInventory' as never)
                }>
                Inventory
              </Text>
            </Pressable>
            <TouchableOpacity style={styles.drawerrow}>
              <AntDesign name="shoppingcart" color="#fbdd74" size={20}/>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('ProductUploadForm' as never)
                }>
                Add Products
              </Text>
            </TouchableOpacity>
           
            <TouchableOpacity style={styles.drawerrow}>
              <AntDesign name="eye" color="#fbdd74" size={20}/>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('Inventory' as never)
                }>
                View Inventory
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerrow}>
              <MaterialIcons name="bookmark-border" color="#fbdd74" size={20}/>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('' as never)
                }>
               Order Details
              </Text>
            </TouchableOpacity>
           
             
              
             
            </View>
            <TouchableOpacity onPress={Handlelogout}>
              <Text style={styles.Logout}>
                {("Log Out")} <AntDesign name="logout" size={30} color={'white'} />
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  modelbuttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  modelbutton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    // borderWidth: 1,
    elevation:3,
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
    flexDirection: "row",
alignItems:'center',
gap:10,
    width: '100%',
    marginTop: 10,
  },
  drawerrow:{
    flexDirection:'row',
    justifyContent:'center',
    gap:10,
    marginBottom:20,
    backgroundColor:'#2e2e31',
    paddingVertical:10,
    borderRadius:10,

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
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  profileContainer: {
    alignItems: 'center',
    // borderBottomColor: '#ccc',
    // borderBottomWidth: 1,
    marginBottom: 20,
  },
  profileHeader: {
    // flexDirection: 'row',
    backgroundColor:'#2e2e31',
    borderRadius:10,
    paddingVertical:10,
    // borderWidth:1,
    // justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontWeight: 'bold',
    color:'#ffbd00',
    fontSize: 20,
  },
  editProfile: {
    color: 'gray',
    marginTop: 5,
    marginBottom: 20,
  },
  closeButton: {
    // alignItems: 'flex-end',
    alignSelf:'flex-end',
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
  avatar:{
    backgroundColor:'#fbdd74',
    height:55,
    width:57,
    borderRadius:30,
    alignItems:'center',
    justifyContent:'center'
  },
  buttonText: {

    color: 'white',
    fontWeight: '700',
  },
  sellerButton: {
    backgroundColor: 'rgb(255 190 0)',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  },
  storyImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
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
    height: 150,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
