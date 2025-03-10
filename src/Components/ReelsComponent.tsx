/* eslint-disable react/no-unstable-nested-components */
import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Modal,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';
import {generateSignedUrl} from '../Utils/aws';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RBSheet from 'react-native-raw-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import api from '../Utils/Api';
import {RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SingleReel from './Reels/Reels';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import ReelsViewer from './Reels/Reels';
const {width, height} = Dimensions.get('window');

const ReelsScreen = () => {
  const [reelsData, setReelsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mute, setmute] = useState(false);
  const refRBSheet = useRef();
  const [purchase, setPurchase] = useState({});
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedAddress, setselecredAddress] = useState(null);
  const [photoUri, setphotoUri] = useState('');
  const [loading, setloading] = useState(false);
  const [inventory, setinvetory] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [modalVisible, setIsModaVisible] = useState(false);
  const [addressDetails, setAddressDetails] = useState([]);
  const [qunatity, setquantity] = useState('1');
  const [viewPricing, setViewPricing] = useState('1');
  const [videos, setVideos] = useState([]);
  const handleSizeSelection = size => {
    setSelectedSize(size);
  };
  const handleColorSelection = color => {
    setSelectedColor(color);
  };
  const handleOpen = async item => {
    try {
      // setPurchase(item)
      refRBSheet.current.open();
      const url = await getImage(item.photoUrl);
      setphotoUri(url);
      const response = await api.get(
        `/seller/inventory/by-id/${item.inventoryInfo}`,
      );
      setPurchase(item);
      setinvetory(response.data.data.inventory);
      // console.log(response.data.data)
    } catch (error) {
      console.log('error fetching data', error);
    }
  };
  const ReelItem = ({item, index, activeIndex, handleLike}) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(item.likes);
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(true); // Track if video is loading
    const handleLikePress = () => {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      handleLike(index, liked ? -1 : 1); // Update global like count
    };
    const videoRef = useRef(null);

    // Add viewability configuration
    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
    }).current;

    // Properly handle video playback when item becomes visible
    useEffect(() => {
      if (videoRef.current) {
        if (activeIndex === index) {
          videoRef.current.playAsync();
        } else {
          videoRef.current.pauseAsync();
        }
      }
    }, [activeIndex, index]);

    // Fetch video URL and set loading state
    useEffect(() => {
      const fetchVideoUrl = async () => {
        setLoading(true); // Start loading when fetching URL
        const url = await getImage(item.videoUrl);
        setVideoUrl(url);
        setLoading(false); // End loading once video URL is set
      };
      fetchVideoUrl();
    }, [item.videoUrl]);

    return (
      <View style={styles.reelContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={videoUrl ? {uri: videoUrl} : undefined}
            style={styles.video}
            shouldPlay={activeIndex === index}
            resizeMode="cover"
            repeat={true}
            playInBackground={false}
            paused={activeIndex !== index}
            muted={true}
          />
        )}

        <View style={styles.overlayContent}>
          <TouchableOpacity
            style={styles.BuyButton}
            onPress={() => {
              handleOpen(item);
            }}>
            <Text style={{fontSize: 20, color: 'white'}}>Buy Now</Text>
            <AntDesign name="right" color="white" size={25} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.productName}</Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}>
            <AntDesign
              name={liked ? 'heart' : 'hearto'}
              color={liked ? 'red' : 'white'}
              size={24}
            />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="message-circle" color="white" size={24} />
            <Text style={styles.actionText}>{100}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-2" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const fetchAddressData = async () => {
    try {
      const userId = (await AsyncStorage.getItem('userId')) || '';

      const address = await api.get(`/address/${userId}`);
      // console.log(address.data.data)
      setAddressDetails(address.data.data);
    } catch (error) {
      console.log('Error fetching reels data:', error);
    }
  };
  const handleLike = (index, likeChange) => {
    setReelsData(prevData => {
      const updatedData = [...prevData];
      updatedData[index].likes += likeChange;
      return updatedData;
    });
  };
  const getImage = async url => {
    try {
      const signedUrl = await generateSignedUrl(url);
      return signedUrl;
    } catch (error) {
      console.log('Error generating signed URL:', error);
      return '';
    }
  };
  const handleAddAddress = async () => {
    setloading(true);

    // Validate the required fields and pincode
    if (!fullName) {
      ToastAndroid.show('Full name is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if full name is missing
    }

    if (!addressLine1) {
      ToastAndroid.show('Address line 1 is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if address line 1 is missing
    }

    if (!state) {
      ToastAndroid.show('State is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if state is missing
    }

    if (!city) {
      ToastAndroid.show('City is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if city is missing
    }

    if (!pincode) {
      ToastAndroid.show('Pincode is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if pincode is missing
    }

    if (pincode.length !== 6 || isNaN(pincode)) {
      ToastAndroid.show(
        'Pincode must be a valid 6-digit number',
        ToastAndroid.SHORT,
      );
      setloading(false);
      return; // Stop further execution if pincode is invalid
    }

    if (!mobileNumber) {
      ToastAndroid.show('Mobile number is required', ToastAndroid.SHORT);
      setloading(false);
      return; // Stop further execution if mobile number is missing
    }

    // Optional: Check if alternateMobile and addressLine2 are provided (optional fields)
    if (!alternateMobile) {
      ToastAndroid.show('Alternate mobile is optional', ToastAndroid.SHORT);
    }

    if (!addressLine2) {
      ToastAndroid.show('Address line 2 is optional', ToastAndroid.SHORT);
    }

    try {
      const userId = (await AsyncStorage.getItem('userId')) || '';
      const response = await api.post(`/address/${userId}`, {
        name: fullName,
        line1: addressLine1,
        line2: addressLine2 || '', // Ensure empty value if addressLine2 is optional
        state: state,
        city: city,
        pincode: pincode,
        mobile: mobileNumber,
        alternateMobile: alternateMobile || '', // Handle optional alternateMobile
      });

      setIsModaVisible(false);
      fetchAddressData();
      ToastAndroid.show('Address added successfully', ToastAndroid.SHORT);
    } catch (error) {
      console.log('Error adding address', error);
      ToastAndroid.show(
        'Failed to add address. Please try again',
        ToastAndroid.SHORT,
      );
    } finally {
      setloading(false);
    }
  };
  const getUniqueColors = () => {
    const colors = inventory.filter(item => item.color).map(item => item.color);
    return [...new Set(colors)]; // Remove duplicates by converting to Set
  };
  const getUniqueSizes = () => {
    const sizes = inventory
      .filter(item => item.sizes && item.sizes.length > 0)
      .map(item => item.sizes)
      .flat()
      .map(sizeItem => sizeItem.size);
    return [...new Set(sizes)]; // Remove duplicates by converting to Set
  };
  const handleValidate1 = async () => {
    if (viewPricing == '1') {
      if (purchase.productType != 'quantity') {
        if (purchase.productType == 'colorQuantity') {
          if (!selectedColor) {
            ToastAndroid.show('Choose an color.', ToastAndroid.SHORT);
            return;
          }
        } else if (purchase.productType == 'sizeQunatity') {
          if (!selectedSize) {
            ToastAndroid.show('Choose an size.', ToastAndroid.SHORT);
            return;
          }
        }
      else if (purchase.productType == 'sizeColorQuantity') {
        if (!selectedColor || !selectedSize) {
          ToastAndroid.show(
            'Please choose color and size. ',
            ToastAndroid.SHORT,
          );
          return;
        }
      }
     } 
      // refRBSheet.current.close()
      setViewPricing('2');
    } else if (viewPricing == '2') {
      if (!selectedAddress) {
        ToastAndroid.show('select an Address or add it. ', ToastAndroid.SHORT);
        return;
      }
      setViewPricing('3');
    }
  };

  function Viewing(status) {
    switch (status) {
      case '1':
        return (
          <View style={styles.purchaseContainer}>
            {/* Product Name */}
            <Text style={styles.productName}>{purchase.productName}</Text>

            {/* Product Image */}
            {photoUri ? (
              <Image source={{uri: photoUri}} style={styles.productImage} />
            ) : (
              <Text style={styles.noImageText}>Image not available</Text>
            )}

            <Text style={styles.productDescription}>
              {purchase?.description}
            </Text>

            <View style={{flexDirection: 'row', gap: 10}}>
              <Text style={styles.productPrice}>Price :</Text>
              <Text
                style={[
                  styles.productPrice,
                  {textDecorationLine: 'line-through', color: 'red'},
                ]}>
                ₹{purchase?.actualPrice || 0}
              </Text>
              {/* Product Price */}
              <Text style={[styles.productPrice, {color: 'green'}]}>
                ₹{purchase?.sellingPrice || 1}
              </Text>
            </View>
            <View style={styles.sellerInfoContainer}>
              {/* <Text style={[styles.productInventory, {color: 'gray'}]}>
                Only {purchase?.totalQuantity} items
              </Text> */}
              <Text style={styles.sellerName}>
                Seller: {purchase?.sellerInfo?.basicInfo?.name}
              </Text>
            </View>

            {getUniqueColors().length > 0 && (
              <View style={styles.inventoryItem}>
                <Text style={styles.selectionLabel}>Select Color:</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {getUniqueColors().map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        {backgroundColor: color},
                        selectedColor === color && styles.selectedOption,
                      ]}
                      onPress={() => handleColorSelection(color)}>
                      {/* <Text style={styles.colorText}>{color}</Text> */}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Size Selection */}
            {getUniqueSizes().length > 0 && (
              <View style={styles.inventoryItem}>
                <Text style={styles.selectionLabel}>Select Size:</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {getUniqueSizes().map((size, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sizeOption,
                        selectedSize === size && styles.selectedOption,
                      ]}
                      onPress={() => handleSizeSelection(size)}>
                      <Text style={styles.sizeText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{color: 'black', fontSize: 16, marginBottom: 10}}>
                Add an Quantity :
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  // backgroundColor:'gray',
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  // borderWidth:1,
                }}>
                <TouchableOpacity
                  onPress={() => setquantity(Number(qunatity) + 1)}>
                  <AntDesign name="plus" size={20} color="gray" />
                </TouchableOpacity>
                <TextInput
                  value={qunatity.toString()}
                  keyboardType="numeric"
                  onChangeText={setquantity}
                  style={{
                    width: 50,
                    color: '#777',
                    textAlign: 'center',
                    borderRadius: 10,
                  }}
                />
                <TouchableOpacity onPress={() => setquantity(qunatity - 1)}>
                  <AntDesign name="minus" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleValidate1()}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        );
      case '2':
        return (
          <View>
            <TouchableOpacity
              onPress={() => {
                setViewPricing('1');
              }}
              style={{flexDirection: 'row', marginBottom: 10}}>
              <AntDesign name="left" size={20} />
              <Text style={{fontSize: 15}}>Back to Product selection</Text>
            </TouchableOpacity>
            <Text style={{color: 'black', fontSize: 17, marginBottom: 10}}>
              Select an Address or add it{' '}
            </Text>
            {/* {setselecredAddress(addressDetails[0])} */}
            {addressDetails.map((address, index) => {
              // setselecredAddress(address)
              // console.log(address)
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.BuyButton,
                    {
                      backgroundColor: 'black',
                      borderWidth: 1,
                      alignSelf: 'center',
                      width: '100%',
                    },
                  ]}
                  onPress={() => setselecredAddress(address)}>
                  <RadioButton
                    value="second"
                    status={
                      selectedAddress == address ? 'checked' : 'unchecked'
                    }
                    onPress={() => setselecredAddress(address)}
                  />
                  <Text style={{color: 'white', width: '80%'}}>
                    {address.line1} {address.city} {address.state}{' '}
                    {address.pincode}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => setIsModaVisible(true)}>
              <AntDesign name="plus" size={20} color={'black'} />
              <Text style={{color: 'black', fontSize: 17}}> Add Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addressButton,
                {
                  backgroundColor: '#372440',
                  width: '70%',
                  alignSelf: 'center',
                  paddingVertical: 15,
                },
              ]}
              onPress={() => handleValidate1()}>
              {loading ? (
                <ActivityIndicator color={'white'} size={20} />
              ) : (
                <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>
                  Save Address
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case '3':
        return (
          <View>
            <TouchableOpacity
              onPress={() => {
                setViewPricing('2');
              }}
              style={styles.backButton}>
              <AntDesign name="left" size={20} color="#888" />
              <Text style={styles.backText}>Back to Address selection</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Pricing Details</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Sub Total</Text>
                <Text style={styles.value}>
                  {' '}
                  ₹{purchase?.sellingPrice || 0}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Price</Text>
                <Text style={styles.value}>
                  {' '}
                  ₹{purchase?.sellingPrice || 0}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Shipping Price</Text>
                <Text style={styles.value}>₹{purchase?.sellingPrice || 0}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Tax</Text>
                <Text style={styles.value}>₹{purchase?.sellingPrice || 0}</Text>
              </View>

              <View>
                <Text style={styles.label}>Delivery Address</Text>
                <Text
                  style={[
                    styles.value,
                    styles.address,
                    {marginBottom: 10, marginTop: 10},
                  ]}>
                  {selectedAddress?.line1} {selectedAddress?.city}{' '}
                  {selectedAddress?.state} {selectedAddress?.pincode}
                </Text>
              </View>

              <TouchableOpacity style={styles.payButton}>
                <Text style={styles.payText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          // </View>
        );
    }
  }
  useEffect(() => {
    if (addressDetails.length > 0 && !selectedAddress) {
      setselecredAddress(addressDetails[0]);
    }
  }, [addressDetails]);
  useEffect(() => {
    const fetchReelsData = async () => {
      try {
        const response = await api.get(`/seller/product/all`);
        const updatedVideos = await Promise.all(
          response.data.data.map(async product => {
            try {
              let updatedProduct = {...product};

              if (product.videoUrl) {
                try {
                  const signedUrl = await generateSignedUrl(product.videoUrl);
                  updatedProduct.videoUrl = signedUrl;
                } catch (err) {
                  console.error('Error generating signed video URL:', err);
                  updatedProduct.videoUrl = product.videoUrl; // Fallback to original URL
                }
              }

              if (product.photoUrl) {
                try {
                  const signedPhotoUrl = await generateSignedUrl(
                    product.photoUrl,
                  );
                  updatedProduct.photoUrl = signedPhotoUrl;
                } catch (err) {
                  console.error('Error generating signed photo URL:', err);
                  updatedProduct.photoUrl = product.photoUrl; // Fallback to original URL
                }
              }

              return updatedProduct;
            } catch (err) {
              console.error('Error processing product:', err);
              return product; // Return original product if processing fails
            }
          }),
        );
        // console.log(updatedVideos);

        // setVideos(updatedVideos);
        setReelsData(response.data.data);
      } catch (error) {
        console.log('Error fetching reels data:', error);
      }
    };
    fetchReelsData();
    fetchAddressData();
  }, []);
  const onViewableItemsChanged = useCallback(({changed, viewableItems}) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  return (
    <>
      <View style={styles.container}>
        <RBSheet
          dragOnContent={true}
          draggable={true}
          ref={refRBSheet}
          height={600}
          closeOnPressMask={false}
          dragFromTopOnly={true}>
          <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            scrollEnabled={true}>
            <View style={styles.purchaseContainer}>{Viewing(viewPricing)}</View>
          </ScrollView>
        </RBSheet>

        <View>
          <View style={styles.topActionButtons}>
            <TouchableOpacity style={styles.topActionButton}>
              <Icon name="search" color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={() => setmute(!mute)}>
              <Icon name="camera" color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topActionButton}>
              <Icon name="user" color="white" size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={reelsData}
            renderItem={({item, index}) => (
              <ReelItem
                item={item}
                index={index}
                activeIndex={activeIndex}
                handleLike={handleLike}
              />
            )}
            keyExtractor={item => item._id}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={height}
            vertical
            showsVerticalScrollIndicator={false}
            onScroll={e => {
              const contentOffsetY = e.nativeEvent.contentOffset.y;
              const index = Math.floor(contentOffsetY / height);
              setActiveIndex(index);
            }}
            pagingEnabled
            windowSize={3}
            maxToRenderPerBatch={1}
            removeClippedSubviews={true}
            initialNumToRender={1}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(data, index) => ({
              length: height,
              offset: height * index,
              index,
            })}
          />
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModaVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={{alignSelf: 'flex-end', padding: 10}}
                onPress={() => setIsModaVisible(false)}>
                <FontAwesome name="close" size={20} />
              </TouchableOpacity>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={'#777'}
                placeholder="Enter your full name"
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                placeholderTextColor={'#777'}
                onChangeText={setMobileNumber}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Alternate Mobile (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={'#777'}
                value={alternateMobile}
                onChangeText={setAlternateMobile}
                placeholder="Enter alternate mobile number"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={'#777'}
                value={addressLine1}
                onChangeText={setAddressLine1}
                placeholder="House No., Building Name"
              />

              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={'#777'}
                value={addressLine2}
                onChangeText={setAddressLine2}
                placeholder="Road, Area, Colony"
              />

              <View style={{flexDirection: 'row', gap: 10}}>
                <View>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={[styles.input]}
                    value={city}
                    placeholderTextColor={'#777'}
                    onChangeText={setCity}
                    placeholder="Enter city"
                  />
                </View>
                <View>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={state}
                    placeholderTextColor={'#777'}
                    onChangeText={setState}
                    placeholder="Enter state"
                  />
                </View>
              </View>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={pincode}
                placeholderTextColor={'#777'}
                onChangeText={setPincode}
                placeholder="Enter pincode"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.addressButton, {backgroundColor: '#372440'}]}
                onPress={() => handleAddAddress()}>
                {loading ? (
                  <ActivityIndicator color={'white'} size={20} />
                ) : (
                  <Text
                    style={{color: 'white', fontSize: 14, fontWeight: '700'}}>
                    Save Address
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 17,
    color: '#888',
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  address: {
    width: '80%',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  payText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  label: {
    fontSize: 16,
    // eclipse
    // marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
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
    width: '90%',
    // alignItems: 'center',
  },

  addressButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#ccc',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  inventoryItem: {
    // marginBottom: 10,
    padding: 10,
    // backgroundColor: '#f9f9f9',
    borderRadius: 8,
    // elevation: 5,
  },
  inventoryItemHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorContainer: {
    // marginBottom: 10,
  },
  sizeContainer: {
    // marginBottom: 10,
  },
  colorOption: {
    padding: 20,
    marginRight: 10,
    borderRadius: 25,
    elevation: 3,
    alignItems: 'center',
  },
  sizeOption: {
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 5,
    alignItems: 'center',
  },
  colorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#777',
  },
  selectedOption: {
    borderWidth: 2,
    marginRight: 10,
    borderColor: '#007bff',
  },
  paymentStatus: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productName: {
    // color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productImage: {
    width: '90%',
    height: 250,
    alignSelf: 'center',

    borderRadius: 10,
    marginBottom: 15,
  },
  noImageText: {
    // color: 'white',
    fontSize: 16,
    marginBottom: 15,
  },
  productDescription: {
    // color: 'white',
    fontSize: 16,
    marginBottom: 15,
  },
  productPrice: {
    // color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  productInventory: {
    // color: 'white',
    fontSize: 16,
    marginBottom: 15,
  },
  sellerInfoContainer: {
    // marginBottom: 10,
    flexDirection: 'row',
    // justifyContent:'space-around'
    gap: 10,
  },
  sellerName: {
    // color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerPhone: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f44',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },

  purchaseContainer: {
    // alignItems:'center',
    padding: 10,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topActionButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  reelContainer: {
    width,
    height,
    position: 'relative',
  },
  video: {
    width,
    height: '90%',
    backgroundColor: '#333',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    // alignItems: 'center',
    justifyContent: 'flex-start',
  },
  BuyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'green',
    width: '90%',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    color: 'white',
    marginBottom: 20,
    fontSize: 14,
    // textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    bottom: 190,
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  actionText: {
    color: 'white',
    marginTop: 5,
  },
});
export default ReelsScreen;
