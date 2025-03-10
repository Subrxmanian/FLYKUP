/* eslint-disable quotes */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ToastAndroid,
} from 'react-native';
import {ActivityIndicator, Checkbox} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import api from '../Utils/Api';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setloading] = useState(false);
  const Navigation = useNavigation();
 
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();
    // console.log(signInResult);

    const idToken = signInResult.data?.idToken;
    const userDetails = signInResult.data?.user
        
    if (!idToken) {
      throw new Error('No ID token found');
    }
    //login(signInResult.data);
    // Create a Google credential with the token auth().signInWithCredential(googleCredential)
    const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.idToken);
    // console.log(googleCredential)
    try{
      const response= await api.post(`/auth/google`,{
        name: userDetails?.name,
        emailId: userDetails?.email,
        profileURL: userDetails?.photo,
        isLogin: googleCredential,
      })
      // console.log(response.data.data)
      // if(rememberMe){
        AsyncStorage.setItem("userName",response.data.data.userName)
      // }
      AsyncStorage.setItem("userId",response.data.data._id)
      // console.log(response.data.data.sellerInfo)
      if(response.data.data.sellerInfo){
      AsyncStorage.setItem("sellerId",response.data.data.sellerInfo)}
        ToastAndroid.show('successfully Logined ', ToastAndroid.SHORT);
        Navigation.navigate("bottomtabbar" as never)
    }catch(error){
      console.log(error)
    } 
  }
  

  async function onFacebookButtonPress() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  
    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }
  
    console.log(result);
    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    console.log('Facebook Token:', data);
  
    if (!data) {
      throw 'Something went wrong obtaining access token';
    }
  
    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
  }

  // Email validation function
  const validateEmail = email => {
    const regex = /\S+@\S+\.\S+/;
    if (!email) {
      setEmailError('Please enter a  email address');
    } else if (!regex.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }

  // Password validation function
  const validatePassword = password => {
    if (!password) {
      setPasswordError('Password is required field');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };
 
  const handleLogin = async () => {
    validateEmail(email);
    validatePassword(password);
    if (passwordError && emailError) return;
    setloading(true);
    try {
      // console.log( {
      //   emailId: email,
      //   password: password,
      // })
      const response = await api.post(`/auth/login`, {
        emailId: email,
        password: password,
      });
      // console.log(response.data)
      
      // console.log("data",response.data.data._id);
      if(rememberMe){
      AsyncStorage.setItem("userName",response.data.data.userName)
    }
    AsyncStorage.setItem("userId",response.data.data._id)
    // console.log(response.data.data.sellerInfo)
    if(response.data.data.sellerInfo){
    AsyncStorage.setItem("sellerId",response.data.data.sellerInfo)}
      ToastAndroid.show('successfully Logined ', ToastAndroid.SHORT);
      Navigation.navigate("bottomtabbar" as never)
    } catch (error) {
      ToastAndroid.show("Invalid password or Email Id ",ToastAndroid.LONG)
      console.log('error while logining', error);
    } finally {
      setloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} 
        style={styles.headerImage}
      />

      {/* <Text style={styles.title}>FLYKUP</Text> */}
      <Text style={styles.subtitle}>
        Register or sign in and we'll get started.
      </Text>

      <TextInput
        style={[styles.input, emailError ? {borderColor: 'red'} : null]}
        placeholder="Enter your e-mail"
        placeholderTextColor={'#ccc'}
        value={email}
        onChangeText={text => {
          setEmail(text);
          validateEmail(text);
        }}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <View
        style={[
          styles.passwordContainer,
          passwordError ? {borderColor: 'red'} : null,
        ]}>
        <TextInput
          style={{marginLeft: 1,backgroundColor:'transparent',color:'black'}}
          placeholder="Enter your password"
          placeholderTextColor={'#ccc'}
          autoComplete="off"
          autoCorrect={false}
          value={password}
          onChangeText={text => {
            setPassword(text);
            validatePassword(text);
          }}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}>
          <AntDesign name={isPasswordVisible ? 'eye' : 'eyeo'} size={25} />
        </TouchableOpacity>
      </View>
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <View style={styles.rememberMeContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => {
              setRememberMe(!rememberMe);
            }}
            color="green"
            uncheckedColor="#777"
          />
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={()=>Navigation.navigate("resetpassword" as never)}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading?<ActivityIndicator color='white'/>:<Text style={styles.buttonText}>Sign in with e-mail</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, {backgroundColor: 'white', borderWidth: 1}]}
        onPress={() => Navigation.navigate('registeruser')}>
        <Text style={[styles.buttonText, {color: 'black'}]}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.socialMediaText}>Or continue with</Text>

      <View style={styles.socialButtonsContainer}>
        {/* <TouchableOpacity
          style={styles.socialButton}
          onPress={() => {
            ToastAndroid.show('Please Login using Email and Password.  ', ToastAndroid.SHORT)
            // return
          }}>
          <AntDesign name="apple1" size={23} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.socialButton]}
          onPress={onGoogleButtonPress}>
          {/* <AntDesign name="google" size={23} color="red" />
           */}
           <View style={{backgroundColor:'#fff',
            padding:3,
            borderRadius:20}}>
           <Image  source={require('../assets/images/google.png')} style={{width:20,height:20}}/>
            </View>
           <Text style={{color:'white',fontWeight:'600'}}>Sigin with Google</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={[styles.socialButton]}
          onPress={onFacebookButtonPress}>
        <View style={{backgroundColor:'#fff',
            padding:3,
            borderRadius:20}}>
           
          <AntDesign name="facebook-square" size={23} color="blue" />
            </View>
           <Text style={{color:'white',fontWeight:'600'}}>Sigin with Facebook</Text>
        </TouchableOpacity> */}
        
        {/* <TouchableOpacity
          style={[styles.socialButton, {borderColor: 'blue'}]}
          onPress={onFacebookButtonPress}>
        </TouchableOpacity> */}
      </View>
      {/* <View style={{flex:1}}/> */}

      <Text style={styles.termsText}>
        I accept FLYKUP <Text style={styles.linkText}>Terms of Use</Text> and{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  headerImage: {
    width: '100%',
    height: 200,
    // marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#6e6e6e',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor:'transparent',color:'black',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  passwordContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 3,
    // alignItems:'center',
    // position: 'relative',
    borderRadius: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 10,

    color: '#aaa',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6e6e6e',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'blue',
  },
  button: {
    width: '100%',
    borderRadius: 25,
    padding: 15,
    backgroundColor: '#000',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  socialMediaText: {
    fontSize: 14,
    color: '#6e6e6e',
    marginVertical: 10,
  },
  socialButtonsContainer: {
    // flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    // width: '50%',
    
    marginBottom: 20,
    marginTop: 10,
  },
  socialButton: {
    // width: 50,
    flexDirection:'row',
    justifyContent:'space-between',

    gap:10,
    paddingHorizontal:10,
    backgroundColor:'#1a73e8',
    padding: 10,
    alignItems: 'center',
    borderRadius: 35,
  },
  termsText: {
    fontSize: 12,
    color: '#6e6e6e',
  },
  linkText: {
    color: '#0000ff',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});
