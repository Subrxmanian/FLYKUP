import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import io from "socket.io-client";
import Feather from "react-native-vector-icons/Feather";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Utils/Api";
import { socketurl } from "../../../Config";
import { red100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

// const socket = io.connect("http://localhost:6969");
const socket = io(socketurl, {
  transports: ['websocket'],
});

const LiveComments = ({ streamId, prevComments }) => {
  const [comments, setComments] = useState(prevComments || []);  // Initialize with prevComments or empty array if not provided.
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const commentsContainerRef = useRef(null);

  // Fetch user data
  // console.log(prevComments)
  const fetchUser = async () => {
    try {
      const id = (await AsyncStorage.getItem('userId')) || '';
      const response = await api.get(`/user/id/${id}`);
      setUser(response.data.data);
    } catch (err) {
      console.log('Error fetching user:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle socket and new comments
  useEffect(() => {
    socket.emit("joinRoom", streamId);
    setComments(prevComments || []);  // Update comments on streamId change

    socket.on(`commentAdded-${streamId}`, (comment) => {
      setComments((prev) => [...prev, comment]); // Add new comment to state
      if (commentsContainerRef.current) {
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => {
      socket.off(`commentAdded-${streamId}`);
    };
  }, [streamId]); // Re-run the effect if streamId changes

  useEffect(() => {
    if (user) {
      setInput("");
      scrollToBottom();
    }
  }, [user, streamId]);

  const scrollToBottom = () => {
    commentsContainerRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (e) => {
    if (e && e.nativeEvent) {
        const { contentSize, contentOffset, layoutMeasurement } = e.nativeEvent;
        if (contentSize && contentOffset && layoutMeasurement) {
            const contentHeight = contentSize.height;
            const contentOffsetY = contentOffset.y;
            const layoutHeight = layoutMeasurement.height;

            setShowScrollButton(contentHeight - contentOffsetY - layoutHeight > 100 || contentHeight < layoutHeight + 100);
        }
    }
  };

  const handleSend = () => {
    if (input.trim() && user) {
      const newComment = {
        user: user,
        text: input,
        timestamp: new Date().toLocaleTimeString(),
        streamId,
      };

      socket.emit("newComment", newComment);
      setInput("");
      scrollToBottom();
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View key={item.timestamp} style={{ flexDirection: "row", padding: 10 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 20,
            backgroundColor: "gray",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item?.user?.profileURL ? (
            <Image
              source={{ uri: item?.user?.profileURL }}
              style={{ width: 30, height: 30, borderRadius: 20 }}
            />
          ) : (
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
                textTransform: "uppercase",
              }}
            >
              {item?.user?.userName?.charAt(0) || "U"}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "bold", color: "#fbbf24" }}>
              {item?.user?.userName || item?.user?.name || "Unknown"}
            </Text>
            <Text style={{ color: "gray", fontSize: 12 }}>
              {moment(item?.timestamp).format("hh:mm a")}
            </Text>
          </View>
          <Text style={{ color: "white", fontWeight: "500" }}>{item?.text}</Text>
        </View>
      </View>
    );
  };
// console.log(comments)
  return (
    <View style={{ flex: 1 }}>
      {/* Chat Messages */}
      <FlatList
        ref={commentsContainerRef}
        data={comments}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={handleScroll}
        style={{ flex: 1, padding: 1, height: 200 }}
        inverted
      />

      {/* Scroll Button */}
      {showScrollButton && (
        <TouchableOpacity
          onPress={scrollToBottom}
          style={{
            position: "absolute",
            bottom: 80,
            right: 20,
            backgroundColor: "#333",
            borderRadius: 20,
            padding: 10,
          }}
        >
          <Feather name="chevrons-down" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Chat Input */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={{
            backgroundColor: "#333",
            color: "white",
            borderRadius: 30,
            marginRight: 10,
            paddingLeft:17,
            width: "80%",
          }}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="gray"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || !user}
          style={{
            backgroundColor: "#fbbf24",
            padding: 10,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LiveComments;
