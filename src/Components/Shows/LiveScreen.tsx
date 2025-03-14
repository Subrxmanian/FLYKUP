import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  FlatList,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socketurl} from '../../../Config';
import AuctionsOverlay from './AuctionOverlay';
import api from '../../Utils/Api';
import LiveComments from './LiveComments';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {generateSignedUrl} from '../../Utils/aws';
import {
  CFDropCheckoutPayment,
  CFEnvironment,
  CFSession,
  CFThemeBuilder,
} from 'cashfree-pg-api-contract';
import {
  CFErrorResponse,
  CFPaymentGatewayService,
} from 'react-native-cashfree-pg-sdk';
import RenderProduct from './RenderProduct';
import { AddressSelection } from './AddressSelection';

const LiveStreamScreen = () => {
  const [messages, setMessages] = useState([]);
  const [mute, setMute] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const stream = route.params;
  const [sellerData, setSellerData] = useState({});
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Buy Now');
  const [drawerAnimation] = useState(new Animated.Value(300));
  const [hasApplied, setHasApplied] = useState({});
  const auction = stream.stream.auctionProducts || [];
  const buynow = stream.stream.buyNowProducts || [];
  const giveaway = stream.stream.giveawayProducts || [];
  const [winnerDetails, setWinnerDetails] = useState({});
  const [flag,setflag]=useState(false)
  const [isAddressSelected,setIsAddressSelected]=useState(false)
  const [selectedAddress,setselectedAddress]=useState({})
  const [selectedProduct,setselectedProduct]=useState({})
  
  const socket = io(socketurl, {
    transports: ['websocket'],
  });
  socket.emit('joinRoom', stream?.stream?._id);
  const handleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('❌ Cannot like: userId is null');
        // Optionally, show a message or alert to the user here if userId is missing
        return;
      }

      // Emit the like event
      socket.emit('toggleLike', {streamId: stream?.stream?._id, userId});

      // Update likes on success
      socket.on(`likesUpdated-${stream?.stream?._id}`, ({likes, likedBy}) => {
        // console.log('Likes updated:', likes, 'Liked by:', likedBy);
        setLikes(likes);
        setLiked(likedBy?.includes(userId));
      });
    } catch (err) {
      console.error('Error in like action:', err);
    }
  };
  const fetchWinner = async (id,item) => {
    try {
      // console.log(item.productId)
      const response = await api.get(`/user/id/${id}`);
      // setWinnerDetails(response.data.data);
      // console.log(response.data)
      setWinnerDetails(prev => ({...prev, [item.productId]: response.data.data}));
    } catch (error) {
      console.log(error);
    }
  };
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 300 : 0,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    const fetchUserIdAndSetupSocket = async () => {
      const userId = (await AsyncStorage.getItem('userId')) || '';

      socket.on(`commentAdded-${stream?.stream?._id}`, comment => {
        setMessages(prev => [...prev, comment]);
      });

      socket.on(`likesUpdated-${stream?.stream?._id}`, ({likes, likedBy}) => {
        // console.log('Likes updated:', likes, 'Liked by:', likedBy);
        setLikes(likes);
        setLiked(likedBy?.includes(userId));
      });
    };

    fetchUserIdAndSetupSocket();

    return () => {
      socket.off(`commentAdded-${stream?.stream?._id}`);
      socket.off(`likesUpdated-${stream?.stream?._id}`);
    };
  }, [stream]);

  const [matchedProducts, setMatchedProducts] = useState({
    auction: [],
    buynow: [],
    giveaway: [],
  });
  // console.log(stream)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sellerID =
          stream?.stream?.sellerId?._id ||
          (await AsyncStorage.getItem('sellerId'));
        // console.log(sellerID)
        const userId = (await AsyncStorage.getItem('userId')) || '';
        const response = await api.get(`/product/listing/seller/${sellerID}`);

        const products = response.data.data;
        // console.log(products)
        setLikes(stream?.stream?.likes);
        setLiked(stream?.strean?.likedBy?.includes(userId));
        // Create separate lists for auction, buynow, and giveaway products
        const updatedAuction = auction.map(auctionProduct => {
          const matchedProduct = products.find(
            product => product._id == auctionProduct.productId,
          );

          return matchedProduct;
        });
        // console.log(updatedAuction)

        const updatedBuyNow = buynow.map(buyNowProduct => {
          const matchedProduct = products.find(
            product => product._id === buyNowProduct.productId,
          );

          return matchedProduct;
        });

        const updatedGiveaway = giveaway.map(giveawayProduct => {
          const matchedProduct = products.find(
            product => product._id === giveawayProduct.productId,
          );

          return matchedProduct;
        });
        giveaway.forEach((product) => {
          // console.log(product.winner)
          if(product.winner)
          {
            fetchWinner(product.winner,product)
          }
        })
        // Update the state with the updated products, keeping auction, buynow, and giveaway separate
        setMatchedProducts({
          auction: updatedAuction,
          buynow: updatedBuyNow,
          giveaway: updatedGiveaway,
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, [stream]);

  const handleapplied=(item)=>{
    setHasApplied(prev => ({...prev, [item._id]: true}));
  }
const onSelectAddress = (address)=>{
  setselectedAddress(address)

}
const onBack = ()=>{
  setIsAddressSelected(false)
}
const handlePayment = async () => {
  try {
    setIsAddressSelected(false)
    const numericAmount=Number(selectedProduct?.productPrice)||0
    const response = await api.post(`/cashfree/create-order`, {
      amount: numericAmount,
    });

    const paymentSessionId = response.data.paymentSessionId;
    const orderID = response.data.orderId;

    const session = new CFSession(
      paymentSessionId,
      orderID,
      CFEnvironment.SANDBOX,
    );

    const theme = new CFThemeBuilder()
      .setNavigationBarBackgroundColor('#E64A19') // ios
      .setNavigationBarTextColor('#FFFFFF') // ios
      .setButtonBackgroundColor('#FFC107') // ios
      .setButtonTextColor('#FFFFFF') // ios
      .setPrimaryTextColor('#212121')
      .setSecondaryTextColor('#757575') // ios
      .build();
    CFPaymentGatewayService.setCallback({
      onVerify(orderID: string): void {
        console.log('Order ID is: ' + orderID);
        navigation.navigate('PaymentSuccess', {orderID,product:selectedProduct});
      },

      onError(error: CFErrorResponse, orderID: string): void {
        console.log(
          'Error: ' + JSON.stringify(error) + '\nOrder ID: ' + orderID,
        );
        navigation.navigate('PaymentFailed', {error, numericAmount});
      },
    });
    const dropPayment = new CFDropCheckoutPayment(session, null, theme);
    CFPaymentGatewayService.doPayment(dropPayment);
  } catch (error) {
    console.log('Error initiating payment:', error);
    // navigation.navigate("PaymentFailed", { error: error.message });
  }
};

  const renderProduct = ({item}) => {
    const imageKeys = item?.images || [];
    const imageUrls = imageKeys?.map(key => generateSignedUrl(key));
    // console.group(item.images)
  
  
    return (
      <>
        <View style={styles.productBox}>
          <FlatList
            data={imageUrls} // Now using the generated URLs
            horizontal
            renderItem={({item}) => (
              <Image
                source={{uri: item}}
                style={styles.productImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={{width: '50%'}}>
            <Text style={styles.header}>
              {item?.title}
              {`\n`}
            </Text>
            <Text style={{color: 'white', width: '100%'}}>
              {item?.description}
            </Text>
            <View style={{flexDirection: 'row', gap: 5}}>
              {/* <mater */}
              <MaterialCommunityIcons
                name="cart-variant"
                color="#fff"
                size={20}
              />
              <Text style={{color: 'white', width: '100%'}}>
                {item?.quantity}
              </Text>
            </View>
            
          </View>
        </View>
        {selectedTab === 'Auction' ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                alignSelf: 'center',
              }}>
              <AntDesign name="dingding" color="#ffbe00" size={20} />
              <Text style={{color: 'white', fontSize: 18}}>
                {' '}
                Starting Price:{' '}
              </Text>
              <MaterialIcons name="currency-rupee" color="white" size={20} />
              <Text style={{color: 'white', fontSize: 18}}>
                {item?.startingPrice}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignSelf: 'center',
                justifyContent: 'space-between',
              }}>
              <AntDesign name="gitlab" color="#ffbe00" size={20} />
              <Text style={{color: 'white', fontSize: 18}}>
                {' '}
                Reserved Price:{' '}
              </Text>
              <MaterialIcons name="currency-rupee" color="white" size={20} />
              <Text style={{color: 'white', fontSize: 18}}>
                {item?.reservedPrice}
              </Text>
            </View>
          </>
        ) : null}
        {selectedTab === 'Buy Now' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              alignSelf: 'center',
            }}>
            <AntDesign name="tags" color="#ffbe00" size={20} />
            <Text style={{color: 'white', fontSize: 18}}> Product Price: </Text>
            <MaterialIcons name="currency-rupee" color="white" size={20} />
            <Text style={{color: 'white', fontSize: 18}}>
              {item?.productPrice}
            </Text>
          </View>
        ) : null}
        {selectedTab === 'Buy Now' ? (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              setselectedProduct(item)
              setIsAddressSelected(true)}}>
            <Text style={{fontSize: 16, fontWeight: '600'}}>₹ Buy Now</Text>
          </TouchableOpacity>
        ) : null}
        {/* {selectedTab=='Buy Now'?
        <AddressSelection />:null} */}
   
        <View style={{marginTop: 10, backgroundColor: '#ccc', height: 1}} />
      </>
    );
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(
          `/live/shows/get/${stream?.stream?._id}`,
        );
        setSellerData(response.data.sellerId);
        const userId = await AsyncStorage.getItem('userId');
        setLiked(response.data.likedBy?.includes(userId));
        setLikes(response.data.likedBy?.length);
        setMessages(response.data.comments);
        setflag(true)
        // console.log(response.data.comments)
      } catch (err) {
        console.log('Error fetching user :', err);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <View style={styles.container}>
        {/* Streamer Info */}
        <View style={styles.streamerInfo}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="arrow-back-ios-new" size={23} color="white" />
            {sellerData?.userInfo?.profileURL ? (
              <>
                <Image
                  source={{
                    uri: sellerData?.userInfo?.profileURL,
                  }}
                  style={styles.streamerImage}
                />
              </>
            ) : (
              <View
                style={[
                  styles.streamerImage,
                  {borderRadius: 50, backgroundColor: '#455a64'},
                ]}>
                <Text style={{fontSize: 18, color: 'white', fontWeight: '600'}}>
                  {sellerData?.basicInfo?.name?.charAt(0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.streamerDetails}>
            <Text style={styles.streamerName}>
              {sellerData?.basicInfo?.name}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={styles.viewersCount}>10k viewers</Text>
              <Text
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                }}>
                Live
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.threeDotIcon}
            onPress={() => console.log('Options')}>
            <Icon name="more-vert" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Live Stream Video */}
        <View style={styles.videoContainer}>
          <Video
            style={styles.video}
            // source={{
            //   uri: 'https://res.cloudinary.com/dxsdme4qy/video/upload/v1739606166/livevideo_mqsktx.mp4',
            // }}
            muted={mute}
            repeat
            resizeMode="cover"
            paused={false}
          />
        </View>

        <View style={styles.auctionBox}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.actionIcons}>
            <AntDesign name="CodeSandbox" size={25} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLike} style={styles.actionIcons}>
            <AntDesign
              name={liked ? 'heart' : 'hearto'}
              size={25}
              color={liked ? 'red' : 'black'}
            />
            <Text style={{color: 'black', fontWeight: '600'}}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcons}>
            <Feather name="share" size={25} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionIcons}
            onPress={() => setMute(!mute)}>
            <Octicons name={mute ? 'mute' : 'unmute'} size={25} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.auctionContainer}>
          {flag ? (
            <LiveComments
              streamId={stream?.stream?._id}
              prevComments={messages}
            />
          ) : null}

          {/* {console.log(stream?.stream?.currentAuction,"this eruns")} */}
          {/* {stream?.stream.currentAuction?  */}
          <AuctionsOverlay
            streamId={stream?.stream?._id}
            currentAuction={stream?.stream?.currentAuction}
          />
          {/* :  null} */}
        </View>
      </View>
      <Animated.View
        style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
        <View style={styles.drawerContent}>
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons
              name="cancel"
              size={40}
              color="gray"
              onPress={toggleDrawer}
            />
          </TouchableOpacity>

          <View style={styles.tabContainer}>
            {['Buy Now', 'Auction', 'Give away'].map(tab => {
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    selectedTab === tab && styles.selectedTab,
                  ]}
                  onPress={() => setSelectedTab(tab)}>
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


            {selectedTab === 'Auction' ? (
              <FlatList
                data={matchedProducts.auction}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderProduct}
                contentContainerStyle={{paddingBottom: 100}}
                ListEmptyComponent={
                  <Text style={{color: 'white',textAlign:'center'}}>
                    No Auction Products Available
                  </Text>
                }
              />
            ) : selectedTab === 'Buy Now' ? (
              <FlatList
                data={matchedProducts.buynow}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderProduct}
                scrollEnabled
                contentContainerStyle={{paddingBottom: 100}}
                ListEmptyComponent={
                  <Text style={{color: 'white',textAlign:'center'}}>
                    No Buy Now Products Available
                  </Text>
                }
              />
            ) : selectedTab === 'Give away' ? (
              <FlatList
              data={matchedProducts.giveaway}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>{
                // console.log(item)
                return (
                <RenderProduct
                  item={item}
                  streamId={stream?.stream?._id}
                  hasApplied={hasApplied}
                  handleapplied={handleapplied}
                  winner={winnerDetails}
                  fetchWinner={fetchWinner}
                />
              )}}
              contentContainerStyle={{
                paddingBottom: 100,
              }}
              scrollEnabled
              ListEmptyComponent={
                <Text style={{ color: 'white',textAlign:'center'}}>
                  No Giveaway Products Available
                </Text>
              }
            />            
            ) : null}
          </View>
      </Animated.View>
      <Modal
        visible={isAddressSelected}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsAddressSelected(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
         <AddressSelection selectedAddress={selectedAddress} onSelectAddress={onSelectAddress}
         onNext={handlePayment}
         onBack={onBack}
         />
         </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  modalContent: {
    // backgroundColor: '#1b223d',
    padding: 20,
    backgroundColor:'#fff',
    // backgroundColor: 'rgba(0, 0, 0, 0.63)',
    borderRadius: 5,
    width: '85%',
    // height:500,
    alignItems: 'center',
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionIcons: {
    backgroundColor: '#fbbf24',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
  },
  buyButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    backgroundColor: '#ffbe00',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  productImage: {
    // height: 90,
    width: 130,
  },

  productBox: {
    gap: 10,
    flexDirection: 'row',
  },

  drawer: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 300,
    // flex:1,
    backgroundColor: '#16161a',
    borderLeftWidth: 1,
    // borderColor: '#ddd',
    zIndex: 1000,
  },
  drawerContent: {
    justifyContent: 'center',
    padding: 10,
    // borderBottomColor: '#ccc',
    // borderBottomWidth: 1,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    width: '100%',
    marginTop: 20,
    borderRadius: 20,
  },
  tab: {
    paddingVertical: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    // width: '50%',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedTab: {
    backgroundColor: '#ffbe00',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedTabText: {
    color: 'black',
  },
  auctionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    width: '100%',
    height: '50%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auctionBox: {
    position: 'absolute',
    top: '10%',
    left: 300,
    zIndex: 1,
    gap: 30,
  },
  streamerInfo: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  streamerImage: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    marginRight: 10,
  },
  streamerDetails: {
    flex: 1,
  },
  streamerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewersCount: {
    color: '#aaa',
    fontSize: 14,
  },
  threeDotIcon: {
    position: 'absolute',
    right: 10,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 170,
    left: 0,
    right: 0,
    zIndex: 2,
    padding: 10,
    maxHeight: '30%',
  },
  chatList: {
    flex: 1,
    maxHeight: '70%',
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  chatUserName: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  chatMessageText: {
    color: '#fff',
    flex: 1,
    textAlign: 'left',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    borderRadius: 25,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
  },
  avatar: {
    backgroundColor: '#ccc',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});

export default LiveStreamScreen;
