import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import api from '../../Utils/Api';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Header from './Header';
import {generateSignedUrl} from '../../Utils/aws';
import * as Animatable from 'react-native-animatable';
import { TextInput } from 'react-native-paper';
import moment from 'moment';

const ProductDetailsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Product');
  const [isEditing, setIsEditing] = useState({});
  const [quantity, setQuantity] = useState({});

  const Navigation = useNavigation();

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const id = (await AsyncStorage.getItem('sellerId')) || '';
      const productResponse = await api.get(`/product/listing/seller/${id}`);
      setProducts(productResponse.data.data);
      productResponse.data.data?.map((product)=>setQuantity((prev) => ({ ...prev, [product._id]: product.quantity })) )
      // 
    } catch (err) {
      console.log('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
      return () => {};
    }, [])
  );

  // Handle product rendering
  const renderProduct = ({ item: selectedProduct }) => {
    const imageKeys = selectedProduct.images || [];
    const imageUrls = imageKeys.map((key) => generateSignedUrl(key));

    return (
      <View key={selectedProduct._id} style={styles.productCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.productTitle}>{selectedProduct?.title}</Text>
          <Animatable.View animation={'swing'} iterationCount={10}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => Navigation.navigate('ProductUploadForm', { data: selectedProduct })}
            >
              <AntDesign name="edit" size={20} />
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <FlatList
          data={imageUrls}
          horizontal
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.productImage} resizeMode="cover" />
          )}
          keyExtractor={(item, index) => index.toString()}
        />

        <Text style={styles.productDescription}>{selectedProduct?.description}</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.row}>
            <AntDesign name="dropbox" color="#4f46e5" size={20} />
            <Text style={styles.productQuantity}>Quantity: {selectedProduct.quantity}</Text>
          </View>
          <View style={styles.row}>
            <AntDesign name="slack" color="#92400e" size={20} />
            <Text style={styles.productQuantity}>Weight: {selectedProduct.weight}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <AntDesign name="piechart" color="#dc2626" size={20} />
          <Text style={styles.productExpiryDate}>
            {selectedProduct.category} {selectedProduct.subcategory}
          </Text>
        </View>

    
<Text style={{ textAlign: 'right', color: '#ccc' }}>
  {moment(selectedProduct.createdAt).format('MMMM Do YYYY, h:mm a')}
</Text>

      </View>
    );
  };

  const renderStock = ({ item: selectedProduct }) => {
    const imageKeys = selectedProduct.images || [];
    const imageUrls = imageKeys.map((key) => generateSignedUrl(key));

    const handleSave = async (productId) => {
      try {
        // console.log(productId)
        await api.put(`/stock/${productId}`, {
          quantity: quantity[productId],
        });
        setIsEditing((prev) => ({ ...prev, [productId]: false }));
        fetchProducts();
        setQuantity((prev) => ({ ...prev, [productId]: '' })); 
       } catch (error) {
        console.log('Error saving product quantity:', error);
      }
    };

    return (
      <View key={selectedProduct._id} style={styles.productCard}>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <Image source={{ uri: imageUrls[0] }} style={styles.stockImage} resizeMode="cover" />
          <View>
            <Text style={styles.productTitle}>{selectedProduct?.title}</Text>
            {isEditing[selectedProduct._id] ? (
              <>
                <TextInput
                  mode="outlined"
                  keyboardType='numeric'
                  label="Quantity"
                  style={{ height: 40, marginBottom: 10 }}
                  value={quantity[selectedProduct._id]?.toString()}
                  onChangeText={(text) => setQuantity((prev) => ({ ...prev, [selectedProduct._id]: text }))}
                />
              </>
            ) : (
              <View style={styles.row}>
                <AntDesign name="dropbox" color="#4f46e5" size={20} />
                <Text style={styles.productQuantity}>Quantity: {selectedProduct.quantity}</Text>
              </View>
            )}

            <Animatable.View animation={'swing'} iterationCount={10}>
              {isEditing[selectedProduct._id] ? (
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: 'green' }]}
                  onPress={() => handleSave(selectedProduct._id)}
                >
                  <AntDesign name="save" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setIsEditing((prev) => ({ ...prev, [selectedProduct._id]: true }));
                  }}
                >
                  <AntDesign name="edit" size={20} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Edit</Text>
                </TouchableOpacity>
              )}
            </Animatable.View>
          </View>
        </View>

