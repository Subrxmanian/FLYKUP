import { View, Text, Animated } from 'react-native'
import React, { useEffect, useState } from 'react'

const SideBar = ({navigation,drawerVisible}) => {
  // const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Buy Now');
    const [drawerAnimation] = useState(new Animated.Value(300));
     const [user, setUser] = useState(null);
  return (
    <View>
      <Text>SideBar</Text>
    </View>
  )
}

export default SideBar
