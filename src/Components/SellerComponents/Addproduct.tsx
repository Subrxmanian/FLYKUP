/* eslint-disable react-native/no-inline-styles */
import React, {act, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation, useRoute} from '@react-navigation/native';
import api from '../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateSignedUrl,
  uploadImageToS3,
  uploadVideoToS3,
} from '../../Utils/aws';

const ProductUploadForm = () => {
  const [selectedProduct, setSelectedProduct] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setloading] = useState(false);
  const [products, setProducts] = useState([{inventoryName: 'No Data Found'}]);
  const [sellingPrice, setSellingPrice] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const Navigation = useNavigation();
  const route = useRoute();
  const {id} =
    (route.params as {
      id: string;
    }) || '';
  const [categories, setCategories] = useState([
    {categoryName: 'No Data Found'},
  ]);
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoDurationError, setVideoDurationError] = useState('');
  const [priceError, setPriceError] = useState('');

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
        setImage(response.assets[0].uri);
        console.log(image, 'ProductImage');
        const url =
          (await uploadImageToS3(response.assets[0].uri, 'ProductImage')) || '';
        setImageUrl(url);
        setloading(false);
        // console.log()
      } else if (type === 'video') {
        setVideo(response.assets[0].uri);
        const videoDuration = response.assets[0].duration; // Duration in seconds
        if (videoDuration > 30) {
          setVideoDurationError('Video duration should be under 30 seconds.');
        } else {
          setloading(true);
          const url =
            (await uploadVideoToS3(response.assets[0].uri, 'ProductVideo')) ||
            '';
          setVideoUrl(url);
          setloading(false);
          setVideoDurationError('');
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!id) {
      if (!/^\d+$/.test(actualPrice) || !/^\d+$/.test(sellingPrice)) {
        setPriceError('Prices should contain only numbers.');
        return;
      } else if (parseInt(sellingPrice) > parseInt(actualPrice)) {
        setPriceError('Selling price cannot be higher than the actual price.');
        return;
      } else {
        setPriceError('');
      }
      if (
        !selectedProduct ||
        !selectedCategory ||
        !imageUrl ||
        !videoUrl ||
        !selectedSubCategory
      ) {
        ToastAndroid.show(
          'Please complete all fields before submitting.',
          ToastAndroid.SHORT,
        );
        return;
      }
    }
    if (!weight && !measurement) {
      ToastAndroid.show(
        'Fill the Weight and measurement details',
        ToastAndroid.SHORT,
      );
      return;
    }
    // Price validation

    setloading(true);
    try {
      const id1 = (await AsyncStorage.getItem('sellerId')) || '';
      if (!id) {
        const response = await api.post(`/seller/product/add`, {
          sellerInfo: id1,
          inventoryInfo: selectedProduct?._id,
          productName: selectedProduct?.inventoryName,
          description: selectedProduct?.description,
          category: selectedCategory,
          subCategory: selectedSubCategory,
          totalQuantity: selectedProduct?.totalQuantity,
          actualPrice: actualPrice,
          sellingPrice: sellingPrice,
          photoUrl: imageUrl,
          videoUrl: videoUrl,
          additionalInfo: selectedProduct?.inventory,
          productWeight: productWeight + measurement,
        });
      } else {
        const response = await api.put(`/seller/product/edit/${id}`, {
          sellerInfo: id1,
          inventoryInfo: selectedProduct?._id,
          productName: selectedProduct?.inventoryName,
          description: selectedProduct?.description,
          category: selectedCategory,
          subCategory: selectedSubCategory,
          totalQuantity: selectedProduct?.totalQuantity,
          actualPrice: actualPrice,
          sellingPrice: sellingPrice,
          photoUrl: imageUrl,
          videoUrl: videoUrl,
          additionalInfo: selectedProduct?.inventory,
          productWeight: productWeight + measurement,
        });
      }
      Navigation.navigate('Products' as never);
      ToastAndroid.show('successfully Product Added. ', ToastAndroid.SHORT);
    } catch (err) {
      console.log('Error adding product', err);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setloading(true);

      try {
        const id = await AsyncStorage.getItem('sellerId');
        // console.log('seeler ID', id);

        if (id) {
          const categoryResponse = await api.get('/categories/get');
          // const allProduct = await api.get('/seller/product/all');

          const productResponse = await api.get(
            `/seller/inventory/by-seller/${id}`,
          );
          const products = productResponse.data.data;
          const filteredProducts = products.filter(
            product => !product.isProductListed,
          );

          setCategories(categoryResponse.data);
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.log('Failed to fetch categories & products', err);
      } finally {
        setloading(false);
      }
    };

    fetchCategories();
  }, []);
  const weight = [
    {label: 'Kg', value: 'kg'},
    {label: 'Grams', value: 'grams'},
    {label: 'Pounds', value: 'pounds'},
  ];
  useEffect(() => {
    const fetchData = async () => {
      setloading(true);
      // console.log(new Date("2025-02-21").toLocaleDateString)
      try {
        // console.log("ids",id)
        if (id) {
          const response = await api.get(`/seller/product/by-id/${id}`);
          const data = response?.data?.data;
          
             if(data.inventoryInfo){
              const response = await api.get(`/seller/inventory/by-id/${data.inventoryInfo}`);              
          setSelectedProduct(response.data.data);
             }

          setActualPrice(data.actualPrice.toString());
          setSellingPrice(data.sellingPrice.toString());
          const photoUrl = (await generateSignedUrl(data.photoUrl)) || '';
          setImage(photoUrl);
          const videoUrl = (await generateSignedUrl(data.videoUrl)) || '';
          setVideo(videoUrl);
          setSelectedCategory(data.category);
          setSelectedSubCategory(data.subCategory);
          const productWeight = data.productWeight.replace(/[^\d.-]/g, '');
          setProductWeight(productWeight);
          const measurement = data.productWeight.replace(/[^a-zA-Z]/g, ''); // Keep only letters (a-z, A-Z)
          setMeasurement(measurement);
        }
        //  console.log(data)
      } catch (error) {
        console.log('error while fetching', error);
      } finally {
        setloading(false);
      }
    };
    fetchData();
  }, []);
  // console.log(selectedProduct)
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

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => Navigation.goBack()}>
          <AntDesign name="left" size={25} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Upload Product</Text>

        <ScrollView style={styles.scrollContainer}>
          {/* Product Dropdown */}
          <Text style={styles.label}>Select Product</Text>
          <Dropdown
            value={selectedProduct.inventoryName}
            data={products}
            onChange={item => setSelectedProduct(item)}
            labelField={'inventoryName'}
            valueField="inventoryName"
            placeholder="Choose a product"
            style={styles.dropdown}
          />
          {selectedProduct && selectedProduct.inventoryName && (
            <>
              <Text style={styles.productDetailsHeader}>Product Details</Text>

              <View style={styles.productInfo}>
                <Text style={styles.productLabel}>Product Name:</Text>
                <Text style={styles.productText}>
                  {selectedProduct?.inventoryName}
                </Text>
              </View>

              {selectedProduct?.description && (
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>Description:</Text>
                  <Text style={styles.productText}>
                    {selectedProduct.description}
                  </Text>
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productLabel}>Total Quantity:</Text>
                <Text style={styles.productText}>
                  {selectedProduct?.totalQuantity || '0'}
                </Text>
              </View>

              {selectedProduct.expiryDate && (
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>Expiry Date:</Text>
                  <Text style={styles.productText}>
                    {selectedProduct.expiryDate}
                  </Text>
                </View>
              )}
              {selectedProduct?.inventory?.length > 0 ? (
                <Text style={styles.inventoryHeader}>Inventory Details:</Text>
              ) : null}

              {selectedProduct?.inventory?.map((inventoryItem, index) => (
                <View key={inventoryItem._id} style={styles.inventoryItem}>
                  {inventoryItem.sizes && inventoryItem.sizes.length > 0 ? (
                    <>
                      <Text style={styles.inventoryLabel}>
                        Inventory Item {index + 1}
                      </Text>

                      {inventoryItem.color && (
                        <View
                          style={[
                            styles.inventoryRow,
                            {
                              backgroundColor: inventoryItem.color,
                              alignItems: 'center',
                            },
                          ]}>
                          <Text
                            style={[styles.inventoryText, {color: 'white'}]}>
                            Color: {inventoryItem.color}
                          </Text>
                        </View>
                      )}

                      <View style={styles.inventoryRow}>
                        <Text style={styles.inventoryLabel}>
                          Sizes and Quantities:
                        </Text>
                        {inventoryItem.sizes.map((sizeItem, idx) => (
                          <View key={idx} style={styles.sizeQuantityRow}>
                            <Text style={styles.inventoryText}>
                              Size: {sizeItem.size}
                            </Text>
                            <Text style={styles.inventoryText}>
                              Quantity: {sizeItem.quantity}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.inventoryLabel}>
                        Inventory Item {index + 1}
                      </Text>
                      {inventoryItem.size ? (
                        <View style={styles.sizeQuantityRow}>
                          <Text style={styles.inventoryText}>
                            Size: {inventoryItem.size}
                          </Text>
                          <Text style={styles.inventoryText}>
                            Quantity: {inventoryItem.quantity}
                          </Text>
                        </View>
                      ) : (
                       null
                      )}

                      {inventoryItem.color && (
                        <View
                          style={[
                            styles.inventoryRow,
                            {
                              backgroundColor: inventoryItem.color,
                              alignItems: 'center',
                            },
                          ]}>
                          <Text
                            style={[styles.inventoryText, {color: 'white'}]}>
                            Color: {inventoryItem.color}
                          </Text>
                          <Text
                            style={[styles.inventoryText, {color: 'white'}]}>
                            Quantity: {inventoryItem.quantity}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                  {inventoryItem.sizes && inventoryItem.sizes.length < 0 ? (
                    <View style={styles.productInfo}>
                      <Text style={styles.productLabel}>Total Quantity:</Text>
                      <Text style={styles.productText}>
                        {selectedProduct.totalQuantity}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </>
          )}
          {/* Price Input */}
          <Text style={styles.label}>Actual Price</Text>
          <TextInput
            style={styles.inputBox}
            value={actualPrice}
            keyboardType="numeric"
            placeholderTextColor={'#777'}
            placeholder="Actual Price"
            onChangeText={setActualPrice}
          />

          <Text style={styles.label}>Selling Price</Text>
          <TextInput
            style={styles.inputBox}
            value={sellingPrice}
            keyboardType="numeric"
            placeholderTextColor={'#777'}
            placeholder="Selling Price"
            onChangeText={setSellingPrice}
          />
          {priceError ? (
            <Text style={styles.errorText}>{priceError}</Text>
          ) : null}

          {/* Category and Subcategory */}
          <Text style={styles.label}>Select Category</Text>
          <Dropdown
            value={selectedCategory}
            data={categories}
            onChange={item => setSelectedCategory(item.categoryName)}
            labelField="categoryName"
            valueField="categoryName"
            placeholder="Choose a category"
            style={styles.dropdown}
          />

          {selectedCategory && (
            <>
              <Text style={styles.label}>Select Subcategory</Text>
              <Dropdown
                value={selectedSubCategory}
                data={
                  categories.find(
                    category => category.categoryName === selectedCategory,
                  )?.subcategories || []
                }
                onChange={item => setSelectedSubCategory(item.name)}
                labelField="name"
                valueField="name"
                placeholder="Choose a subcategory"
                style={styles.dropdown}
              />
            </>
          )}

          {/* Image Upload */}
          <Text style={styles.label}>Upload Image</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectMedia('photo')}>
            <AntDesign name="upload" size={30} color="white" />
            <Text style={styles.uploadButtonText}>
              Click to upload product image (JPEG, JPG, PNG), size 200 X 200
            </Text>
          </TouchableOpacity>
          {image && <Image source={{uri: image}} style={styles.imagePreview} />}

          {/* Video Upload */}
          <Text style={styles.label}>Upload Video</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectMedia('video')}>
            <AntDesign name="upload" size={30} color="white" />
            <Text style={styles.uploadButtonText}>
              Click to upload product video (MP4, max 30 seconds)
            </Text>
          </TouchableOpacity>
          {video && (
            <>
              <Video
                source={{uri: video}}
                style={styles.videoPreview}
                resizeMode="cover"
                repeat={true}
                controls={true}
              />
              {videoDurationError ? (
                <Text style={styles.errorText}>{videoDurationError}</Text>
              ) : null}
            </>
          )}
          <Text style={styles.label}>Product Weight: </Text>
          <View
            style={{
              flexDirection: 'row',
              // justifyContent:'space-between',
              gap: 10,
            }}>
            <TextInput
              style={[styles.inputBox, {width: '40%'}]}
              value={productWeight}
              keyboardType="numeric"
              placeholderTextColor={'#777'}
              placeholder="Weight"
              onChangeText={setProductWeight}
            />
            <Dropdown
              value={measurement}
              data={weight}
              onChange={item => setMeasurement(item.value)}
              labelField="label"
              valueField="value"
              placeholder="Measurement"
              style={[styles.dropdown, {width: '45%'}]}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#777',
    height: 50,
    borderRadius: 10,
    padding: 10,
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    // marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 14,
  },
  productDetailsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  productInfo: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productText: {
    fontSize: 16,
    color: '#555',
  },
  inventoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inventoryItem: {
    marginBottom: 20,
  },
  inventoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inventoryRow: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  inventoryText: {
    fontSize: 16,
    color: '#555',
  },
  sizeQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: '#222',
    padding: 12,
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  videoPreview: {
    height: 200,
    width: '100%',
    backgroundColor: '#000',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#ffbe00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProductUploadForm;
