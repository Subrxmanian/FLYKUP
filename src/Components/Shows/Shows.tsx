/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Import FontAwesome icons
import {Searchbar} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as Animatable from 'react-native-animatable';
import api from '../../Utils/Api';
import { generateSignedUrl } from '../../Utils/aws';
import Header from '../SellerComponents/Header';
import { AddressSelection } from './AddressSelection';


function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuerry, setSearchQuerry] = useState('');
  const navigation = useNavigation();

  const renderShow = ({item}) => {
    return (
      <View style={styles.showCard}>
        <Image source={{uri: item.thumbnailImage}} style={styles.thumbnail} />
        <View
          style={{
            flexDirection: 'row',
            position: 'absolute',
            gap: 50,
            left:10,
            alignItems:'center',
            top: 10,
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 1,
              height:20,
              backgroundColor: 'red',
              color: 'white',
            }}>
            Live
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderWidth:1,
              borderColor:'#ccc',
              borderRadius: 20,
              alignItems: 'center',
              padding: 5,
            }}>
            <Feather name="bookmark" size={26} />
          </TouchableOpacity>
        </View>
        <View style={styles.showContent}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.detailsRow}>
            <AntDesign name='piechart' />
          <Text style={styles.category}>{item.category}</Text>
          </View>
         
          <View style={[styles.detailsRow, {justifyContent: 'space-evenly'}]}>
            <View style={styles.detailsRow}>
              <Icon name="thumbs-up" size={14} color="#555" />
              <Text style={styles.likes}> {item.likes}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Icon name="language" size={14} color="#555" />
              <Text style={styles.language}> {item.language}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Icon name="clock-o" size={14} color="#555" />
              <Text style={styles.time}> {item.time}</Text>
            </View>
          </View>
          <View style={styles.selectedTagsContainer}>
            {item?.tags.length > 0 ? (
              item?.tags.map((tag, index) => (
                <Text key={index} style={styles.selectedTags}>
                  {tag}
                </Text>
              ))
            ) : (
              <Text style={styles.noTags}>No Tags</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => {
              // console.log("Navigate to stream URL: ", item.streamUrl);
              navigation.navigate('LiveScreen',{stream:item});
            }}>
            <Icon name="play" color="white" size={17} />
            <Text style={styles.watchButtonText}>Watch Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  useFocusEffect(
    React.useCallback(() => {
      const fetchShows = async () => {
        setLoading(true);
        try {
          // const response = await api.get('/shows/live');
          // const response = await api.get('/live/shows/get');
          const response = await api.get('/live/shows');
          // console.log(response.data)

            // console.log(await generateSignedUrl('LiveStreamThumbnails/e3816756-11b5-45fa-9059-e202b7854340_2023_Nikon_D90_(1).jpg'))
          const updatedVideos = await Promise.all(
            response.data.data.map(async (product) => {
              try {
                let updatedProduct = { ...product };

                if (product.thumbnailImage) {
                  try {
                    const signedUrl = await generateSignedUrl(product.thumbnailImage);
                    updatedProduct.thumbnailImage = signedUrl;
                  } catch (err) {
                    console.error('Error generating signed video URL:', err);
                    updatedProduct.thumbnailImage = product.thumbnailImage; // Fallback to original URL
                  }
                }

                return updatedProduct;
              } catch (err) {
                console.error('Error processing product:', err);
                return product; // Return original product if processing fails
              }
            }),
          );

          setShows(updatedVideos);
        } catch (error) {
          console.log('Error while fetching shows:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchShows();
    }, [])
  );

  return (
    <>
      <Header />
      <View style={styles.container}>
        {loading ? (
          <View style={{justifyContent:'center',flex:1}}>
          <ActivityIndicator size="large" color="black" />
          </View>
        ) : (
          <FlatList
            data={shows}
            renderItem={renderShow}
            ListHeaderComponent={
              <Searchbar
                value={searchQuerry}
                onChangeText={setSearchQuerry}
                placeholder="search"
              // onIconPress={}
              // elevation={3}
                style={styles.searchBar}
              />
            }
            ListEmptyComponent={<View style={{marginTop:100,justifyContent:'center',flex:1}}>
                 <Animatable.View
              animation={'pulse'}
              iterationCount="infinite"
              style={{alignItems:'center',gap:10}}>
              <MaterialCommunityIcons name='progress-clock' size={25} color='#777'/>
              <Text style={{fontSize:16,color:'#777'}}>No Shows Found</Text>
              </Animatable.View>
              </View>}
            keyExtractor={item => item._id}
          />
        )}
      </View>
      {/* <View style={{height:300}}>
      <AddressSelection/>
      </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#ECECEC',
    borderWidth:1,
    borderColor:'#ccc',
    // elevation:3,
    height:55,

    color:'black'
  },
  showCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 180,
    resizeMode: 'contain',
    // borderRadius: 60,
    marginRight: 15,
  },
  showContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#777',
    marginVertical: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:5,
    marginBottom: 5,
  },
  language: {
    fontSize: 12,
    color: '#555',

  },
  time: {
    fontSize: 12,
    color: '#555',
  },
  likes: {
    fontSize: 12,
    color: '#555',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  selectedTags: {
    color: '#777',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  noTags: {
    fontSize: 12,
    color: '#aaa',
  },
  watchButton: {
    backgroundColor: '#333',
    borderRadius: 5,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  watchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Shows;
