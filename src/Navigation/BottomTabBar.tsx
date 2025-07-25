import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Dashboard from "../Components/Dashboard";
import ReelsComponent from "../Components/ReelsComponent";
import AntDesign from 'react-native-vector-icons/AntDesign';
import LikeScreen from "../Components/LikeScreen";
import Comment from "../Components/Comment";
import AboutUser from "../Components/AboutUser";

const Tab = createBottomTabNavigator();

export default function BottomTabBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconColor = focused ? 'white' : color;  // Set icon color based on focus
          switch (route.name) {
            case 'Home':
              return <FontAwesome5 name="home" color={iconColor} size={size} />;
            case 'Notify':
              return <AntDesign name="pluscircleo" color={iconColor} size={size} />;
            case 'Add':
              return <AntDesign name={ focused ?"heart":"hearto"} color={iconColor}  size={size} />; // Always black for add button
            case 'triplist':
              return <MaterialIcons name="comment" color={iconColor} size={size} />;
            case 'History':
              return <AntDesign name="user" color={iconColor} size={size} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: 'white',  // Set active tab label color to black
        tabBarInactiveTintColor: 'gray', // Set inactive tab label color to gray
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{ 
          tabBarLabel: "", 
          unmountOnBlur: true,  // Unmount when navigating away
        }}
      />
     
      <Tab.Screen
        name="Add"
        component={LikeScreen} 
        options={{
          tabBarLabel: "",  
          unmountOnBlur: true,  // Unmount when navigating away
        }}
      />
      <Tab.Screen
        name="Notify"
        component={ReelsComponent}
        options={{
          tabBarLabel: "",
          unmountOnBlur: true,  // Unmount when navigating away
        }}
      />
      <Tab.Screen
        name="triplist"
        component={Comment}
        options={{
          tabBarLabel: "",
          unmountOnBlur: true,  // Unmount when navigating away
        }}
      />
      <Tab.Screen
        name="History"
        component={AboutUser}
        options={{
          tabBarLabel: "",
          unmountOnBlur: true,  // Unmount when navigating away
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 50, 
    paddingBottom: 10,  

    backgroundColor:'#1d1d1d'
  },
  tabBarLabel: {
    marginTop: 5,
    fontSize: 12, 
  },
});
