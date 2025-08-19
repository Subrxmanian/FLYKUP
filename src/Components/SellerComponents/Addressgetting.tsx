import {setLogLevel} from '@react-native-firebase/app';
import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import {ActivityIndicator, Checkbox, overlay} from 'react-native-paper';
import api from '../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddressDetailsScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    officeAddress1: '',
    officeAddress2: '',
    officeCity: '',
    officeState: '',
    officePincode: '',
    homeAddress1: '',
    homeAddress2: '',
    homeCity: '',
    homeState: '',
    homePincode: '',
  });
  const route = useRoute();
  const {data} = route.params as {formData: any};
  const [loading, setloading] = useState(false);

  const [isSameAddress, setIsSameAddress] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCheckboxToggle = () => {
    setIsSameAddress(!isSameAddress);
    if (!isSameAddress) {
      // Copy office address to home address if checkbox is checked
      setFormData(prevData => ({
        ...prevData,
        homeAddress1: prevData.officeAddress1,
        homeAddress2: prevData.officeAddress2,
        homeCity: prevData.officeCity,
        homeState: prevData.officeState,
        homePincode: prevData.officePincode,
      }));
    } else {
      // Clear home address fields if checkbox is unchecked
      setFormData(prevData => ({
        ...prevData,
        homeAddress1: '',
        homeAddress2: '',
        homeCity: '',
        homeState: '',
        homePincode: '',
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = '';
    if (!value.trim()) {
      errorMessage = `This ${name} is required`;
    } else if (name === 'officePincode' || name === 'homePincode') {
      const regex = /^[0-9]{6}$/;
      if (!regex.test(value)) {
        errorMessage = 'Pincode must be 6 digits';
      }
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleContinue = async () => {
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [key]: `This ${key} is required`,
        }));
        isValid = false;
      }
    });

    if (isValid) {
      const userid = (await AsyncStorage.getItem('userId')) || '';

      setloading(true);
      try {
   
        const response = await api.post(`/user/become-seller`, {
          userId: userid,
          aadharInfo: data.aadharInfo,
          basicInfo: data.basicInfo,
          addressInfo: {
            homeAddress: {
             
              addressLine1: formData.homeAddress1,
              addressLine2: formData.homeAddress2,
              city: formData.homeCity,
              state: formData.homeState,
              pincode: formData.homePincode,
            },
            sameAsOffice: isSameAddress,
            officeAddress: {
              addressLine1: formData.officeAddress1,
              addressLine2: formData.officeAddress2,
              city: formData.officeCity,
              state: formData.officeState,
              pincode: formData.officePincode,
            },
          },
        });
        ToastAndroid.show('Seller registered Successfully', ToastAndroid.SHORT);
        navigation.navigate('bottomtabbar');
      } catch (error) {
        console.log('error registering', error);
      } finally {
        setloading(false);
      }
    }
  };

  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <ActivityIndicator color="gray" size={20} />
            <Text style={{fontSize: 14}}>loading</Text>
          </View>
        </View>
      ) : null}
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.progress}>
              <View style={[styles.progressStep, styles.completed]} />
              <View style={[styles.progressStep, styles.completed]} />
              <View style={styles.progressStep} />
            </View>
            <Text style={styles.headerText}>Address Details</Text>
          </View>

          <View style={styles.form}>
            {/* Office Address */}
            <Text style={styles.label}>Office Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              value={formData.officeAddress1}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('officeAddress1', value)}
            />
            {errors.officeAddress1 && (
              <Text style={styles.errorText}>{errors.officeAddress1}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Address Line 2"
              value={formData.officeAddress2}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('officeAddress2', value)}
            />
            {errors.officeAddress2 && (
              <Text style={styles.errorText}>{errors.officeAddress2}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="City"
              value={formData.officeCity}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('officeCity', value)}
            />
            {errors.officeCity && (
              <Text style={styles.errorText}>{errors.officeCity}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="State"
              value={formData.officeState}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('officeState', value)}
            />
            {errors.officeState && (
              <Text style={styles.errorText}>{errors.officeState}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              placeholderTextColor={'#777'}
              value={formData.officePincode}
              keyboardType="numeric"
              onChangeText={value => handleInputChange('officePincode', value)}
            />
            {errors.officePincode && (
              <Text style={styles.errorText}>{errors.officePincode}</Text>
            )}

            {/* Same as Office Address Checkbox */}
            <Text style={styles.label}>Home Address</Text>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={isSameAddress ? 'checked' : 'unchecked'}
                onPress={handleCheckboxToggle}
              />
              <Text style={styles.checkboxLabel}>Same as Office Address</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              value={formData.homeAddress1}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('homeAddress1', value)}
            />
            {errors.homeAddress1 && (
              <Text style={styles.errorText}>{errors.homeAddress1}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Address Line 2"
              value={formData.homeAddress2}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('homeAddress2', value)}
            />
            {errors.homeAddress2 && (
              <Text style={styles.errorText}>{errors.homeAddress2}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="City"
              value={formData.homeCity}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('homeCity', value)}
            />
            {errors.homeCity && (
              <Text style={styles.errorText}>{errors.homeCity}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="State"
              value={formData.homeState}
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('homeState', value)}
            />
            {errors.homeState && (
              <Text style={styles.errorText}>{errors.homeState}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={formData.homePincode}
              keyboardType="numeric"
              placeholderTextColor={'#777'}
              onChangeText={value => handleInputChange('homePincode', value)}
            />
            {errors.homePincode && (
              <Text style={styles.errorText}>{errors.homePincode}</Text>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleContinue} style={styles.button}>
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: 'rgb(37 99 235)',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  backButton: {
    paddingHorizontal: 10,
    backgroundColor: 'rgb(59 130 246 / .5)',
    paddingVertical: 10,
  },
  backButtonText: {
    color: 'rgb(37 99 235)',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progress: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  progressStep: {
    height: 10,
    width: 30,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#D3D3D3',
  },
  completed: {
    backgroundColor: '#4CAF50',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    height: 50,
    borderColor: '#777',
    padding: 10,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default AddressDetailsScreen;
