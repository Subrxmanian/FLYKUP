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
import Products from '../Components/SellerComponents/Products'
import ViewSellerHistory from '../Components/SellerComponents/ViewSellerHistory';
import ResetPassword from '../Components/SellerComponents/ResetPassword';
import LiveStreamForm from '../Components/SellerComponents/LiveStreaming/Livestreamingform';
import LiveStreaming from '../Components/SellerComponents/LiveStreaming/LiveStreaming';
import EditLsform from '../Components/SellerComponents/LiveStreaming/EditLsform';
import Streaming from '../Components/SellerComponents/LiveStreaming/Streaming';
import AddingProducts from '../Components/SellerComponents/AddingProducts';
import Shows from '../Components/Shows/Shows';
import LiveStreamScreen from '../Components/Shows/LiveScreen';
import CashfreePaymentGateway from '../Components/Shows/Payment/Cashfree';
import PaymentFailed from '../Components/Shows/Payment/PaymentFailed';
import PaymentSuccess from '../Components/Shows/Payment/PaymentSuccess';


const Stack = createStackNavigator();

export default function StackNavigate() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash"  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="PaymentFailed" component={PaymentFailed}/>
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess}/>
      <Stack.Screen name="SellerRegister" component={SellerRegister}/>
      <Stack.Screen name="aadharverify" component={AadhaarVerificationScreen}/>
      <Stack.Screen name="AddressDetails" component={AddressDetailsScreen}/>
      <Stack.Screen name="CashfreePaymentGateway" component={CashfreePaymentGateway}/>
      <Stack.Screen name="ProductUploadForm" component={AddingProducts}/>
      <Stack.Screen name="Inventory" component={ProductDetailsScreen}/>
      <Stack.Screen name="Products" component={Products}/>
      <Stack.Screen name="resetpassword" component={ResetPassword}/>
      <Stack.Screen name="LiveStreamForm" component={LiveStreamForm}/>
      <Stack.Screen name="LiveStream" component={LiveStreaming}/>
      <Stack.Screen name="EditLs" component={EditLsform}/>
      <Stack.Screen name="Streaming" component={Streaming}/>
      <Stack.Screen name="ViewSellerHistory" component={ViewSellerHistory}/>
      <Stack.Screen name="userShows" component={Shows}/>
      <Stack.Screen name="LiveScreen" component={LiveStreamScreen}/>
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

