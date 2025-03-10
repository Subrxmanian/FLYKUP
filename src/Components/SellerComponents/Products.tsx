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
import Fontisto from 'react-native-vector-icons/Fontisto';
import Header from './Header';
import {generateSignedUrl} from '../../Utils/aws';
import * as Animatable from 'react-native-animatable';
const ProductDetailsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const Navigation = useNavigation();


    const fetchProducts = async () => {
      setLoading(true);
      try {
        const id = (await AsyncStorage.getItem('sellerId')) || '';
        const productResponse = await api.get(`/product/listing/seller/${id}`);
        setProducts(productResponse.data.data);
      } catch (err) {
        console.log('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
      return () => {
             
      };
    }, [])
  );
  const renderProduct = ({item: selectedProduct}) => {
    // Assuming the images are in a format like ["imagekey1", "imagekey2"]
    const imageKeys = selectedProduct.images || []; // Make sure it is an array
    const imageUrls = imageKeys.map(key => generateSignedUrl(key)); // Generate URLs for each key
    // console.log(selectedProduct)
    return (
      <View key={selectedProduct._id} style={styles.productCard}>
        {/* Only show one edit button */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={styles.productTitle}>{selectedProduct?.title}</Text>
          <Animatable.View animation={'swing'} iterationCount={10} >
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              Navigation.navigate('ProductUploadForm', {
                data: selectedProduct
              })
            }>
            <AntDesign name="edit" size={20} />
          </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Render images */}
        <FlatList
          data={imageUrls} // Now using the generated URLs
          horizontal
          renderItem={({item}) => (
            <Image
              source={{uri: item}}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />

        <Text style={styles.productDescription}>
          {selectedProduct?.description}
        </Text>
        <View style={{flexDirection: 'row', gap: 10}}>
          <View style={styles.row}>
            <AntDesign name="dropbox" color="#4f46e5" size={20} />
            <Text style={styles.productQuantity}>
              Quantity: {selectedProduct.quantity}
            </Text>
          </View>
          <View style={styles.row}>
            <AntDesign name="slack" color="#92400e" size={20} />
            <Text style={styles.productQuantity}>
              Weight: {selectedProduct.weight}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <AntDesign name="piechart" color="#dc2626" size={20} />
          <Text style={styles.productExpiryDate}>
            {selectedProduct.category} {selectedProduct.subcategory}
          </Text>
        </View>
        <Text style={{textAlign: 'right', color: '#ccc'}}>
          {new Date(selectedProduct.createdAt).toLocaleTimeString()}
        </Text>
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
      <Animatable.View animation={'slideInDown'} iterationCount={1}>
        <Header />
      </Animatable.View>
      {/* <View style={styles.container}> */}

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={renderProduct}
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                gap: 10,
                marginTop: 10,
              }}>
              <Animatable.View
                animation={'bounce'}
                iterationCount={10}
                style={{}}>
                <Fontisto name="shopping-bag" size={25} />
              </Animatable.View>
              <Text style={styles.headerText}>Product Details</Text>
            </View>

            <TouchableOpacity
              onPress={() => Navigation.navigate('ProductUploadForm')}
              style={styles.addButton}>
              <Animatable.View animation={'swing'} iterationCount={'infinite'}>
                <AntDesign name="plus" size={20} />
              </Animatable.View>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>Add Items</Text>
            </TouchableOpacity>
          </>
        }
        contentContainerStyle={styles.container}
        // inverted
        scrollEnabled
        ListEmptyComponent={
          <View style={styles.noProductsContainer}>
            <Animatable.View animation={'shake'} iterationCount={1}>
            <Fontisto name="shopping-basket-add" size={35} color='#ccc' />
            </Animatable.View>
            <Text style={{textAlign: 'center',color:'#ccc'}}>
              Your inventory is currently empty. Select items from the inventory
              to add them to your product list.
            </Text>
          </View>
        }
      />
      {/* </View> */}
    </>
  );
};

const styles = StyleSheet.create({
  editButton: {
    backgroundColor: '#fbdd74',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 10,
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
    // padding:10,marginBottom:200
    // flex:1
  },
  headerText: {
    color: '#374151',
    fontSize: 24,
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
