import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../Components/Dashboard';
import Login from '../Components/Login';
import Index from '../Components/index';
import RegistrationScreen from '../Components/Register';
import ReelsComponent from '../Components/ReelsComponent';
import BottomTabBar from './BottomTabBar';
import ForceUpdate from '../Components/ForceUpdate';
import SplashScreen from '../Components/SplashScreen';
import SellerRegister from '../Components/SellerComponents/SellerRegister';
import AadhaarVerificationScreen from '../Components/SellerComponents/Aadharcardgetting';
import AddressDetailsScreen from '../Components/SellerComponents/Addressgetting';
import InventoryList from '../Components/SellerComponents/AddInventory';
import ProductUploadForm from '../Components/SellerComponents/Addproduct';
import ProductDetailsScreen from '../Components/SellerComponents/Inventory';

const Stack = createStackNavigator();

export default function StackNavigate() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash"  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="SellerRegister" component={SellerRegister}/>
      <Stack.Screen name="aadharverify" component={AadhaarVerificationScreen}/>
      <Stack.Screen name="AddressDetails" component={AddressDetailsScreen}/>
      <Stack.Screen name="AddInventory" component={InventoryList}/>
      <Stack.Screen name="ProductUploadForm" component={ProductUploadForm}/>
      <Stack.Screen name="Inventory" component={ProductDetailsScreen}/>
        <Stack.Screen
          name="Index"
          component={Index}
          options={{ headerShown: false }}
        />
         
      <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Reels"
          component={ReelsComponent}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="registeruser"
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />
            <Stack.Screen
          name="bottomtabbar"
          component={BottomTabBar}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="update"
          component={ForceUpdate}
          options={{ headerShown: false }}
        />
          
      </Stack.Navigator>
    </NavigationContainer>
  );
}

