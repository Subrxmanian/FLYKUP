import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
import {ActivityIndicator, Checkbox} from 'react-native-paper';
import api from '../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Subheader} from 'react-native-paper/lib/typescript/components/List/List';
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
  const [user, setuser] = useState();
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
        if (user?.sellerInfo?.approvalStatus === 'rejected') {
          const response = await api.put(`/user/become-seller/modify`, {
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
          ToastAndroid.show(
            'Seller Request send Successfully',
            ToastAndroid.SHORT,
          );
        } else {
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
          // console.log(response.data.data.sellerInfo._id)
          // AsyncStorage.setItem("")
          ToastAndroid.show(
            'Seller registered Successfully',
            ToastAndroid.SHORT,
          );
        }
        navigation.navigate('bottomtabbar');
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          const backendMessage = error.response.data.message; // If the message is in response.data.message
          ToastAndroid.show(backendMessage, ToastAndroid.SHORT);
        } else if (error.message) {
          // If the error message is directly on the error object
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
        console.log('error registering', error);
      } finally {
        setloading(false);
      }
    }
  };
  const fetchuser = async () => {
    // console.log(await generateSignedUrl("ProductImage/59f3f4dd-60ce-478e-bbdf-3c769662e00d_image1.JPG"))
    try {
      const id = (await AsyncStorage.getItem('userId')) || '';

      const response = await api.get(`/user/id/${id}`);
      setuser(response.data.data);
    } catch (err) {
      console.log('error fetching', err);
    }
  };
  useEffect(() => {
    fetchuser();
  }, []);
  // console.log(data)
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
            <View style={styles.card}>
              <View style={styles.subHeader}>
                <MaterialIcons name="apartment" color="blue" size={28} />
                <Text style={styles.subHeaderText}>Office Address</Text>
              </View>

              <Text style={styles.label}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., 123 Main Street"
                value={formData.officeAddress1}
                placeholderTextColor={'#777'}
                onChangeText={value =>
                  handleInputChange('officeAddress1', value)
                }
              />
              {errors.officeAddress1 && (
                <Text style={styles.errorText}>{errors.officeAddress1}</Text>
              )}
              <Text style={styles.label}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Apartment, Suite, Unit, Building etc.,"
                value={formData.officeAddress2}
                placeholderTextColor={'#777'}
                onChangeText={value =>
                  handleInputChange('officeAddress2', value)
                }
              />
              {errors.officeAddress2 && (
                <Text style={styles.errorText}>{errors.officeAddress2}</Text>
              )}
              <Text style={styles.label}>City </Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Chennai"
                value={formData.officeCity}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('officeCity', value)}
              />
              {errors.officeCity && (
                <Text style={styles.errorText}>{errors.officeCity}</Text>
              )}
              <Text style={styles.label}>State </Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Tamil Nadu"
                value={formData.officeState}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('officeState', value)}
              />
              {errors.officeState && (
                <Text style={styles.errorText}>{errors.officeState}</Text>
              )}
              <Text style={styles.label}>Pincode</Text>

              <TextInput
                style={styles.input}
                placeholder="eg., 600 001"
                placeholderTextColor={'#777'}
                value={formData.officePincode}
                keyboardType="numeric"
                onChangeText={value =>
                  handleInputChange('officePincode', value)
                }
              />
              {errors.officePincode && (
                <Text style={styles.errorText}>{errors.officePincode}</Text>
              )}
            </View>
            <View style={styles.card}>
              <View style={styles.subHeader}>
                <MaterialIcons name="apartment" color="blue" size={28} />
                <Text style={styles.subHeaderText}>Home Address</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={isSameAddress ? 'checked' : 'unchecked'}
                  color={isSameAddress ? 'green' : 'black'}
                  onPress={handleCheckboxToggle}
                />
                <Text style={styles.checkboxLabel}>Same as Office Address</Text>
              </View>
              <Text style={styles.label}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., 123 Main Street"
                value={formData.homeAddress1}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('homeAddress1', value)}
              />
              {errors.homeAddress1 && (
                <Text style={styles.errorText}>{errors.homeAddress1}</Text>
              )}
              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Apartment, Suite, Unit, Building etc.,"
                value={formData.homeAddress2}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('homeAddress2', value)}
              />
              {errors.homeAddress2 && (
                <Text style={styles.errorText}>{errors.homeAddress2}</Text>
              )}
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Chennai"
                value={formData.homeCity}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('homeCity', value)}
              />
              {errors.homeCity && (
                <Text style={styles.errorText}>{errors.homeCity}</Text>
              )}
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., Tamil Nadu"
                value={formData.homeState}
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('homeState', value)}
              />
              {errors.homeState && (
                <Text style={styles.errorText}>{errors.homeState}</Text>
              )}
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="eg., 600 007"
                value={formData.homePincode}
                keyboardType="numeric"
                placeholderTextColor={'#777'}
                onChangeText={value => handleInputChange('homePincode', value)}
              />
              {errors.homePincode && (
                <Text style={styles.errorText}>{errors.homePincode}</Text>
              )}
            </View>
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton,{backgroundColor:'#eff6ff'}]}>
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
  card:{
    borderRadius:15,
    elevation:4,
    backgroundColor:'#eff6ff',
    paddingVertical:10,
    paddingHorizontal:10,
    marginBottom:10,
  },
  subHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius:10,
  },
  backButtonText: {
    color: 'rgb(37 99 235)',
    fontSize: 16,
  },
  container: {
    // flex: 1,
    padding: 20,
    backgroundColor:'#fff'
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop:10,
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
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    height: 50,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
