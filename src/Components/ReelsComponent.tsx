import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet, 
  FlatList, 
  Animated 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';
import api from '../Utils/Api';
// import { generateSignedUrl } from '../Utils/aws';
import AntDesign from 'react-native-vector-icons/AntDesign';

import RBSheet from 'react-native-raw-bottom-sheet';

const { width, height } = Dimensions.get('window');


// Reels Screen Component
const ReelsScreen = () => {
  const [reelsData, setReelsData] = useState([]); // State to store fetched data
  const [activeIndex, setActiveIndex] = useState(0); // Active index for the current video
  const scrollY = useRef(new Animated.Value(0)).current;
  const [mute,setmute]=useState(false)
  // Sample data for stories and recently watched
  const refRBSheet = useRef();
  // Component for each Reel item
  // eslint-disable-next-line react/no-unstable-nested-components
  const ReelItem =  ({ item, index, activeIndex, handleLike }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(item.likes);
    const [videoUrl, setVideoUrl] = useState(''); // New state for video URL
  
    // Handle like press
    const handleLikePress = () => {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      handleLike(index, liked ? -1 : 1);  // Update global like count
    };
  
    // Fetch video URL asynchronously
    const getImage = async () => {
      try {
        // const signedUrl = await generateSignedUrl(item.videoUrl);
        return ''
      } catch (error) {
        console.log('Error generating signed URL:', error);
        return ''; // Return empty string on error
      }
    };
  
    // Use effect to fetch the video URL once the component is mounted
    useEffect(() => {
      const fetchVideoUrl = async () => {
        const url = await getImage();
        setVideoUrl(url); // Update the state with the fetched URL
      };
  
      fetchVideoUrl();
    }, [item.videoUrl]); // Re-fetch when the `item.videoUrl` changes
  
    return (
      <View style={styles.reelContainer}>
        <Video
          source={videoUrl ? { uri: videoUrl } : null} // Use the video URL only if it's available
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          paused={activeIndex !== index} // Pause the video if it's not the active one
          muted={mute}
        />
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLikePress}
            >
              <Icon 
                name={liked ? 'heart' : 'heart'} 
                color={liked ? 'red' : 'white'} 
                size={24}
              />
              <Text style={styles.actionText}>{likes}</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="message-circle" color="white" size={24} />
              <Text style={styles.actionText}>{100}</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share-2" color="white" size={24} />
            </TouchableOpacity>
          </View>
        
        <View style={styles.overlayContent}>
        <TouchableOpacity style={styles.BuyButton} onPress={() => refRBSheet.current.open()}>
            <Text style={{fontSize:20,color:'white'}}>Buy Now</Text>
            <AntDesign name="right" color="white" size={25}/>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.productName}</Text>
          </View>
          <Text style={styles.description}>
            {item.description}
          </Text>
        
        </View>
      </View>
    );
  };
  
  
  useEffect(() => {
    // Fetching data from API
    const fetchReelsData = async () => {
      try {
        const response = await api.get(`/seller/product/all`);
        setReelsData(response.data.data); 
      } catch (error) {
        console.log('Error fetching reels data:', error);
      }
    };

    fetchReelsData();
  }, []);

  // Handle Like press to update global state
  const handleLike = (index, likeChange) => {
    setReelsData(prevData => {
      const updatedData = [...prevData];
      updatedData[index].likes += likeChange; // Update the like count for the specific reel
      return updatedData;
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Action Buttons */}
       <RBSheet
            dragOnContent={true}
            draggable={true}
             ref={refRBSheet}
             height={500}
            ><Text>This is works</Text>
            </RBSheet>
      <View style={styles.topActionButtons}>
        <TouchableOpacity style={styles.topActionButton}>
          <Icon name="search" color="white" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topActionButton} onPress={()=>setmute(!mute)}>
          <Icon name="camera" color="white" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topActionButton}>
          <Icon name="user" color="white" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reelsData}
        renderItem={({ item, index }) => (
          <ReelItem 
            item={item} 
            index={index} 
            activeIndex={activeIndex} 
            handleLike={handleLike} 
          />
        )}
        keyExtractor={(item) => item._id}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={height}
        vertical
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const contentOffsetY = e.nativeEvent.contentOffset.y;
          const index = Math.floor(contentOffsetY / height);
          setActiveIndex(index); // Set the active index based on scroll
        }}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  topActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topActionButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  BuyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'green',
    width: '90%',
    marginBottom: 10,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  reelContainer: {
    width,
    height,
    position: 'relative',
  },
  video: {
    width,
    height: '80%',
    backgroundColor: '#333',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    bottom: 100,
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  actionText: {
    color: 'white',
    marginTop: 5,
  },
  description: {
    color: 'white',
    marginTop: 10,
  },
});

export default ReelsScreen;
