import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example of using vector icons
import {socketurl} from '../../../Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../Utils/Api';
import ConfettiCannon from 'react-native-confetti-cannon'; // For confetti explosion

const AuctionsOverlay = ({streamId, currentAuction}) => {
  const countdownRef = useRef(null); // Store interval reference
  const [isActive, setIsActive] = useState(currentAuction?.isActive || false);
  const [isAuctionStarted, setIsAuctionStarted] = useState(false);
  const [user, setUser] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [nextBids, setNextBids] = useState([]);
  const [bidderWon, setBidderWon] = useState(null);
  const [timer, setTimer] = useState(0); // auction time
  const [startingBid, setStartingBid] = useState(0);
  const [bidHistory, setBidHistory] = useState([]);
  const [uniqueStreamId, setUniqueStreamId] = useState(null);
  const SOCKET_URL = socketurl;

  useEffect(() => {
    setHighestBid(currentAuction?.currentHighestBid || 0);
    setHighestBidder(currentAuction?.highestBidder || null);
    setNextBids([currentAuction?.nextBid1, currentAuction?.nextBid2] || []);
    setIsActive(currentAuction?.isActive || false);
    setBidderWon(currentAuction?.bidderWon || null);
  }, [currentAuction]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id =await AsyncStorage.getItem('userId');
        const response = await api.get(`/user/id/${id}`);
        setUser(response.data.data);
        // console.log(user)
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'], // WebSocket transport
    });

    socket.emit('joinRoom', streamId);

    socket.on('auctionStarted', data => {
      setHighestBid(data.startingBid);
      setIsAuctionStarted(true);
      setIsActive(true);
      setUniqueStreamId(data.uniqueStreamId);

      const remainingTime = Math.max(0, data.endsAt - Date.now());
      setTimer(remainingTime);

      const increment =
        data.increment ?? Math.max(500, Math.floor(data.startingBid * 0.1));
      setNextBids([
        Math.round(data.startingBid + increment),
        Math.round(data.startingBid + increment * 2),
      ]);
    });

    socket.on('timerUpdate', data => {
      if (data.remainingTime !== undefined) {
        setTimer(data.remainingTime);
        setIsActive(data.remainingTime > 0);
      }
    });

    socket.on('auctionEnded', data => {
      setBidderWon(data?.bidderWon);
      setIsActive(false);
    });

    socket.on('clrScr', () => {
      setHighestBid(startingBid);
      setHighestBidder(null);
      setBidderWon(null);
      setTimer(30);
      setBidHistory([]);
      setIsActive(false);
      setIsAuctionStarted(false);
    });

    socket.on('bidUpdated', data => {
      if (data.streamId === streamId) {
        setHighestBid(data?.highestBid);
        setHighestBidder(data?.highestBidder);
        setBidHistory(prev => [
          ...prev,
          {
            amount: data?.highestBid,
            bidder: data?.highestBidder,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        if (data.nextBids) {
          setNextBids(data.nextBids);
        }
      }
    });

    return () => {
      socket.off('bidUpdated');
      socket.off('timerUpdate');
      socket.off('auctionStarted');
      socket.off('auctionEnded');
      socket.off('clrScr');
    };
  }, [streamId]);

  const formatTime = ms => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBid = newBid => {
    // console.log(newBid)
    const socket = io(SOCKET_URL, {
      transports: ['websocket'], // WebSocket transport
    });
    if (newBid > highestBid && isActive && user) {
      socket.emit('placeBid', {
        streamId,
        user,
        amount: newBid,
        uniqueStreamId: uniqueStreamId || currentAuction?.uniqueStreamId,
      });
    }
  };

  const calculateNextBids = () => {
    const increment = Math.max(500, Math.floor(highestBid * 0.1));
    return [
      Math.round(highestBid + increment),
      Math.round(highestBid + increment * 2),
    ];
  };

  return (
    <>
      {isAuctionStarted?
        <View style={styles.container}>
         <View style={styles.auctionBox}>
      <Text style={styles.timerText}>{formatTime(timer)}</Text>
        <View style={styles.bidSection}>
        
          <View style={styles.winnerContainer}>
          {bidderWon?.name == user?.name ? ( <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fallSpeed={1500}
          explosionSpeed={500}
          fadeOut={true}
        />):null}
            {bidderWon?.name ? (
              <View style={styles.winner}>
                <Icon name="trophy" size={20} color="gold" />
                <Text style={styles.winnerText}>Winner: {bidderWon.name}</Text>
              </View>
            ) : (
              highestBidder?.name && (
                <View style={styles.winner}>
                  <Icon name="trophy" size={20} color="gold" />
                  <Text style={styles.winnerText}>
                    Highest Bidder: {highestBidder.name}
                  </Text>
                </View>
              )
            )}
          </View>
          <Text style={styles.currentBidLabel}>Current Bid</Text>
          <Text style={styles.currentBid}>₹{highestBid.toLocaleString()}</Text>
        </View>

        <View style={styles.bidButtons}>
        
          {nextBids.length > 0 && (
            <TouchableOpacity
              onPress={() => handleBid(nextBids[0])}
              
              
              style={[styles.bidButton,{
                backgroundColor:(!isActive || !user || user?._id === highestBidder?._id)?'#ccc':'orange'
              }]}>
              <Text style={styles.bidButtonText}>
                Bid ₹{nextBids[0]?.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
          {/* <View style={styles.additionalBids}>
            <TouchableOpacity
              onPress={() => handleBid(nextBid1)}
              disabled={!isActive || !user || user?._id === highestBidder?._id}
              style={styles.bidButton}>
              <Text style={styles.bidButtonText}>
                Bid ₹{nextBid1.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleBid(nextBid2)}
              disabled={!isActive || !user || user?._id === highestBidder?._id}
              style={styles.bidButton}>
              <Text style={styles.bidButtonText}>
                Bid ₹{nextBid2.toLocaleString()}
              </Text>
            </TouchableOpacity> */}
          {/* </View> */}
        </View>
      </View>
      </View>:null}
      </>
   
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
    alignSelf:'center',
    height:'100%'
  },
  auctionBox: {
    // padding: 10,
    paddingHorizontal:10,
    paddingVertical:10,
    // backgroundColor: 'white',
    borderRadius: 10,
    marginBottom:10,
    // height:90,
    width: '100%',
  },
  bidSection: {
    marginBottom: 10,
    alignItems: 'center',
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 16,
    color: 'gold',
  },
  currentBidLabel: {
    fontSize: 14,
    color: 'gray',
    // marginTop: 10,
  },
  currentBid: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orange',
    // marginTop: 5,
  },
  bidButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap:10,
  },
  timerText: {
    fontSize: 20,
    marginRight:20,
    textAlign:'right',
    fontWeight: 'bold',
  },
  bidButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    // marginTop: 10,
  },
  bidButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  additionalBids: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AuctionsOverlay;
