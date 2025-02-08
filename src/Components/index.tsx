import { useNavigation } from '@react-navigation/native'
import React, { useEffect } from 'react'
import DeviceInfo from 'react-native-device-info';
export default function Index() {
  const Navigation = useNavigation()
useEffect(()=>{
  const navigate= async () => {
    const version = await DeviceInfo.getVersion()
    if(version=='1.0')
    Navigation.navigate("Login")
  else
  Navigation.navigate("update")
  }
  navigate()
},[])
  return (
 null
  )
}
