/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState, useRef} from 'react';
import {
  View as RNView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ToastAndroid,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {Director, Publish} from '@millicast/sdk';
import {RTCView, mediaDevices} from 'react-native-webrtc';
import api from '../../../Utils/Api';
import {useNavigation, useRoute} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socketurl} from '../../../../Config';
import io from 'socket.io-client';
import LiveComments from '../../Shows/LiveComments';
import {Dropdown} from 'react-native-element-dropdown';
import ToggleSwitch from 'toggle-switch-react-native';
import {generateSignedUrl} from '../../../Utils/aws';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Giveaway from './GIveAway';

const socket = io(socketurl, {
  transports: ['websocket'],
});
const Streaming = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Buy Now');
  const [drawerAnimation] = useState(new Animated.Value(300));
  const [matchedProducts, setMatchedProducts] = useState({
    auction: [],
    buynow: [],
    giveaway: [],
  });
  const [localStream, setLocalStream] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(null);
  const route = useRoute();
  const showId = route.params;
  const publisherRef = useRef(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [customTime, setCustomTime] = useState(30);
  const [startingBid, setStartingBid] = useState(0);
  const [auctionType, setAuctionType] = useState('default');
  const [increment, setIncrement] = useState(2);
  const [viewSelect, setViewSelect] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [highestBid, setHighestBid] = useState(100);
  const [highestBidder, setHighestBidder] = useState(null);
  const [timer, setTimer] = useState(0);
  const [bidderWon, setBidderWon] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(false);
  const auction = showId.item.auctionProducts || [];
  const [selectedProduct, setSelectedProduct] = useState({});
  const streamId = showId?.item?._id;
  const [flag,setflag]=useState(false)
  const [winnerDetails, setWinnerDetails] = useState({});

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setLoading(true);
        const userId = (await AsyncStorage.getItem('userId')) || '';
        socket.emit('joinRoom', showId?.item?._id);

        // Listen to like updates
        socket.on(`likesUpdated-${showId?.item?._id}`, ({likes, likedBy}) => {
          console.log('Likes updated:', likes, 'Liked by:', likedBy);
          setLikes(likes);
          setLiked(likedBy?.includes(userId));
        });
        setLikes(showId?.item?.likes);
        setLiked(showId?.item?.likedBy?.includes(userId));
        setShowData(showId?.item);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching show data:', err);
        setLoading(false);
      }
    };

    fetchShowData();

    return () => {
      socket.off(`likesUpdated-${showId?.item?._id}`);
    };
  }, [showId]);
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: isMicEnabled,
          video: isCameraEnabled,
        });
        setLocalStream(stream);
        streamRef.current = stream;
      } catch (err) {
        console.log('Error accessing media devices:', err);
      }
    };
    getMedia();

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (publisherRef.current) publisherRef.current.stop();
    };
  }, [isCameraEnabled, isMicEnabled]);
  useEffect(() => {
    setHighestBid(currentAuction?.currentHighestBid || 0);
    setHighestBidder(currentAuction?.highestBidder || null);

    setIsActive(currentAuction?.isActive || false);
    setBidderWon(currentAuction?.bidderWon || null);
  }, [currentAuction]);
  useEffect(() => {
    socket.emit('joinRoom', streamId);

    socket.on('auctionStarted', data => {
      if (data.product !== selectedProduct.productId) return;
      setHighestBid(data.startingBid);
      setIsActive(true);

      const remainingTime = Math.max(0, data.endsAt - Date.now());
      setTimer(remainingTime);

      // const increment = data.increment ?? Math.max(500, Math.floor(data.startingBid * 0.1));
    });

    socket.on('timerUpdate', data => {
      if (data.product !== selectedProduct.productId) return;
      if (data.remainingTime !== undefined) {
        setTimer(data.remainingTime);
        setIsActive(data.remainingTime > 0);
      }
    });

    socket.on('auctionEnded', data => {
      if (data.product !== selectedProduct.productId) return;
      setIsActive(false);
      setBidderWon(data?.highestBidder);
    });

    socket.on('clrScr', () => {
      setHighestBid(startingBid);
      setHighestBidder(null);
      setBidderWon(null);
      setTimer(30);
    });

    socket.on('bidUpdated', data => {
      if (data.product !== selectedProduct.productId) return;
      setHighestBid(data?.highestBid);
      setHighestBidder(data?.highestBidder);
    });

    return () => {
      socket.off('bidUpdated');
      socket.off('timerUpdate');
      socket.off('auctionStarted');
      socket.off('auctionEnded');
      socket.off('clrScr');
    };
  }, [currentAuction]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/live/shows/get/${showId?.item?._id}`);
        // console.log(response.data.comments)
        setMessages(response.data.comments);
        setflag(true)
      } catch (err) {
        console.log('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const formatTime = ms => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearAuction = () => {
    socket.emit('clearAuction', streamId, selectedProduct._id);
  };
  const startPublishing = async () => {
    try {
      const token = await fetchPublishingToken();

      // const tokenGenerator = () =>
      //   Director.getPublisher({
      //     token: token,
      //     streamName: showData?.streamName,
      //   });

      // publisherRef.current = new Publish(showData.streamName, tokenGenerator);
      // await publisherRef.current.connect({ mediaStream: localStream });
      setPublishing(true);
    } catch (error) {
      console.log('Publishing error:', error);
    }
  };
  const stopPublishing = () => {
    try {
      publisherRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setPublishing(false);
      api
        .patch(`/shows/${showId?.item?._id}/end`)
        .then(() => {
          console.log('Stream ended successfully');
          navigation.goBack();
          ToastAndroid.show('Show Ended Successfully. ', ToastAndroid.SHORT);
        })
        .catch(err => console.error('Error ending stream:', err));
    } catch (error) {
      console.log(error);
    }
  };
  const fetchPublishingToken = async () => {
    try {
      // console.log(showId.item)
      const response = await api.patch(`/shows/${showId?.item?._id}/start`);
      return response.data.data.token;
    } catch (error) {
      console.log('Error fetching token:', error);
      throw error;
    }
  };
  const toggleCamera = () => {
    setIsCameraEnabled(prevState => !prevState);
  };
  const toggleMic = () => {
    setIsMicEnabled(prevState => !prevState);
  };
  const handleSetTimer = value => setCustomTime(value);

  const confirmStartAuction = () => {
    if (startingBid <= 0) {
      ToastAndroid.show('Enter the valid Starting Bid', ToastAndroid.SHORT);
      return;
    }
    if (auctionType === 'suddenDeath') {
      socket.emit('startAuction', {
        streamId: showId?.item?._id,
        product: selectedProduct.productId,
        timer: customTime,
        auctionType,
        increment: null,
        startingBid: Number(startingBid),
      });
    } else {
      socket.emit('startAuction', {
        streamId: showId?.item?._id,
        product: selectedProduct.productId,
        timer: customTime,
        auctionType,
        increment,
        startingBid: Number(startingBid),
      });
    }
    setIsActive(true);
    setCurrentAuction(true);
    setViewSelect(false);
    ToastAndroid.show('Auction Started successfully', ToastAndroid.SHORT);
    setModalVisible(false);
  };
  const incrementOptions = [
    {label: '2s', value: 2},
    {label: '5s', value: 5},
    {label: '10s', value: 10},
    {label: '15s', value: 15},
    {label: '30s', value: 30},
  ];
  const handleLike = async () => {
    try {
      const userId = (await AsyncStorage.getItem('userId')) || '';
      if (!userId) {
        console.error('❌ Cannot like: userId is null');
        return;
      }

      // Emit the like event
      socket.emit('toggleLike', {streamId: showId?.item?._id, userId});

      // Update likes on success
      socket.on(`likesUpdated-${showId?.item?._id}`, ({likes, likedBy}) => {
        console.log('Likes updated:', likes, 'Liked by:', likedBy);
        setLikes(likes);
        setLiked(likedBy?.includes(userId));
      });
    } catch (err) {
      console.log('Error in like action:', err);
    }
  };
  const renderProduct = ({item}) => {
    // Ensure `item.images` is an array
    const imageKeys = item.images || [];
    const imageUrls = imageKeys.map(key => generateSignedUrl(key)); // Use a function to generate the signed URLs
    // console.log(item)
    return (
      <>
        <TouchableOpacity
          style={[
            styles.productBox,
            {
              backgroundColor: Object.keys(selectedProduct).length
                ? '#7098dc'
                : '#1a1a1a',
            },
          ]}
          onPress={() => setSelectedProduct(item)}>
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
          <View style={{width: '60%'}}>
            <Text style={styles.header}>
              {item.title}
              {`\n`}
            </Text>
            <View style={styles.row}>
              <AntDesign name="dropbox" color="brown" size={20} />
              <Text style={styles.label}>Stock {item.quantity}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="currency-rupee" color="#fff" size={20} />
              <Text style={styles.label}>Price {item.startingPrice}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="currency-rupee" color="#fff" size={20} />
              <Text style={styles.label}>Reserved {item.reservedPrice}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };
  const handleselect = () => {
    if (selectedProduct && Object.keys(selectedProduct).length > 0) {
      // If selectedProduct is not null, undefined, or an empty object, proceed
      setViewSelect(true);
    } else {
      // If selectedProduct is empty or not selected
      ToastAndroid.show(
        'Select atleast one Product to Start Auction',
        ToastAndroid.SHORT,
      );
      return;
    }
  };
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 300 : 0,
      useNativeDriver: true,
    }).start();
  };
  const Products = ({item}) => {
    const imageKeys = item?.images || [];
    const imageUrls = imageKeys?.map(key => generateSignedUrl(key)); // Use a function to generate the signed URLs
    
    return (
      <>
        <View style={styles.productBox}>
          
              <Image
                source={{uri: imageUrls[0]}}
                style={styles.productImage}
                resizeMode="contain"
              />
          
          <View style={{width: '50%'}}>
            <Text style={styles.header}>
              {item?.title}
              {`\n`}
            </Text>
            <Text style={{color: 'white', width: '100%'}}>
              {item?.description}
            </Text>
           

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
            onPress={() => handlePayment(item?.productPrice)}>
            <Text style={{fontSize: 16, fontWeight: '600'}}>₹ Buy Now</Text>
          </TouchableOpacity>
        ) : null}
       
        <View style={{marginTop: 10, backgroundColor: '#ccc', height: 1}} />
      </>
    );
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setMatchedProducts({
          auction: showId.item.auctionProducts,
          buynow: showId.item.buyNowProducts,
          giveaway: showId.item.giveawayProducts,
        });
        showId?.item?.giveawayProducts?.forEach((product) => {
          // console.log(product.winner)
          if(product.winner)
          {
            fetchWinner(product.winner,product)
          }
        })
        // console.log(matchedProducts)
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
    startPublishing()
  }, []);
// console.log(winnerDetails)
  return (
    <>
      <RNView style={{flex: 1}}>
        <RNView style={{position: 'relative', flex: 1}}>
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={{width: '100%', height: '100%'}}
              objectFit="cover"
            />
          )}

          {/* Overlay Title */}
          <RNView
            style={{
              position: 'absolute',
              top: 20,
              left: 10,
              zIndex: 1,
              flexDirection: 'row',
              gap: 45,
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 30,
                gap: 10,
              }}>
              <AntDesign name="left" color="white" size={25} />
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'white',
                    textTransform: 'capitalize',
                  }}>
                  Live Streaming
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#777',
                    textTransform: 'capitalize',
                  }}>
                  {' '}
                  {showData?.title}
                </Text>
              </View>
            </TouchableOpacity>
            {/* <View style={{width:100}}/> */}
            <Text style={styles.liveButton}>Live</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={stopPublishing}>
                <AntDesign name={'close'} size={25} color="white" />
              </TouchableOpacity>

              <TouchableOpacity>
                <Feather name="share" size={25} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleCamera}>
                <Feather
                  name={isCameraEnabled ? 'camera' : 'camera-off'}
                  size={25}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMic}>
                <Feather
                  name={isMicEnabled ? 'mic' : 'mic-off'}
                  size={25}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLike}
                style={{alignItems: 'center'}}>
                <AntDesign
                  name={liked ? 'heart' : 'hearto'}
                  size={25}
                  color={liked ? 'red' : 'white'}
                />
                <Text style={{color: 'white'}}>{likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleDrawer}
                style={styles.actionIcons}>
                <AntDesign name="CodeSandbox" size={25} color="black" />
              </TouchableOpacity>
            </View>
          </RNView>

          <RNView
            style={{
              position: 'absolute',
              top: '28%',
              left: 100,
              zIndex: 1,
              gap: 30,
            }}>
            {loading ? (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator color={'black'} size={25} />
              </View>
            ) : null}
          </RNView>

          {/* Action Buttons */}
          <RNView
            style={{
              position: 'absolute',
              bottom: 5,
              left: 0,
              gap: 10,
              right: 0,
              zIndex: 1,
            }}>

            {flag  ? (
              <LiveComments
                streamId={showId?.item?._id}
                prevComments={messages}
              />
            ) : (
             null
            )}
            {auction.length > 0 ? (
              <>
                <View style={styles.currentBox}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{flexDirection: 'row', gap: 8}}>
                      <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="play-circle" size={30} color="green" />
                      </TouchableOpacity>
                      {/* {bidderWon && ( */}
                      <TouchableOpacity onPress={handleClearAuction}>
                        <MaterialCommunityIcons
                          name="clock"
                          size={30}
                          color="red"
                        />
                      </TouchableOpacity>
                      {/* )} */}
                    </View>

                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: timer / 1000 <= 11 ? 'red' : 'white',
                      }}>
                      {formatTime(timer)}
                    </Text>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    {isActive && (
                      <>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#ccc',
                            fontWeight: 'bold',
                          }}>
                          Current Bid
                        </Text>
                        <Text
                          style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                            color: 'yellow',
                            flexDirection: 'row',
                            justifyContent: 'center',
                          }}>
                          <FontAwesome name="rupee" size={18} />{' '}
                          {highestBid?.toLocaleString()}
                        </Text>
                      </>
                    )}
                    {bidderWon && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 8,
                          marginTop: 16,
                        }}>
                        <Ionicons name="trophy" size={16} color="yellow" />
                        <Text
                          style={{
                            fontSize: 14,
                            color: 'yellow',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}>
                          Winner: {bidderWon.name}
                        </Text>
                      </View>
                    )}
                    {highestBidder && !bidderWon && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 8,
                          marginTop: 16,
                        }}>
                        <Ionicons name="trophy" size={16} color="yellow" />
                        <Text style={{fontSize: 14, color: 'yellow'}}>
                          Highest Bidder: {highestBidder.name}
                        </Text>
                      </View>
                    )}
                  </View>
                  {!isActive && !bidderWon && (
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}>
                      Start a Auction
                    </Text>
                  )}
                </View>
              </>
            ) : null}
          </RNView>
        </RNView>
      </RNView>
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          {viewSelect ? (
            <View style={styles.modalContainer}>
              <Text style={styles.header}>Auction Settings</Text>
              <View style={styles.content}>
                {/* <Text style={styles.toggleLabel}>Default</Text> */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Sudden Death</Text>
                  <ToggleSwitch
                    isOn={auctionType === 'suddenDeath'}
                    onColor="green"
                    offColor="red"
                    labelStyle={{color: 'black', fontWeight: '900'}}
                    size={'small'}
                    onToggle={() =>
                      setAuctionType(
                        auctionType === 'suddenDeath'
                          ? 'default'
                          : 'suddenDeath',
                      )
                    }
                  />
                </View>

                {auctionType === 'default' && (
                  <View>
                    <Text style={styles.incrementLabel}>Increment:</Text>
                    {/* <Dropdown data={incrementOptions}/> */}
                    <Dropdown
                      data={incrementOptions}
                      labelField="label"
                      valueField="value"
                      value={increment}
                      onChange={item => setIncrement(item.value)}
                      style={styles.dropdown}
                      placeholder="Select Increment"
                    />
                  </View>
                )}

                <View>
                  <Text style={styles.inputLabel}>Starting Bid (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    value={startingBid.toString()}
                    onChangeText={text => setStartingBid(text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputLabel}>Auction Time (Secs)</Text>
                  <TextInput
                    style={styles.input}
                    value={customTime.toString()}
                    onChangeText={handleSetTimer}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={confirmStartAuction}>
                    <Text style={styles.buttonText}>Start </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setSelectedProduct({});
                      setViewSelect(false);
                      setModalVisible(false);
                    }}>
                    <Text style={styles.buttonText}>Cancel </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.modalContainer}>
              <Text style={{fontSize: 17, color: '#ccc', marginBottom: 10}}>
                🛒 Select a Product{' '}
              </Text>
              <FlatList
                data={auction}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderProduct}
                ListEmptyComponent={
                  <Text style={{color: 'white'}}>
                    No Auction Products Available
                  </Text>
                }
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleselect}>
                  <Text style={styles.buttonText}>Next </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setSelectedProduct({});
                    setModalVisible(false);
                  }}>
                  <Text style={styles.buttonText}>Cancel </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
                renderItem={Products}
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
                renderItem={Products}
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
                renderItem={({ item }) => (
                  <Giveaway
                    item={item}
                    streamId={showId?.item?._id}
                    fetchWinner={fetchWinner}
                    winnerDetails={winnerDetails}
                 
                  />
                )}
                contentContainerStyle={{paddingBottom: 100}}
                scrollEnabled
                // style={{ flex: 1 }}  // Make sure the FlatList takes full space
                ListEmptyComponent={
                  <Text style={{color: 'white',textAlign:'center'}}>
                    No Giveaway Products Available
                  </Text>
                }
              />
            ) : null}
        </View>
      </Animated.View>
    </>
  );
};

export default Streaming;

const styles = StyleSheet.create({
  actionIcons: {
    backgroundColor: '#fbbf24',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
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
    height: '110%',
    width: 300,
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
  currentBox: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  row: {flexDirection: 'row', gap: 5},
  label: {color: 'white', fontSize: 16},
  alContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },

  content: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  toggleLabel: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  incrementLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  dropdown: {
    height: 40,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    color: '#fff',
  },
  dropdownItem: {
    color: '#fff',
    padding: 10,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    color: '#fff',
    backgroundColor: '#333',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  liveButton: {
    backgroundColor: 'green',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 30,
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 5,
  },
  actionButtons: {
    gap: 20,
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
});