<Text style={{ textAlign: 'right', color: '#ccc' }}>
  {`Created ${moment(selectedProduct.createdAt).fromNow()}`}
</Text>
      </View>
    );
  };

  // console.log(quantity)
  return (
    <>
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <ActivityIndicator color="gray" size={20} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      )}

      <Animatable.View animation={'slideInDown'} iterationCount={1}>
        <Header />
      </Animatable.View>

      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={selectedTab === 'Product' ? renderProduct : renderStock}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 10, marginTop: 10 }}>
                <Animatable.View animation={'bounce'} iterationCount={10}>
                  <Fontisto name="shopping-bag" size={25} />
                </Animatable.View>
                <Text style={styles.headerText}>Product Listing</Text>
              </View>

              <View style={styles.tabContainer}>
                {['Product', 'Stock'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, selectedTab === tab && styles.selectedTab]}
                    onPress={() => setSelectedTab(tab)}
                  >
                    {tab === 'Stock' ? (
                      <Feather name="box" color={selectedTab === tab ? 'black' : 'gray'} size={20} />
                    ) : (
                      <AntDesign name="shoppingcart" color={selectedTab === tab ? 'black' : 'gray'} size={20} />
                    )}
                    <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => Navigation.navigate('ProductUploadForm')} style={styles.addButton}>
                <Animatable.View animation={'swing'} iterationCount={'infinite'}>
                  <AntDesign name="plus" size={20} />
                </Animatable.View>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add Items</Text>
              </TouchableOpacity>
            </>
          }
          scrollEnabled
          ListEmptyComponent={
            <View style={styles.noProductsContainer}>
              <Animatable.View animation={'shake'} iterationCount={1}>
                <Fontisto name="shopping-basket-add" size={35} color="#ccc" />
              </Animatable.View>
              <Text style={{ textAlign: 'center', color: '#ccc' }}>
                Your inventory is currently empty. Select items from the inventory to add them to your product list.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
};



const styles = StyleSheet.create({
  stockImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    // backgroundColor:'red'
  },
  tabContainer: {
    flexDirection: 'row',
    width: '60%',
    marginTop: 10,
    alignItems: 'center',
    marginLeft: 10,
    paddingVertical: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    backgroundColor: '#f3f4f6',
    // borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    // width: '50%',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    // marginBottom: 10,
  },
  selectedTab: {
    backgroundColor: '#fbdd74',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  selectedTabText: {
    color: 'black',
  },
  editButton: {
    backgroundColor: '#fbdd74',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    // padding: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 10,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 7,
    elevation: 5,
    gap: 10,
    marginTop: 10,
    marginRight: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fbdd74',
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
    backgroundColor: '#fff',
    // padding:10,
    paddingBottom:50
    // marginBottom:100
    // padding:10
    // flex:1
  },
  headerText: {
    color: '#374151',
    fontSize: 22,
    fontWeight: '600',
    // marginTop: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  productCard: {
    backgroundColor: '#fffbeb',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  productImage: {
    height: 150,
    borderRadius: 20,
    marginBottom: 10,
    width: 300,
    marginRight: 10, // space between images if multiple
  },
  productTitle: {
    fontSize: 20,
    // textAlign:'left',
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    lineHeight: 20,
  },
  productQuantity: {
    fontSize: 14,
    color: '#333',
    // marginBottom: 15,
  },
  productExpiryDate: {
    fontSize: 16,
    // textAlign:'center',
    width: '90%',
    color: '#555',
    marginBottom: 12,
  },
  noProductsContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 20,
  },
});

export default ProductDetailsScreen;
