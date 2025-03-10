import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import api from '../../../Utils/Api';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  generateSignedUrl,
  uploadImageToS3,
  uploadVideoToS3,
} from '../../../Utils/aws';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator, Checkbox, RadioButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Header from '../Header';
import * as Animatable from 'react-native-animatable';

const LiveStreamForm = () => {
  // State to store form values
  const [formValues, setFormValues] = useState({
    showTitle: '',
    date: '',
    time: '',
    category: '',
    subcategory: '',
    streamingLanguage: '',
  });
  const [categories, setCategories] = useState([
    {categoryName: 'No Data Found'},
  ]);
  const [selectedTab, setSelectedTab] = useState('buyNow');
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const navigaiton = useNavigation();
  const [products, setproducts] = useState([]);
  const [flag, setflag] = useState(false);
  const [followersFlag, setfollowerFlag] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({
    buyNow: [],
    auction: [],
    giveaway: [],
  });

  const tags = [
    'Music',
    'Gaming',
    'Live',
    'Q&A',
    'Tutorial',
    'Interview',
    'Podcast',
    'Art',
    'Cooking',
    'Fitness',
    'Tech',
    'Fashion',
    'Travel',
    'Photography',
    'Vlog',
    'News',
    'Education',
    'Comedy',
    'DIY',
    'Science',
    'Motivation',
    'Review',
    'Sports',
    'Health',
    'Finance',
    'Business',
    'Lifestyle',
    'History',
    'Spirituality',
    'Nature',
    'Movies',
    'Animation',
    'Programming',
    'Coding',
    'Startups',
    'Marketing',
    'Investing',
    'Self-Improvement',
    'Books',
    'Psychology',
    'Pets',
    'Food',
    'Automobile',
    'Workout',
    'Dance',
    'Writing',
    'Memes',
    'Design',
  ];

  const toggleTagSelection = tag => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tag)) {
        // Deselect the tag
        return prevSelectedTags.filter(item => item !== tag);
      } else {
        // Select the tag
        return [...prevSelectedTags, tag];
      }
    });
  };
  const handleChange = (field, value) => {
    setFormValues({...formValues, [field]: value});
    validateField(field, value);
  };
  const selectMedia = async type => {
    const options = {mediaType: type, quality: 1};

    launchImageLibrary(options, async response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.error('Image Picker Error: ', response.errorMessage);
        return;
      }

      if (type === 'photo') {
        setloading(true);
        const url =
          (await uploadImageToS3(response.assets[0].uri, 'LiveStreamThumbnails')) ||
          '';
        // console.log(url)
        setImageUrl(url);
        setloading(false);
        // console.log()
      } else if (type === 'video') {
        //   const videoDuration = response.assets[0].duration;

        setloading(true);
        const url =
          (await uploadVideoToS3(response.assets[0].uri, 'LiveStreamThumbnails')) ||
          '';
        setVideoUrl(url);
        setloading(false);
      }
    });
  };
  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'showTitle':
        if (!value) errorMessage = 'Title is required';

        break;
      case 'time':
        const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/; // Regex for HH:MM AM/PM format

        if (!value) {
          errorMessage = 'Time is required';
        } else if (!timeRegex.test(value)) {
          errorMessage = 'Invalid time format. Please use HH:MM AM/PM';
        }
        break;
        case 'date':
          if (!value) {
            errorMessage = 'Date is required';
          } else {
            // Check if the date is in the correct format (MM/DD/YYYY)
            const datePattern =
              /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/;
            if (!datePattern.test(value)) {
              errorMessage = 'Date must be in the format MM/DD/YYYY';
            } else {
              // Convert the input date to a Date object
              const inputDate = new Date(value.split('/').reverse().join('-'));
        
              // Get today's date
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Set the time to midnight for comparison
        
              // Check if the input date is today or in the future
              if (inputDate < today) {
                errorMessage = 'Date must be today or in the future';
              }
            }
          }
          break;
        
      default:
        break;
    }

    setErrors(prevState => ({...prevState, [name]: errorMessage}));
  };
  const validateForm = () => {
    let validationErrors = {};
    if (!formValues.showTitle)
      validationErrors.showTitle = 'Show Title is required';
    if (!formValues.date) validationErrors.date = 'Date is required';
    if (!formValues.time) validationErrors.time = 'Time is required';
    if (!selectedCategory) validationErrors.category = 'Category is required';
    if (!selectedSubCategory)
      validationErrors.subcategory = 'Subcategory is required';
    if (!formValues.streamingLanguage)
      validationErrors.streamingLanguage = 'Streaming Language is required';

    return validationErrors;
  };
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (!imageUrl) {
      ToastAndroid.show('Choose an Image for thumbnail', ToastAndroid.SHORT);
      return;
    }
    if (selectedTags.length <= 0) {
      ToastAndroid.show('Choose some Tags', ToastAndroid.SHORT);
      return;
    }
    if (
      selectedProducts.auction.length <= 0 &&
      selectedProducts.buyNow.length <= 0 &&
      selectedProducts.giveaway.length <= 0
    ) {
      ToastAndroid.show('Choose an Product for stream.', ToastAndroid.SHORT);
      return;
    }
    if (Object.keys(validationErrors).length === 0) {
      setloading(true);
      try {
        const sellerId = (await AsyncStorage.getItem(`sellerId`)) || '';
        const response = await api.post(`/shows/create`, {
          title: formValues.showTitle,
          date: formValues.date,
          time: formValues.time,
          category: selectedCategory,
          subCategory: selectedSubCategory,
          tags: selectedTags,
          thumbnailImage: imageUrl,
          previewVideo: videoUrl,
          language: formValues.streamingLanguage,
          sellerId: sellerId,
          buyNowProducts: selectedProducts.buyNow,
          auctionProducts: selectedProducts.auction,
          giveawayProducts: selectedProducts.giveaway,
        });
        navigaiton.goBack();
        ToastAndroid.show(
          `Show Scheduled on ${formValues.time}`,
          ToastAndroid.SHORT,
        );
      } catch (error) {
        console.log('error creating live', error);
      } finally {
        setloading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };
  const fetchProducts = async () => {
    try {
      const sellerId = await AsyncStorage.getItem('sellerId');
      const response = await api.get(`/product/listing/seller/${sellerId}`);

      // Transform data to include signed URLs for images
      const productsWithImages = await Promise.all(
        response.data.data.map(async product => {
          const imageUrl = product.images[0]
            ? await generateSignedUrl(product.images[0])
            : null;
          return {...product, imageUrl};
        }),
      );
      // console.log("Products",productsWithImages);
      setproducts(productsWithImages);
      setfilteredproducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const getAvailableProducts = tab => {
    return products.filter(
      product =>
        !selectedProducts.buyNow.some(p => p.productId === product._id) &&
        !selectedProducts.auction.some(p => p.productId === product._id) &&
        !selectedProducts.giveaway.some(p => p.productId === product._id),
    );
  };
  const handleProductSelect = (tab, product) => {
    const newProduct = {
      productId: product._id,
      ...(tab === 'buyNow' && {
        productPrice: product.productPrice,
        title: product.title,
        images: product.images,
      }),
      ...(tab === 'auction' && {
        startingPrice: product.startingPrice,
        reservedPrice: product.reservedPrice,
        images: product.images,
        title: product.title,
      }),
      ...(tab === 'giveaway' && {
        followersOnly: false,
        images: product.images,
        title: product.title,
      }),
    };

    // Add the selected product to selectedProducts
    setSelectedProducts(prev => ({
      ...prev,
      [tab]: [...prev[tab], newProduct],
    }));

    // Remove the product from filteredProducts
    setfilteredproducts(prev => prev.filter(p => p._id !== product._id));
  };
  const handleProductRemove = (tab, productId) => {
    // console.log(tab,productId)
    setSelectedProducts(prev => {
      // Filter the selected products for the specific tab and remove the product with the given productId
      const updatedTabProducts = prev[tab].filter(
        p => p.productId !== productId,
      );

      // Update the state only if there is any change, to avoid unnecessary state updates
      if (updatedTabProducts.length === 0) {
        return {
          ...prev,
          [tab]: updatedTabProducts, // This will just be an empty array for this tab
        };
      }

      return {
        ...prev,
        [tab]: updatedTabProducts,
      };
    });
    // setfilteredproducts(getAvailableProducts(selectedTab));
    setSelectedTab(tab)
  };
  const handleAuctionChange = (productId, field, value) => {
    setSelectedProducts(prev => ({
      ...prev,
      auction: prev.auction.map(p =>
        p.productId === productId ? {...p, [field]: Number(value)} : p,
      ),
      buyNow: prev.buyNow.map(p =>
        p.productId === productId ? {...p, [field]: Number(value)} : p,
      ),
    }));
    setfilteredproducts(prev =>
      prev.map(p => (p._id === productId ? {...p, [field]: value} : p)),
    );
    setproducts(prev =>
      prev.map(p => (p._id === productId ? {...p, [field]: value} : p)),
    );
  };
  const handleAuctionChangeProduct = (productId, field, value) => {
    setfilteredproducts(prev =>
      prev.map(p => (p._id === productId ? {...p, [field]: value} : p)),
    );
    setproducts(prev =>
      prev.map(p => (p._id === productId ? {...p, [field]: value} : p)),
    );
  };
  const handleGiveawayChange = (productId, followersOnly) => {
    // console.log(productId,followersOnly)
    setSelectedProducts(prev => ({
      ...prev,
      giveaway: prev.giveaway.map(p =>
        p.productId === productId ? {...p, followersOnly} : p,
      ),
    }));
    setflag(followersOnly);
  };
  const handleAllFollowersOnlyChange = value => {
    setSelectedProducts(prev => ({
      ...prev,
      giveaway: prev.giveaway.map(p => ({...p, followersOnly: value})),
    }));
    setfollowerFlag(value);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setloading(true);
      try {
        const categoryResponse = await api.get('/categories/get');
        setCategories(categoryResponse.data);
      } catch (err) {
        console.log('Failed to fetch categories & products', err);
      } finally {
        setloading(false);
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);
  const [filteredproducts, setfilteredproducts] = useState([]);
  useEffect(() => {
    setfilteredproducts(getAvailableProducts(selectedTab));
  }, [selectedTab]);
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
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{alignItems: 'center', marginBottom: 20}}>
          <View style={styles.headerContainer}>
            <Feather name="video" size={30} color="##fcd34d" />

            <Text style={styles.headerText}>Schedule Live Show</Text>
          </View>
          <Text style={{fontSize: 14, color: '#777'}}>
            Fill in the details to set up your live stream
          </Text>
        </View>

        <View>
          {/* Show Title */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <MaterialIcons name="title" color="#fcd34d" size={25} />
              <Text style={styles.label}>Show Title *</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter engaging title for show"
              placeholderTextColor={'#777'}
              value={formValues.showTitle}
              onChangeText={text => handleChange('showTitle', text)}
            />
            {errors.showTitle && (
              <Text style={styles.errorText}>{errors.showTitle}</Text>
            )}
          </View>
          <View
            style={[
              styles.headerContainer,
              {alignSelf: 'flex-start', marginBottom: 10},
            ]}>
            <MaterialIcons name="date-range" color="#fcd34d" size={25} />
            <Text style={styles.label}>Date *</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={'#777'}
              value={formValues.date}
              onChangeText={text => handleChange('date', text)}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Time */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <MaterialIcons name="access-time" color="#fcd34d" size={25} />
              <Text style={styles.label}>Time *</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="HH:MM AM/PM"
              placeholderTextColor={'#777'}
              value={formValues.time}
              onChangeText={text => handleChange('time', text)}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>

          {/* Category Dropdown */}
          <View style={styles.dropdownContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <MaterialIcons name="category" color="#fcd34d" size={25} />
              <Text style={styles.label}>Category *</Text>
            </View>
            <Dropdown
              data={categories}
              labelField="categoryName"
              valueField="categoryName"
              placeholder="Select Category"
              value={selectedCategory}
              style={styles.dropdown}
              onChange={item => setSelectedCategory(item.categoryName)}
            />
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Subcategory Dropdown */}
          <View style={styles.dropdownContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <MaterialIcons name="filter-none" color="#fcd34d" size={25} />
              <Text style={styles.label}>SubCategory *</Text>
            </View>
            <Dropdown
              data={
                categories.find(category => {
                  return category.categoryName === selectedCategory;
                })?.subcategories || []
              }
              onChange={item => setSelectedSubCategory(item.name)}
              labelField="name"
              valueField="name"
              style={styles.dropdown}
              placeholder="Select Subcategory"
              value={selectedSubCategory}
            />
            {errors.subcategory && (
              <Text style={styles.errorText}>{errors.subcategory}</Text>
            )}
          </View>
          <View
            style={[
              styles.headerContainer,
              {alignSelf: 'flex-start', marginBottom: 10},
            ]}>
            <AntDesign name="tago" color="#fcd34d" size={25} />
            <Text style={styles.label}>Tags *</Text>
          </View>
          {/* #a5b4fc */}

          <View
            style={{
              backgroundColor: '#f0f7ff',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderRadius: 10,
              elevation:4,
            }}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={styles.tagButton}>
              <AntDesign name="plus" size={25} />
              <Text>Add Tags</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedTagsContainer}>
            {selectedTags.length > 0 ? (
              selectedTags.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.selectedTag}
                  onPress={() => setIsModalVisible(true)}>
                  <Text style={{fontSize: 16}}>{item}</Text>
                  <MaterialIcons
                    name="remove-circle-outline"
                    size={17}
                    color="red"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text>No tags selected</Text>
            )}
          </View>
          <View style={[styles.productContainer,{justifyContent:'none'}]}>
            <Feather name="shopping-cart" size={23} />
            <Text style={{fontSize: 20}}>Add Products to Stream</Text>
          </View>

          <View style={styles.tabContainer}>
            {[`buyNow`, `auction`, `giveaway`].map(tab => {
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
                    {tab === 'buyNow'
                      ? `Buy Now (${selectedProducts.buyNow.length})`
                      : tab === 'auction'
                      ? `Auction (${selectedProducts.auction.length})`
                      : tab === 'giveaway'
                      ? `Giveaway (${selectedProducts.giveaway.length})`
                      : 'Unknown Tab'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{marginBottom: 10}}>
            <Text style={{fontSize: 18, marginBottom: 10, color: '#777'}}>
              Available Products
            </Text>
            {filteredproducts.length > 0 ? null : (
              <Text style={styles.empty}>No Products Available</Text>
            )}
            {selectedTab === 'giveaway' ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  onPress={() => handleAllFollowersOnlyChange(true)} 
                >
                  <RadioButton
                    value={'true'}
                    status={followersFlag ? 'checked' : 'unchecked'}
                    onPress={() => handleAllFollowersOnlyChange(true)} 
                  />
                </TouchableOpacity>
                <Text>Followers Only</Text>

                <TouchableOpacity
                  onPress={() => handleAllFollowersOnlyChange(false)}
                >
                  <RadioButton
                    value={'false'}
                    status={followersFlag ? 'unchecked' : 'checked'} 
                    onPress={() => handleAllFollowersOnlyChange(false)}
                  />
                </TouchableOpacity>
                <Text>Open to All</Text>
              </View>
            ) : null}

            {filteredproducts.map(product => {
              return (
                <View
                  key={product._id}
                  style={[
                    styles.productContainer,
                    {
                      borderBottomWidth: 1,
                      paddingBottom: 10,
                      borderBottomColor: '#ccc',
                      marginBottom: 10,
                    },
                  ]}>
                  <Image
                    source={{uri: product.imageUrl}}
                    style={styles.avatar}
                  />
                  <View style={{width: '55%'}}>
                    <Text
                      style={[
                        styles.prductLabel,
                        {fontSize: 16, fontWeight: '600'},
                      ]}>
                      {product?.title}
                    </Text>
                    <View style={{flexDirection: 'row', gap: 5}}>
                      <AntDesign name="CodeSandbox" color="green" size={20} />
                      <Text style={styles.prductLabel}>
                        Stock {product?.quantity}
                      </Text>
                    </View>
                    {selectedTab === 'buyNow' ? (
                      <>
                        <Text style={styles.prductLabel}>
                          Starting Price ₹{product?.startingPrice}
                        </Text>
                        <Text style={styles.prductLabel}>
                          Reserved Price ₹{product?.reservedPrice}
                        </Text>
                      </>
                    ) : null}
                    {selectedTab === 'buyNow' ? (
                      <>
                        <Text style={styles.prductLabel}>Product Price :</Text>
                        <TextInput
                          value={product?.productPrice?.toString()}
                          style={[
                            styles.input,
                            {backgroundColor: '#343438', color: 'white'},
                          ]}
                          keyboardType="numeric"
                          onChangeText={text =>
                            handleAuctionChangeProduct(
                              product._id,
                              'productPrice',
                              text,
                            )
                          }
                        />
                      </>
                    ) : selectedTab === 'auction' ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <View>
                          <Text style={{marginBottom: 5}}>Starting Price</Text>
                          <TextInput
                            value={product?.startingPrice?.toString()}
                            style={[
                              styles.input,
                              {backgroundColor: '#343438', color: 'white'},
                            ]}
                            keyboardType="numeric"
                            onChangeText={text =>
                              handleAuctionChangeProduct(
                                product._id,
                                'startingPrice',
                                text,
                              )
                            }
                          />
                        </View>
                        <View>
                          <Text style={{marginBottom: 5}}>Reserved Price</Text>
                          <TextInput
                            value={product?.reservedPrice?.toString()}
                            style={[
                              styles.input,
                              {backgroundColor: '#343438', color: 'white'},
                            ]}
                            keyboardType="numeric"
                            onChangeText={text =>
                              handleAuctionChangeProduct(
                                product._id,
                                'reservedPrice',
                                text,
                              )
                            }
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                  <RadioButton
                    value={''}
                    status={'unchecked'}
                    color='green'
                    onPress={() => handleProductSelect(selectedTab, product)}
                  />
                </View>
              );
            })}
          </View>
          {selectedProducts.auction.length > 0 ||
          selectedProducts.buyNow.length > 0 ||
          selectedProducts.giveaway.length > 0 ? (
            <Text style={{fontSize: 18, marginBottom: 10, color: '#777'}}>
              Selected Products
            </Text>
          ) : null}

          {selectedProducts[selectedTab]?.map(product => {
            // Find the corresponding product details from the Products array based on productId
            const matchedProduct = products.find(
              p => p._id === product.productId,
            );
            // console.log(product)
            // console.log(matchedProduct)
            if (matchedProduct) {
              return (
                <View
                  key={matchedProduct._id}
                  style={[
                    styles.productContainer,
                    {
                      backgroundColor: '#00a96e52',
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      justifyContent:
                        selectedTab == 'giveaway' ? '' : 'space-between',
                      borderRadius: 10,
                    },
                  ]}>
                  <Image
                    source={{uri: matchedProduct?.imageUrl}}
                    style={styles.avatar1}
                  />
                  <View>
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.prductLabel,
                          {fontWeight: '600', fontSize: 16},
                        ]}>
                        {matchedProduct?.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          handleProductRemove(selectedTab, matchedProduct._id)
                        }>
                        <AntDesign name="delete" size={20} />
                        {/* <Text style={{fontWeight:'bold'}}>Remove</Text> */}
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.row, {gap: 10}]}>
                    <View style={{flexDirection: 'row', gap: 5}}>
                      <AntDesign name="CodeSandbox" color="#be84f2" size={20} />
                      <Text style={styles.prductLabel}>
                        Stock {matchedProduct?.quantity}
                      </Text>
                    </View>
                      {selectedTab == 'giveaway' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <RadioButton
                            value={'true'}
                            status={
                              product.followersOnly ? 'checked' : 'unchecked'
                            }
                            onPress={() =>
                              handleGiveawayChange(matchedProduct._id, !flag)
                            }
                          />
                          <Text style={{width:70}}>Followers Only</Text>
                        </View>
                      ) : null}
                    </View>
                    {selectedTab === 'buyNow' ? (
                      <>
                        <Text style={styles.prductLabel}>
                          Starting Price {matchedProduct?.startingPrice}
                        </Text>
                        <Text style={styles.prductLabel}>
                          Reserved Price {matchedProduct?.reservedPrice}
                        </Text>
                        <TextInput
                          value={matchedProduct?.productPrice?.toString()}
                          style={{
                            color: 'black',
                            borderWidth: 1,
                            width: 200,
                            borderRadius: 10,
                            borderColor: '#ccc',
                          }}
                          onChangeText={text =>
                            handleAuctionChange(
                              matchedProduct._id,
                              'productPrice',
                              text,
                            )
                          }
                        />
                      </>
                    ) : selectedTab === 'auction' ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <View>
                          <Text style={{marginBottom: 5}}>Starting Price</Text>
                          <TextInput
                            value={matchedProduct?.startingPrice?.toString()}
                            style={{
                              color: 'black',
                              borderWidth: 1,
                              borderRadius: 10,
                              borderColor: '#ccc',
                            }}
                            onChangeText={text =>
                              handleAuctionChange(
                                matchedProduct._id,
                                'startingPrice',
                                text,
                              )
                            }
                          />
                        </View>
                        <View>
                          <Text style={{marginBottom: 5}}>Reserved Price</Text>
                          <TextInput
                            value={matchedProduct?.reservedPrice?.toString()}
                            style={{
                              color: 'black',
                              borderWidth: 1,
                              borderRadius: 10,
                              borderColor: '#ccc',
                            }}
                            onChangeText={text =>
                              handleAuctionChange(
                                matchedProduct._id,
                                'reservedPrice',
                                text,
                              )
                            }
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            } else {
              return null; // If no match found, return null or handle as needed
            }
          })}

          <View style={styles.dropdownContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <AntDesign name="earth" color="#fcd34d" size={25} />
              <Text style={styles.label}>Streaming Language *</Text>
            </View>
            <Dropdown
              data={[
                {value: 'hindi', label: 'Hindi'},
                {value: 'bengali', label: 'Bengali'},
                {value: 'telugu', label: 'Telugu'},
                {value: 'marathi', label: 'Marathi'},
                {value: 'tamil', label: 'Tamil'},
                {value: 'urdu', label: 'Urdu'},
                {value: 'gujarati', label: 'Gujarati'},
                {value: 'kannada', label: 'Kannada'},
                {value: 'malayalam', label: 'Malayalam'},
                {value: 'odia', label: 'Odia'},
                {value: 'punjabi', label: 'Punjabi'},
                {value: 'assamese', label: 'Assamese'},
                {value: 'maithili', label: 'Maithili'},
                {value: 'sanskrit', label: 'Sanskrit'},
                {value: 'english', label: 'English'},
              ]}
              labelField="label"
              valueField="value"
              style={styles.dropdown}
              placeholder="Select Language"
              value={formValues.streamingLanguage}
              onChange={item => handleChange('streamingLanguage', item.value)}
              search
              searchPlaceholder="Search a Language"
              searchPlaceholderTextColor="#777"
              renderRightIcon={() => (
                <AntDesign name="earth" size={20} color="#000" /> // Custom icon here
              )}
            />
            {errors.streamingLanguage && (
              <Text style={styles.errorText}>{errors.streamingLanguage}</Text>
            )}

            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginTop: 10, marginBottom: 10},
              ]}>
              <Feather name="image" color="#fcd34d" size={25} />
              <Text style={styles.label}>Thumbnail Image *</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.upload,
                {borderColor: imageUrl ? 'green' : '#ccc', borderWidth: 2},
              ]}
              onPress={() => selectMedia('photo')}>
              <Text>Click to Upload a Thumbnail Image</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginTop: 10, marginBottom: 10},
              ]}>
              <Feather name="video" color="#fcd34d" size={25} />
              <Text style={styles.label}>Preview Video (9:16)</Text>
              <Text style={{color: '#ccc'}}>(optional)</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.upload,
                {borderColor: videoUrl ? 'green' : '#ccc', borderWidth: 2},
              ]}
              onPress={() => selectMedia('video')}>
              <Text>Click to Upload a Preview Video</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <Animatable.View animation={'bounce'} iterationCount={10} style={{}}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Feather name="video" size={20} />
              <Text style={styles.buttonText}>Schedule a Live Stream</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Tags</Text>

              {/* List of tags with checkboxes, arranged in two columns */}
              <FlatList
                data={tags}
                renderItem={({item}) => (
                  <View style={styles.tagContainer}>
                    <Checkbox
                      status={
                        selectedTags.includes(item) ? 'checked' : 'unchecked'
                      }
                      color={selectedTags.includes(item) ? 'green' : 'red'}
                      onPress={() => toggleTagSelection(item)}
                    />
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2} // This will display tags in 2 columns
                columnWrapperStyle={styles.columnWrapper} // Space between columns
              />

              {/* Submit button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>

              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 17,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 30,
  },
  removeButton: {
    flexDirection: 'row',
    backgroundColor: '#ff5861',
    paddingVertical: 5,
    gap: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  avatar: {height: 100, width: '20%', borderRadius: 10},
  avatar1: {height: 100, width: '30%', borderRadius: 10},
  empty: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    color: '#ccc',
  },
  productContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-evenly',
    marginBottom: 10,
    alignItems: 'center',
  },
  prductLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    elevation:5,
    width: '100%',
    marginTop: 2,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    // borderWidth:1,
    // borderColor:'blue'
    // borderBottomWidth: 1,
    // borderBottomColor: 'blue',
  },
  tab: {
    paddingVertical: 8,
    flexDirection: 'row',
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    // marginBottom: 10,
  },
  selectedTab: {
    backgroundColor: '#fbdd74',
    alignItems: 'center',
    elevation:3,
  },
  tabText: {
    fontSize: 16,
    textTransform: 'capitalize',
    // color: 'white',
    fontWeight:'700',
    textAlign: 'center',
  },
  selectedTabText: {
    color: 'black',
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
  selectedTagsContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'center',
    borderColor: '#ccc',
    gap: 10,
    width: '90%',
    marginBottom: 10,
  },
  selectedTagsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTag: {
    fontSize: 16,
    padding: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
  },
  tagButton: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 5,
    elevation: 3,
    // paddingHorizontal:10,
    backgroundColor: '#fcd34d',
    borderRadius: 10,
    // marginBottom: 10,
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upload: {
    borderWidth: 1,
    borderRadius: 10,
    height: 150,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dotted',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent:'c'
    // marginBottom:20,
    alignSelf: 'center',
    gap: 10,
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    height: '60%',
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
    // marginBottom: 10,
    flex: 1, // Ensures the checkbox and text take up the available space
  },
  tagText: {
    fontSize: 16,
    marginLeft: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Adds space between the columns
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#fcd34d',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: 'black',
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    borderRadius: 10,
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    // marginBottom: 5,
  },
  button: {
    backgroundColor: '#fcd34d',
    padding: 12,
    borderRadius: 5,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    // color: '#fff',
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LiveStreamForm;
