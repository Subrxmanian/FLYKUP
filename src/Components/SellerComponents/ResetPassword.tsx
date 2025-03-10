import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import api from '../../Utils/Api';
import {useNavigation} from '@react-navigation/native';

// Main ResetPassword component
const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [errors, setErrors] = useState({});
  const Navigation = useNavigation();
  const [loading, setloading] = useState(false);
  const toggleSecureEntry = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  const validateEmail = email => {
    let error = '';
    if (!email) {
      error = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      error = 'Please enter a valid email';
    }
    return error;
  };

  const validateOTP = otp => {
    return otp.length !== 6 ? 'OTP should be 6 digits' : '';
  };

  const validatePassword = password => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/; // At least 1 lowercase, 1 uppercase, and 1 special character
    
    if (!regex.test(password)) {
      return 'Password must contain at least one uppercase, one lowercase, and one special character.';
    }
    return '';
  };

  const validateConfirmPassword = confirmPassword => {
    if (confirmPassword !== newPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleSendOTP = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors(prevErrors => ({...prevErrors, email: emailError}));
      return;
    }
    setloading(true);
    try {
      const response = await api.post(`/auth/forgot-password`, {
        emailId: email,
      });
      // console.log(response.data);
      ToastAndroid.show('OTP sent to your email!', ToastAndroid.SHORT);
      setStep(2);
    } catch (error) {
      console.log('Error', error);
    } finally {
      setloading(false);
    }
  };

  const handleVerifyOTP = async() => {
    const otpError = validateOTP(otp);
    if (otpError) {
      setErrors(prevErrors => ({...prevErrors, otp: otpError}));
      return;
    }
    setloading(true);
    try {
      const response = await api.post(`/auth/forgot-password/verify`, { emailId:email, otp:otp } );
      
      ToastAndroid.show('OTP Verified Successfully!', ToastAndroid.SHORT);
      setStep(3);
    } catch (error) {
      console.log('Error', error);
    } finally {
      setloading(false);
    }
  };

  const handleResetPassword = async() => {
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    if (passwordError) {
      setErrors(prevErrors => ({...prevErrors, newPassword: passwordError}));
      return;
    }
    if (confirmPasswordError) {
      setErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: confirmPasswordError,
      }));
      return;
    }
    setloading(true);
   
    try {
      console.log( {
        emailId: email,
        confirmPassword:confirmPassword
      })
      const response = await api.post(`/auth/reset-password`, {
        emailId: email,
        confirmPassword:confirmPassword,
        newPassword: newPassword
      });
      console.log(response.data);
      // Navigation.navigate("Login")
      ToastAndroid.show('Password changed Successfully. ', ToastAndroid.SHORT);
       setStep(4);
    } catch (error) {
      console.log('Error while reseting new password', error);
    } finally {
      setloading(false);
    }
   
  };

  const handleEmailChange = email => {
    setEmail(email);
    setErrors(prevErrors => ({...prevErrors, email: validateEmail(email)}));
  };

  const handleOtpChange = otp => {
    setOtp(otp);
    setErrors(prevErrors => ({...prevErrors, otp: validateOTP(otp)}));
  };

  const handleNewPasswordChange = newPassword => {
    setNewPassword(newPassword);
    setErrors(prevErrors => ({
      ...prevErrors,
      newPassword: validatePassword(newPassword),
    }));
  };

  const handleConfirmPasswordChange = confirmPassword => {
    setConfirmPassword(confirmPassword);
    setErrors(prevErrors => ({
      ...prevErrors,
      confirmPassword: validateConfirmPassword(confirmPassword),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => Navigation.goBack()}>
          <Icon name="arrow-circle-o-left" size={28} />
          <Text>Back to Login</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={{fontSize: 18, marginBottom: 10, color: 'gray'}}>
          step {step} of 4
        </Text>
        {step === 1 && (
          <>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email Address"
              placeholderTextColor={'#777'}
              keyboardType="email-address"
              value={email}
              onChangeText={handleEmailChange}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <TouchableOpacity onPress={handleSendOTP} style={styles.button}>
        {loading?<ActivityIndicator color={"white"} size={20}/>:<Text style={styles.buttonText}>Send OTP</Text>}              
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[styles.title,{fontSize:16}]}>Verify OTP</Text>
            <TextInput
              style={[styles.input, errors.otp && styles.inputError]}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={'#777'}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="numeric"
            />
            {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
            <TouchableOpacity onPress={handleVerifyOTP} style={styles.button}>
            {loading?<ActivityIndicator color={"white"} size={20}/>:<Text style={styles.buttonText}>Verify OTP</Text>} 
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[{color:'black'}, errors.newPassword && styles.inputError]}
                placeholder="New Password"
                secureTextEntry={isSecureEntry}
                placeholderTextColor={'black'}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
              />
              <TouchableOpacity
                onPress={toggleSecureEntry}
                style={styles.eyeIcon}>
                <Icon
                  name={isSecureEntry ? 'eye-slash' : 'eye'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            <TextInput
              style={[
                styles.input,{color:'balck',},
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm Password"
              secureTextEntry={isSecureEntry}
              // selectionColor={"black"}
              placeholderTextColor={'black'}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              onPress={handleResetPassword}
              style={styles.button}>
              {loading?<ActivityIndicator color={"white"} size={20}/>
              :<Text style={styles.buttonText}>Reset Password</Text>} 
            </TouchableOpacity>
          </>
        )}

        {step === 4 && (
          <>
          <Octicons name="issue-closed" size={40} color="green"/>
            <Text style={styles.successMessage}>
              Password Reset Successful!
            </Text>
            <TouchableOpacity onPress={() => Navigation.navigate("Login")} style={styles.button}>
              <Text style={styles.buttonText}>Continue to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 5,
  },
  stepContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderWidth: 1,paddingLeft:10,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:10,
    height:50,
    width:'100%',
    justifyContent:'space-between'
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 80,
    marginBottom: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  successMessage: {
    fontSize: 18,
    color: 'green',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    // position: 'absolute',
    // bottom: -18,
    // left: 10,
  },
  inputError: {
    borderColor: 'red',
  },
});

export default ResetPassword;
