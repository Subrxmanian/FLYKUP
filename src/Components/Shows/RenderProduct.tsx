import React from 'react'
import api from '../../Utils/Api'
import { FlatList, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-gesture-handler'
import { Image } from 'react-native-animatable'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation} from '@react-navigation/native';

const RenderProduct= ({products,productId})=>{
    const Navigaiton =useNavigation()
      const renderProduct = ({item: selectedProduct}) => {
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

}


export default RenderProduct
