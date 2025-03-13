import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ToastAndroid, Modal, Image } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../Utils/Api';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistrationScreen = () => {
  const otpRef = useRef<(TextInput | null)[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  // For toggling password visibility
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpIndex, setOtpIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);  // Time left for OTP resend
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const Navigation = useNavigation();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/; // At least 1 lowercase, 1 uppercase, and 1 special character
    return regex.test(password);
  };

  const validateName = (name: string) => name.length > 0;
  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  
  const validateForm = () => {
    setNameError(validateName(name) ? '' : 'Name is required.');
    setEmailError(validateEmail(email) ? '' : 'Invalid email.');
    setPasswordError(validatePassword(password) ? '' : 'Password must contain at least one uppercase, one lowercase, and one special character.');
    return validateName(name) && validateEmail(email) && validatePassword(password);
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;  // Don't resend if time left > 0

    setLoading(true);
    try {
      const response = await api.post('/auth/resend-otp', {
        emailId: email
      });

      ToastAndroid.show("OTP has been resent!", ToastAndroid.SHORT);
      setTimeLeft(30);  // Start countdown after resend

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);  // Clear interval when countdown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);  // Decrease time every second
    } catch (error) {
      console.log("Error not valid otp", error);
    } finally {
      setLoading(false);
      setOtp(Array(6).fill('')); 
      setOtpIndex(0);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        emailId: email, otp: otp.join('')
      });
      Navigation.navigate("Login" as never);
      setOtpModalVisible(false)
      ToastAndroid.show("Successfully Registered", ToastAndroid.SHORT);
    } catch (error) {
      console.log("Error not valid otp", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Submit Process
  const handleSubmit = async () => {
    if (!validateForm()) {
      ToastAndroid.show("Please fill in all the fields correctly.", ToastAndroid.SHORT);
      return;
    }
    setLoading(true);
    try {
      console.log({
        name: name,
        emailId: email,
        password: password,
      });
      const response = await api.post('/auth/signup', {
        name: name,
        emailId: email,
        password: password,
      });
      setOtpModalVisible(true);
    } catch (error) {
      console.log("Error creating user", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = (index: number, text: string) => {
    const newPincode = [...otp];
    newPincode[index] = text.replace(/[^0-9]/g, '');
    setOtp(newPincode);
    if (text && index < 5) {
      otpRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRef.current[index - 1]?.focus();
      }
    }
  };
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
        ToastAndroid.show('successfully Regitered :) ', ToastAndroid.SHORT);
        Navigation.navigate("bottomtabbar" as never)
    }catch(error){
      console.log(error)
    } 
  }
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [name, email, password]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={"#777"}
        />
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}

        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={"#777"}
          keyboardType="email-address"
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={"black"}
            style={{color:'black'}}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <AntDesign name={showPassword ? 'eye' : 'eyeo'} size={25} />
          </TouchableOpacity>
        </View>
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        <Text style={{textAlign:'center',color:'gray'}}>Or</Text>
<View style={styles.socialButtonsContainer}>
       
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
        {/* <TouchableOpacity
          style={[styles.socialButton, {borderColor: 'blue'}]}
          // onPress={}
          >
          <AntDesign name="facebook-square" size={23} color="blue" />
        </TouchableOpacity> */}
      </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ alignSelf: 'center', marginBottom: 15, marginTop: 10 }} onPress={() => Navigation.goBack()}>
          <Text style={{ fontSize: 14 }}>Already have an account?<Text style={{ color: 'blue' }}> Sign In</Text></Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={otpModalVisible}
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 10 }} onPress={() => setOtpModalVisible(false)}>
              <Text>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter the 6 digit OTP</Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[styles.otpInput, digit.length === 0 && styles.otpInputEmpty]}
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handlePincodeChange(index, value)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  ref={(el) => (otpRef.current[index] = el)}
                  autoFocus={index === otpIndex}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleResendOtp} disabled={timeLeft > 0}>
              <Text style={styles.resendText}>
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  socialButton: {
    flexDirection:'row',
    gap:10,
    paddingHorizontal:10,
    backgroundColor:'#1a73e8',
    padding: 10,
    alignItems: 'center',
    borderRadius: 35,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    color: 'black',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    paddingVertical: 17,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 15,
    marginTop: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  otpInputEmpty: {
    borderColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resendText: {
    color: 'blue',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default RegistrationScreen;
