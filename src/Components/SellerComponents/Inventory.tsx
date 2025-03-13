/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import api from '../../Utils/Api';
import {useNavigation} from '@react-navigation/native';
import Header from './Header';

const InventoryDetailsScreen = () => {
  const [products, setProducts] = useState([]); // Array to store multiple products
  const [loading, setLoading] = useState(false);
  const Navigation = useNavigation();
  const [ismodalvisible, setmodalVisible] = useState(false);
  const [HistoryDetails, sethistorydetails] = useState([]);

  const handleUpdate = productId => {
    Navigation.navigate('AddInventory', {id: productId});
  };
  const getHistoryDetails = async _id => {
    setmodalVisible(true);
    try {
      const response = await api.get(`/history/inventory/${_id}`);
      sethistorydetails(response.data.data);
    } catch (error) {
      console.log('Error getting history', error);
    } finally {
      setLoading(false);
      // setmodalVisible(false)
    }
  };
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const id = (await AsyncStorage.getItem('sellerId')) || '';
        // console.log(id)
        const productResponse = await api.get(
          `/seller/inventory/by-seller/${id}`,
        );
        setProducts(productResponse.data.data);
      } catch (err) {
        console.log('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const renderItem = ({item}) => (
    <View style={styles.cardStyle}>
      <View style={styles.historyRow}>
        <Text style={styles.heading}>Date</Text>
        <Text style={[styles.heading, {color: 'black'}]}>
          {new Date(item.date).toLocaleDateString() || 'N/A'}
        </Text>
      </View>
      <View style={styles.historyRow}>
        <Text style={styles.heading}>Size</Text>
        <Text style={[styles.heading, {color: 'black'}]}>
          {item.size || 'N/A'}
        </Text>
      </View>
      <View style={styles.historyRow}>
        <Text style={styles.heading}>Color</Text>
        <Text
          style={[
            styles.heading,
            {
              color: 'white',
              width: 100,
              borderRadius: 10,
              fontSize: 13,
              backgroundColor: item.color,
            },
          ]}
        />
      </View>
      <View style={styles.historyRow}>
        <Text style={styles.heading}>Quantity</Text>
        <Text style={[styles.heading, {color: 'black'}]}>
          {item.quantity || 'N/A'}
        </Text>
      </View>
    </View>
  );

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
<Header/>
      <ScrollView style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => Navigation.goBack()}>
            <AntDesign name="left" size={25} color="black" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View> */}
        <Text style={styles.headerText}>Inventory Details</Text>

        <TouchableOpacity
          onPress={() => Navigation.navigate('AddInventory' as never)}
          style={styles.addButton}>
          <AntDesign name="plus" size={20} />
          <Text style={{fontWeight: 'bold', fontSize: 16}}>Add Items</Text>
        </TouchableOpacity>

        {/* Products List */}
        {products.length === 0 ? (
          <View style={styles.noProductsContainer}>
            <Text>No products available In Inventory</Text>
          </View>
        ) : (
          products.map(selectedProduct => (
            <View key={selectedProduct._id} style={styles.productCard}>
              <Text style={styles.productTitle}>
                {selectedProduct?.inventoryName}
              </Text>
              <Text style={styles.productDescription}>
                {selectedProduct?.description}
              </Text>
              <Text style={styles.productExpiryDate}>
                Expiry Date: {selectedProduct.expiryDate}
              </Text>
              <Text style={styles.productQuantity}>
                Total Quantity: {selectedProduct.totalQuantity}
              </Text>

              {/* Inventory Details */}
              <View style={styles.inventoryItem}>
                {selectedProduct?.inventory?.map((inventoryItem, index) => (
                  <View key={inventoryItem._id}>
                    <Text style={styles.inventoryItemHeader}>
                      Inventory Item {index + 1}
                    </Text>

                    {/* Color and Quantity */}
                    {inventoryItem.size && inventoryItem.quantity ? (
                      <View
                        style={[
                          styles.inventoryRow,
                          {backgroundColor: inventoryItem.color},
                        ]}>
                        <Text style={styles.inventoryText}>
                          Size: {inventoryItem.size || 'N/A'}
                        </Text>
                        <Text style={styles.inventoryText}>
                          Quantity: {inventoryItem.quantity}
                        </Text>
                      </View>
                    ) : null}
                    {inventoryItem.color ? (
                      <>
                        <Text style={[styles.inventoryText, {margin: 10}]}>
                          Color:
                        </Text>
                        <View
                          style={[
                            styles.inventoryRow,
                            {
                              backgroundColor: inventoryItem.color,
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                          ]}>
                          <Text
                            style={[styles.inventoryText, {color: 'white'}]}>
                            {/* {inventoryItem.color || 'N/A'} */}
                          </Text>
                        </View>
                        <Text style={styles.inventoryText}>
                          Quantity: {inventoryItem.quantity}
                        </Text>
                      </>
                    ) : null}

                    {/* Display Sizes if Available */}
                    {inventoryItem.sizes && inventoryItem.sizes.length > 0 && (
                      <View style={styles.sizeQuantityContainer}>
                        <Text style={styles.inventoryText}>
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
                    )}
                  </View>
                ))}
              </View>

              {/* Update Button */}
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => handleUpdate(selectedProduct._id)}>
                  <Text style={styles.updateButtonText}>Update </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, {backgroundColor: '#fbdd74'}]}
                  onPress={() => getHistoryDetails(selectedProduct._id)}>
                  <FontAwesome name="history" size={20} />
                  <Text
                    style={[
                      styles.updateButtonText,
                      {color: 'black', fontWeight: '700'},
                    ]}>
                    History
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={ismodalvisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setmodalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}>
                history
              </Text>
              <TouchableOpacity
                style={{alignSelf: 'flex-end'}}
                onPress={() => setmodalVisible(false)}>
                <AntDesign name="close" size={25} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalButtons]}>
              <TouchableOpacity style={styles.modelbutton}>
                <Text style={styles.modelbuttonText}>Total Quantity</Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#1b1233',
                    fontWeight: '700',
                  }}>
                  {HistoryDetails?.totalQuantity || 'N/A'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modelbutton}>
                <Text style={styles.modelbuttonText}>Available Quantity</Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#1b1233',
                    fontWeight: '700',
                  }}>
                  {HistoryDetails?.availableQuantity || 'N/A'}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              style={{width: '100%', height: 200}}
              contentContainerStyle={{paddingBottom: 20}}
              data={
                Array.isArray(HistoryDetails?.history)
                  ? HistoryDetails.history
                  : []
              }
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                <Text style={{textAlign: 'center', marginTop: 20}}>
                  No History Details Available
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    width: '100%',
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // for Android shadow effect
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    // textTransform:'uppercase',
    fontSize: 16,
    paddingVertical: 4,

    // color: 'white',
  },
  modelbuttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0f646f',
    fontSize: 16,
  },
  modelbutton: {
    backgroundColor: '#f4fcfe',
    borderRadius: 10,
    // borderWidth: 1,
    elevation: 3,
    // borderColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
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
    width: '93%',
    alignItems: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
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
    marginTop:10,
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
    // marginTop: 10,
  },
  inventoryItemHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004c8c',
    // marginBottom: 10,
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
    flexDirection: 'row',
    gap: 10,
    elevation: 5,
    borderRadius: 8,
    paddingHorizontal: 40,
    marginTop: 15,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InventoryDetailsScreen;
