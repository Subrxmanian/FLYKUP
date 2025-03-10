import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Header from './Header';
import api from '../../Utils/Api';
import {generateSignedUrl, uploadImageToS3} from '../../Utils/aws';

const AddingProducts = () => {
  const route = useRoute();
  const data = route.params;
  const [formValues, setFormValues] = useState({
    showTitle: '',
    description: '',
    Qunatity: '',
    hsn: '',
    startingPrice: '',
    reservedPrice: '',
    productPrice: '',
    packageWeight: '',
    hazardousMaterial: '',
  });
  const [categories, setCategories] = useState([
    {categoryName: 'No Data Found'},
  ]);
  const[updateFlag,setUpdateflag]=useState(false)
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setloading] = useState(false);
  const navigaiton = useNavigation();
  const handleChange = (field, value) => {
    setFormValues({...formValues, [field]: value});
    validateField(field, value);
  };
  const selectMedia = async type => {
    // Limiting to 4 images
    if (imageUrls.length >= 4) {
      ToastAndroid.show(
        'Only 4 images allowed for the product.',
        ToastAndroid.SHORT,
      );
      return;
    }

    const options = {mediaType: type, quality: 1};

    // Launch the image picker
    launchImageLibrary(options, async response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.error('Image Picker Error: ', response.errorMessage);
        return;
      }

      // File validation (JPEG, JPG, PNG)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(response.assets[0].type)) {
        ToastAndroid.show(
          'Invalid file type. Please upload JPG, JPEG, or PNG.',
          ToastAndroid.SHORT,
        );
        return;
      }

      setloading(true);
      try {
        // Upload image to S3
        const uploadKey = await uploadImageToS3(
          response.assets[0].uri,
          'ProductImages',
        ); // Get the S3 object key
        if (!uploadKey) {
          throw new Error('Failed to upload image to S3');
        }

        // Generate the preview URL using the key
        const previewUrl = await generateSignedUrl(uploadKey); 

        // Create an object to store both key and preview URL
        const imageObj = {
          key: uploadKey, // Store the S3 key
          preview: previewUrl, // Store the preview URL
        };

        // Add new image object to the image array, keeping it within a limit of 4 images
        setImageUrls(prevUrls => {
          const updatedUrls = [...prevUrls, imageObj];
          return updatedUrls.slice(0, 4); // Ensure no more than 4 images
        });
      } catch (error) {
        console.error('Image upload error:', error);
        ToastAndroid.show('Failed to upload image.', ToastAndroid.SHORT);
      } finally {
        setloading(false);
      }
    });
  };
  const removeImage = index => {
    setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'showTitle':
        if (!value) errorMessage = 'Title is required';

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

    if (!selectedCategory) validationErrors.category = 'Category is required';
    if (!selectedSubCategory)
      validationErrors.subcategory = 'Subcategory is required';
    return validationErrors;
  };
  const handleSubmit = async () => {
    const validationErrors = validateForm();

    // Check if any required form values are missing
    const requiredFields = [
      {name: 'showTitle', label: 'Title'},
      {name: 'description', label: 'Description'},
      {name: 'Qunatity', label: 'Quantity'},
      {name: 'productPrice', label: 'Product Price'},
      {name: 'startingPrice', label: 'Starting Price'},
      {name: 'reservedPrice', label: 'Reserved Price'},
      {name: 'packageWeight', label: 'Package Weight'},
    ];

    for (let field of requiredFields) {
      if (!formValues[field.name]) {
        ToastAndroid.show(`${field.label} is required`, ToastAndroid.SHORT);
        return;
      }
    }

    // Check if the imageUrls array has at least one item
    if (imageUrls.length === 0) {
      ToastAndroid.show(
        'Choose at least one image for the thumbnail',
        ToastAndroid.SHORT,
      );
      return;
    }

    if (imageUrls.length > 4) {
      ToastAndroid.show(
        'Only 4 images are allowed for the thumbnail',
        ToastAndroid.SHORT,
      );
      return;
    }

    if (!selectedCategory) {
      ToastAndroid.show('Choose a Category', ToastAndroid.SHORT);
      return;
    }

    if (!selectedSubCategory) {
      ToastAndroid.show('Choose a SubCategory', ToastAndroid.SHORT);
      return;
    }

    if (Object.keys(validationErrors).length === 0) {
      setloading(true);

      try {
        const imageKeys = imageUrls.map(img => img.key);

        const sellerId = (await AsyncStorage.getItem('sellerId')) || '';
        if(updateFlag){
          const response = await api.put(`/product/listing/${data?.data?._id}`, {
            title: formValues.showTitle,
            description: formValues.description,
            quantity: formValues.Qunatity,
            images: imageKeys, // Send images as keys
            category: selectedCategory,
            subcategory: selectedSubCategory,
            hsnNo: formValues.hsn || '',
            productPrice: formValues.productPrice,
            startingPrice: formValues.startingPrice,
            reservedPrice: formValues.reservedPrice,
            weight: formValues.packageWeight,
            hazardousMaterials: formValues.hazardousMaterial,
          });
  
          // Navigate back to product listing page after successful creation
          navigaiton.goBack();
          ToastAndroid.show(
            'Product successfully Updated. ',
            ToastAndroid.SHORT,
          );

        }else{
        console.log("this only executes ")
          const response = await api.post(`/product/listing/${sellerId}`, {
            title: formValues.showTitle,
            description: formValues.description,
            quantity: formValues.Qunatity,
            images: imageKeys, // Send images as keys
            category: selectedCategory,
            subcategory: selectedSubCategory,
            hsnNo: formValues.hsn || '',
            productPrice: formValues.productPrice,
            startingPrice: formValues.startingPrice,
            reservedPrice: formValues.reservedPrice,
            weight: formValues.packageWeight,
            hazardousMaterials: formValues.hazardousMaterial,
          });
  
          // Navigate back to product listing page after successful creation
          navigaiton.goBack();
          ToastAndroid.show(
            'Product successfully added.',
            ToastAndroid.SHORT,
          );
        }

       
      } catch (error) {
        console.error('Error creating live product:', error);
        ToastAndroid.show(
          'Error in products',
          ToastAndroid.SHORT,
        );
      } finally {
        setloading(false);
      }
    } else {
      setErrors(validationErrors);
    }
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

    fetchCategories();
  }, []);
  const weightOptions = [
    {label: '0-0.5 kg', value: '0-0.5 kg'},
    {label: '0.5-1 kg', value: '0.5-1 kg'},
    {label: '1-1.5 kg', value: '1-1.5 kg'},
    {label: '1.5-2 kg', value: '1.5-2 kg'},
    {label: '2-2.5 kg', value: '2-2.5 kg'},
    {label: '2.5-3 kg', value: '2.5-3 kg'},
    {label: '3-3.5 kg', value: '3-3.5 kg'},
    {label: '3.5-4 kg', value: '3.5-4 kg'},
    {label: '4-4.5 kg', value: '4-4.5 kg'},
    {label: '4.5-5 kg', value: '4.5-5 kg'},
    {label: '5-5.5 kg', value: '5-5.5 kg'},
    {label: '5.5-6 kg', value: '5.5-6 kg'},
    {label: '6-6.5 kg', value: '6-6.5 kg'},
    {label: '6.5-7 kg', value: '6.5-7 kg'},
    {label: '7-7.5 kg', value: '7-7.5 kg'},
    {label: '7.5-8 kg', value: '7.5-8 kg'},
    {label: '8-8.5 kg', value: '8-8.5 kg'},
    {label: '8.5-9 kg', value: '8.5-9 kg'},
    {label: '9-9.5 kg', value: '9-9.5 kg'},
    {label: '9.5-10 kg', value: '9.5-10 kg'},
  ];
  const hazardousMaterialsOptions = [
    {label: 'Select Hazardous Materials'},
    {label: 'No hazardous materials', value: 'no hazardous materials'},
    {label: 'Fragrances', value: 'fragrances'},
    {label: 'Lithium batteries', value: 'lithium batteries'},
    {label: 'Other hazardous materials', value: 'other hazardous materials'},
  ];
  useEffect(() => {
    const fetchData = async () => {
      setloading(true);
      try {
        const data1 = data?.data;
        if (data1) {
          // Setting form values based on the fetched data
          setFormValues({
            showTitle: data1?.title,
            description: data1?.description,
            Qunatity: data1?.quantity.toString(),
            hsn: data1?.hsnNo,
            productPrice: data1?.productPrice.toString(),
            startingPrice: data1?.startingPrice.toString(),
            reservedPrice: data1?.reservedPrice?.toString(),
            packageWeight: data1?.weight,
            hazardousMaterial: data1?.hazardousMaterials,
          });
                    setUpdateflag(true)
          setSelectedCategory(data1?.category);
          setSelectedSubCategory(data1?.subcategory);
          const imageKeys = data1?.images || []; 
          const newImageUrls = []; 
    
          // Process each image one by one
          for (const imagePath of imageKeys) {
            
            // Generate the signed URL for the image
            const previewUrl = await generateSignedUrl(imagePath);
    
            // Create an object for each image with key and preview URL
            const imageObj = {
              key: imagePath,
              preview: previewUrl,
            };
    
            // Add the image to the temporary newImageUrls array
            newImageUrls.push(imageObj);
          }
    
          // Replace the imageUrls state with the new array of images
          setImageUrls(newImageUrls);
    
        }
      } catch (error) {
        console.log('Error while fetching', error);
      } finally {
        setloading(false);
      }
    };
    
    
    
    fetchData();
  }, []);

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
      <Animatable.View animation={'slideInDown'} iterationCount={1}>
        <Header />
      </Animatable.View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{alignItems: 'center', marginBottom: 20}}>
          <View style={styles.headerContainer}>
            <Animatable.View
              animation={'zoomInDown'}
              iterationCount={10}
              delay={1000}>
              <Feather name="shopping-cart" size={30} color="#00000" />
            </Animatable.View>

            <Text style={styles.headerText}>{data?'Update':'Add'} Products</Text>
          </View>
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
              placeholder="Enter engaging title for Product"
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
            <MaterialIcons name="list-alt" color="#fcd34d" size={25} />
            <Text style={styles.label}>Description *</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputMultiline]}
              placeholder="Enter something about your product"
              placeholderTextColor={'#777'}
              multiline={true}
              numberOfLines={4}
              value={formValues.description}
              textAlignVertical="top"
              onChangeText={text => handleChange('description', text)}
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
              <AntDesign name="tago" color="#fcd34d" size={25} />
              <Text style={styles.label}>Qunatity *</Text>
            </View>

            <TextInput
              style={[styles.input,{backgroundColor:data?'#f0f7ff':''}]}
              placeholder="Enter the Quantity"
              placeholderTextColor={'#777'}
              keyboardType="numeric"
              editable={data?false:true}
              value={formValues.Qunatity}
              onChangeText={text => handleChange('Qunatity', text)}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.headerContainer,
                {alignSelf: 'flex-start', marginBottom: 10},
              ]}>
              <MaterialIcons name="content-paste" color="#fcd34d" size={25} />
              <Text style={styles.label}># HSN No </Text>
              <Text style={{color: '#ccc'}}>(Optional)</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter the HSN No."
              placeholderTextColor={'#777'}
              keyboardType="numeric"
              value={formValues.hsn}
              onChangeText={text => handleChange('hsn', text)}
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
              {alignSelf: 'flex-start', marginTop: 10, marginBottom: 10},
            ]}>
            <Feather name="image" color="#fcd34d" size={25} />
            <Text style={styles.label}>Images *</Text>
          </View>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <ScrollView
              horizontal
              contentContainerStyle={{flexDirection: 'row', gap: 10}}>
              {imageUrls?.map((image, index) => (
                <View key={index} style={{position: 'relative'}}>
                  <Image
                    source={image.preview ? {uri: image.preview} : undefined}
                    style={{
                      height: 90,
                      width: 70,
                      borderRadius: 10,
                      borderWidth: 1,
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: 1,
                      backgroundColor: 'rgb(254, 1, 1)',
                      borderRadius: 15,
                      padding: 2,
                    }}
                    onPress={() => removeImage(index)}>
                    <MaterialIcons
                      name="remove-circle"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.upload,
                  {borderColor: '#6568f1', borderWidth: 2},
                ]}
                onPress={() => selectMedia('photo')}>
                <MaterialIcons
                  name="add-circle-outline"
                  size={25}
                  color="#6568f1"
                />
                <Text style={{color: '#6568f1'}}>Add Image</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={{flexDirection: 'row', gap: 4, padding: 10}}>
            <AntDesign name="infocirlce" color="#777" size={17} />
            <Text style={{color: '#777'}}>
              Upload up to 4 images (JPG, JPEG, PNG)
            </Text>
          </View>
          <View>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginTop: 20}}>
              Product Pricing
            </Text>
            <Text style={{color: '#777'}}>
              Set your product's pricing options for direct purchase and auction
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: '#f0f7ff',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginTop: 10,
                  elevation: 2,
                },
              ]}>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <Feather name="shopping-cart" size={25} color="#6568f1" />
                <Text style={[styles.label, {fontSize: 18, color: '#6568f1'}]}>
                  Buy it Now{' '}
                </Text>
              </View>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <MaterialIcons
                  name="currency-rupee"
                  size={20}
                  color="#6568f1"
                />
                <Text style={[styles.label, {fontSize: 16}]}>
                  Product Price *
                </Text>
              </View>
              <TextInput
                placeholder=" ₹ Enter the direct purchase price"
                placeholderTextColor={'#777'}
                keyboardType="numeric"
                style={[styles.input, {backgroundColor: '#fff'}]}
                value={formValues.productPrice}
                onChangeText={text => handleChange('productPrice', text)}
              />

              {errors.time && (
                <Text style={styles.errorText}>{errors.time}</Text>
              )}
            </View>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: '#fffbeb',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginTop: 10,
                  borderColor: '#feeeb2',
                  elevation: 3,
                },
              ]}>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <MaterialIcons name="gavel" size={25} color="#92400e" />
                <Text style={[styles.label, {fontSize: 18, color: '#92400e'}]}>
                  Auction Settings
                </Text>
              </View>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <MaterialIcons
                  name="currency-rupee"
                  size={20}
                  color="#92400e"
                />
                <Text style={[styles.label, {fontSize: 16}]}>
                  Starting Price *
                </Text>
              </View>
              <TextInput
                placeholder=" ₹ Enter the Starting price"
                placeholderTextColor={'#777'}
                keyboardType="numeric"
                style={[styles.input, {backgroundColor: '#fff'}]}
                value={formValues.startingPrice}
                onChangeText={text => handleChange('startingPrice', text)}
              />

              {errors.startingPrice && (
                <Text style={styles.errorText}>{errors.startingPrice}</Text>
              )}
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <Feather name="shield" size={20} color="green" />
                <Text style={[styles.label, {fontSize: 16}]}>
                  Reserved Price *
                </Text>
              </View>
              <TextInput
                placeholder=" ₹ Enter the minimum acceptable bid"
                placeholderTextColor={'#777'}
                keyboardType="numeric"
                style={[styles.input, {backgroundColor: '#fff'}]}
                value={formValues.reservedPrice}
                onChangeText={text => handleChange('reservedPrice', text)}
              />
              {errors.reservedPrice && (
                <Text style={styles.errorText}>{errors.reservedPrice}</Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  marginTop: 10,
                  padding: 10,
                  borderLeftWidth: 5,
                  borderLeftColor: '#22c55e',
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  backgroundColor: '#dcfce7',
                }}>
                <Text style={{color: '#777', maxWidth: 250}}>
                  If final bidding is below reserved price, item remains unsold.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginTop: 10,
                },
              ]}>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <Feather name="map" size={25} color="#9334ea" />
                <Text
                  style={[styles.label, {fontSize: 18, fontWeight: 'bold'}]}>
                  Shipping Details
                </Text>
              </View>
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <MaterialIcons name="access-time" size={20} color="#b8b5f5" />
                <Text style={[styles.label, {fontSize: 16}]}>
                  Package Weight *
                </Text>
              </View>
              <Dropdown
                data={weightOptions}
                labelField="label"
                valueField="value"
                renderLeftIcon={() => (
                  <MaterialIcons name="inventory" size={20} color="#ccc" />
                )}
                placeholder="Select Weight"
                value={formValues.packageWeight}
                style={styles.dropdown}
                onChange={item => handleChange('packageWeight', item.value)}
              />
              {errors.time && (
                <Text style={styles.errorText}>{errors.time}</Text>
              )}
              <View
                style={[
                  styles.headerContainer,
                  {alignSelf: 'flex-start', marginBottom: 10, marginTop: 10},
                ]}>
                <AntDesign name="CodeSandbox" size={20} color="green" />
                <Text style={[styles.label, {fontSize: 16}]}>
                  Hazardous Materials *
                </Text>
              </View>
              <Dropdown
                data={hazardousMaterialsOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Hazardous Materials"
                value={formValues.hazardousMaterial}
                renderLeftIcon={() => (
                  <Feather name="shield" size={20} color="#ccc" />
                )}
                style={styles.dropdown}
                onChange={item => handleChange('hazardousMaterial', item.value)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <Animatable.View animation={'bounce'} iterationCount={10} style={{}}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <MaterialIcons name="add-business" size={20} />
              <Text style={styles.buttonText}>{data?'Update':'Add'} Product</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
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

  upload: {
    borderWidth: 1,
    borderRadius: 10,
    height: 100,
    width: 100,
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
    height: 50,
    color: 'black',
    fontSize: 16,
  },
  inputMultiline: {
    color: 'black',
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    height: 150,
    textAlignVertical: 'top',
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
    fontSize: 14,
    fontWeight: 'bold',
    // marginBottom: 5,
  },
  button: {
    backgroundColor: '#fcd34d',
    padding: 12,
    marginTop: 10,
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

export default AddingProducts;
