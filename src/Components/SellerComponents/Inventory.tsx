import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import api from '../../Utils/Api';
import { useNavigation } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const [products, setProducts] = useState([]); // Array to store multiple products
  const [loading, setLoading] = useState(false);
  const Navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const id = (await AsyncStorage.getItem('sellerId')) || '';
        const productResponse = await api.get(`/seller/inventory/by-seller/${id}`);
        setProducts(productResponse.data.data);
      } catch (err) {
        console.log('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleUpdate = (productId) => {
    // Navigate to update screen for the selected product
    Navigation.navigate('UpdateProductScreen', { productId });
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

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => Navigation.goBack()}>
            <AntDesign name="left" size={25} color="black" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
        </View>
        <Text style={styles.headerText}>Product Details</Text>

        {/* Products List */}
        {products.length === 0 ? (
  <View style={styles.noProductsContainer}>
    <Text>No products available In Inventory</Text>
  </View>
) : (
  products.map((selectedProduct) => (
    <View key={selectedProduct._id} style={styles.productCard}>
      <Text style={styles.productTitle}>{selectedProduct?.inventoryName}</Text>
      <Text style={styles.productDescription}>{selectedProduct?.description}</Text>
      <Text style={styles.productExpiryDate}>
        Expiry Date: {new Date(selectedProduct.expiryDate).toLocaleDateString()}
      </Text>
      <Text style={styles.productQuantity}>Total Quantity: {selectedProduct.totalQuantity}</Text>

      {/* Inventory Details */}
      <View style={styles.inventoryItem}>
        {selectedProduct?.inventory?.map((inventoryItem, index) => (
          <View key={inventoryItem._id}>
            <Text style={styles.inventoryItemHeader}>Inventory Item {index + 1}</Text>

            {/* Color and Quantity */}
            <View style={[styles.inventoryRow, { backgroundColor: inventoryItem.color }]}>
              <Text style={styles.inventoryText}>Size: {inventoryItem.size || 'N/A'}</Text>
              <Text style={styles.inventoryText}>Quantity: {inventoryItem.quantity}</Text>
            </View>

            {/* Display Sizes if Available */}
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

      {/* Update Button */}
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => handleUpdate(selectedProduct._id)}
      >
        <Text style={styles.updateButtonText}>Update Product</Text>
      </TouchableOpacity>
    </View>
  ))
)}

      </ScrollView>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  noProductsContainer:{
    marginTop:100,
    justifyContent:'center',
    alignItems:'center'
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
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '',
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
    textAlign:'center',
    textTransform:"uppercase"
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    marginTop:10,
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  productExpiryDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
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
    marginBottom: 10,
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
