import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share } from 'react-native';
import Video from 'react-native-video';


const Reel = ({ videoSource, thumbnail, onLike }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleVideoPress = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(isLiked);
    }
  };

  const handleSharePress = () => {
    Share.open({
      title: 'Share this reel',
      message: 'Check out this cool video!',
      url: videoSource,
    });
  };

  return (
    <View style={styles.reelContainer}>
      {/* Video Background with Thumbnail */}
      {!isPlaying && (
        <TouchableOpacity onPress={handleVideoPress}>
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        </TouchableOpacity>
      )}

      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoSource }}
        style={styles.video}
        paused={!isPlaying}
        resizeMode="cover"
        onBuffer={(data) => console.log('Buffering:', data)}
        onLoad={() => console.log('Video Loaded')}
        onError={(error) => console.log('Video Error:', error)}
        repeat
        playInBackground={false}
        playWhenInactive={false}
        progressUpdateInterval={250.0} // Optional: updates progress every 250 ms
      />

      {/* Like and Share Buttons */}
      <View style={styles.overlayButtons}>
        <TouchableOpacity style={styles.button} onPress={handleLikePress}>
          <Text style={styles.buttonText}>{isLiked ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSharePress}>
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayButtons: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Reel;
