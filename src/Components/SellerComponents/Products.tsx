import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import api from '../../Utils/Api';
import {useNavigation} from '@react-navigation/native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {generateSignedUrl} from '../../Utils/aws';

import Video from 'react-native-video';
const ProductDetailsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const Navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const id = (await AsyncStorage.getItem('sellerId')) || '';
        const productResponse = await api.get(
          `/seller/product/by-seller/${id}`,
        );
        // console.log(productResponse.data.data)
        setProducts(productResponse.data.data);
      } catch (err) {
        console.log('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = {};
      for (const product of products) {
        const url = await generateSignedUrl(product.photoUrl);
        urls[product._id] = url || '';
      }
      setImageUrls(urls);
    };

    if (products.length > 0) {
      fetchImageUrls();
    }
  }, [products]);
  const [url, setUrl] = useState('');

  const renderProduct = ({ item: selectedProduct }) => {
    const url = imageUrls[selectedProduct._id];

    return (
      <View key={selectedProduct._id} style={styles.productCard}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Navigation.navigate('ProductUploadForm', { id: selectedProduct._id })}>
          <FontAwesome name="edit" size={20} />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Text style={styles.productTitle}>{selectedProduct?.productName}</Text>
        </View>
        <Text style={styles.productDescription}>{selectedProduct?.description}</Text>
        <Image source={{ uri: url }} style={styles.productImage} />
        {/* Price Section */}
        <View style={styles.productPriceContainer}>
          <Text style={styles.actualPrice}>Actual Price: ₹{selectedProduct?.actualPrice}</Text>
          <Text style={styles.sellingPrice}>Selling Price: ₹{selectedProduct?.sellingPrice}</Text>
        </View>
        <Text style={styles.productQuantity}>Total Quantity: {selectedProduct.totalQuantity}</Text>
        <Text style={styles.productExpiryDate}>Category: {selectedProduct.category} {selectedProduct.subCategory}</Text>
        
        {/* Inventory Details */}
        <View style={styles.inventoryItem}>
          {selectedProduct?.inventory?.map((inventoryItem, index) => (
            <View key={inventoryItem._id}>
              <Text style={styles.inventoryItemHeader}>Inventory Item {index + 1}</Text>

              <View style={[styles.inventoryRow, { backgroundColor: inventoryItem.color }]}>
                <Text style={styles.inventoryText}>Size: {inventoryItem.size || 'N/A'}</Text>
                <Text style={styles.inventoryText}>Quantity: {inventoryItem.quantity}</Text>
              </View>

              {inventoryItem.sizes && inventoryItem.sizes.length > 0 && (
                <View style={styles.sizeQuantityContainer}>
                  <Text style={styles.inventoryText}>Sizes and Quantities:</Text>
                  {inventoryItem.sizes.map((sizeItem, idx) => (
                    <View key={idx} style={styles.sizeQuantityRow}>
                      <Text style={styles.inventoryText}>Size: {sizeItem.size}</Text>
                      <Text style={styles.inventoryText}>Quantity: {sizeItem.quantity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => Navigation.goBack()}>
          <AntDesign name="left" size={25} color="black" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerText}>Product Details</Text>

      <TouchableOpacity
        onPress={() => Navigation.navigate('ProductUploadForm')}
        style={styles.addButton}>
        <AntDesign name="plus" size={20} />
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add Items</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.noProductsContainer}>
            <Fontisto name="shopping-basket-add" size={35} />
            <Text style={{ textAlign: 'center' }}>
              Your inventory is currently empty. Select items from the inventory
              to add them to your product list.
            </Text>
          </View>
        }
      />
    </>
  );

};

// Styles
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#fbdd74',
    // borderWidth:1,
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 20,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 7,
    gap: 10,
    marginTop: 10,
    marginRight: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fbdd74',
  },
  noProductsContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 20,
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
    // flex: 1,
    // height:'100%',
    // backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    color: '#374151',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  productImage: {
    // width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    lineHeight: 20,
    overflow: 'hidden',
  },
  productExpiryDate: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  productPriceContainer: {
    // flexDirection: 'row',
    marginBottom: 15,
    // alignItems: 'center',
  },
  actualPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red', // Gray for the actual price (striked out)
    textDecorationLine: 'line-through', // Strike-through effect
    marginRight: 10, // Space between actual and selling price
  },
  sellingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green', // Highlighted red for the selling price
  },
  productQuantity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  inventoryItem: {
    marginTop: 10,
  },
  inventoryItemHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004c8c',
  },
  inventoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  inventoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sizeQuantityContainer: {
    marginTop: 10,
    paddingLeft: 10,
  },
  sizeQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  updateButton: {
    backgroundColor: '#004c8c',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;
