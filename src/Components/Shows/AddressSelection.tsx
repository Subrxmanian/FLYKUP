import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import api from '../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { DefaultTheme, TextInput } from 'react-native-paper';

interface Address {
  _id: string;
  name: string;
  mobile: string;
  alternateMobile: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressSelectionProps {
  selectedAddress: any | null;
  onSelectAddress: (address: any) => void;
  onNext: (numericAmount: any) => void;
  onBack: () => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddress,
  onSelectAddress,
  onNext,
  onBack,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    alternateMobile: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addresses, setAddresses] = useState<Address[]>( []);
  const [isLoading, setIsLoading] = useState(true);
  const fetchAddressesByUserId = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userID');
      const response = await axios.get(
        `http://localhost:6969/api/address/${userId}`,
      );
      console.log(response.data);

      const result = response.data;
      if (result.data) {
        setAddresses(result.data);
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'rgb(37 99 235)',
      
      // This will change the label color when the input is focused
      text: 'red', // This affects the label color when not focused
    }
  }

  useEffect(() => {
    fetchAddressesByUserId();
  }, []);

  const handleSubmit = async () => {
    try {
      // Check if all required fields are filled out
      const requiredFields = [
        'name',
        'mobile',
        'alternateMobile',
        'line1',
        'line2',
        'city',
        'state',
        'pincode'
      ];
  
      for (let field of requiredFields) {
        if (!formData[field]) {
          // Show a Toast message if any field is empty
          ToastAndroid.show(`${field} is required`, ToastAndroid.SHORT);
          return; // Stop the function if any field is missing
        }
      }
  
      // If all fields are valid, proceed with the submission
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.post(
        `http://localhost:6969/api/address/${userId}`,
        formData
      );
      
      ToastAndroid.show("Shipping Details Added Successfully", ToastAndroid.SHORT);
      setShowModal(false);
      setFormData({
        name: '',
        mobile: '',
        alternateMobile: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
      });
      fetchAddressesByUserId();
      
    } catch (error) {
      console.error('Address submission error:', error);
      // You can add a generic error message here if needed
      ToastAndroid.show('Error saving address. Please try again.', ToastAndroid.LONG);
    }
  };  

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
  };
  const handleback = () => {
    if (showModal) {
      setShowModal(false);
    } else {
      onBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleback} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="black" />
          <Text style={styles.headerText}>Select Delivery Address</Text>
        </TouchableOpacity>
      </View>

      {showModal ? (
        <View style={styles.modal}>
          <Text style={styles.modalHeader}>Add New Address</Text>
          <TextInput
            style={styles.input}
            label="Full Name"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            value={formData.name}
            onChangeText={text => handleChange('name', text)}
          />
          <TextInput
            style={styles.input}
            label="Mobile Number"
            keyboardType="phone-pad"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            value={formData.mobile}
            onChangeText={text => handleChange('mobile', text)}
          />
          <TextInput
            style={styles.input}
            label="Alternate Mobile"
            keyboardType="phone-pad"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            value={formData.alternateMobile}
            onChangeText={text => handleChange('alternateMobile', text)}
          />
          <TextInput
            style={styles.input}
            label="Address Line 1"
            value={formData.line1}
            placeholderTextColor={'#777'}
            theme={theme}
            mode='outlined'
            onChangeText={text => handleChange('line1', text)}
          />
          <TextInput
            style={styles.input}
            label="Address Line 2"
            theme={theme}
            mode='outlined'
            value={formData.line2}
            placeholderTextColor={'#777'}
            onChangeText={text => handleChange('line2', text)}
          />
          <TextInput
            style={styles.input}
            label="City"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            value={formData.city}
            onChangeText={text => handleChange('city', text)}
          />
          <TextInput
            style={styles.input}
            label="State"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            value={formData.state}
            onChangeText={text => handleChange('state', text)}
          />
          <TextInput
            style={styles.input}
            label="Pincode"
            theme={theme}
            mode='outlined'
            placeholderTextColor={'#777'}
            maxLength={6}
            value={formData.pincode}
            onChangeText={text => handleChange('pincode', text)}
            keyboardType="number-pad"
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Address List Here */}
          <View style={styles.addressList}>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={styles.addButton}>
              <Icon name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>

           { addresses.length === 0 ? (
              <Text style={styles.emptyText}>
                No saved addresses found. Add a new address to continue.
              </Text>
            ) : (
              addresses.map(addressItem => (
                <TouchableOpacity
                  key={addressItem._id}
                  style={[
                    styles.addressItem,
                    selectedAddress?._id === addressItem._id
                      ? styles.selectedAddress
                      : {},
                  ]}                  
                  onPress={() => onSelectAddress(addressItem)}>
                      {selectedAddress?._id === addressItem._id && (
                        <View style={{alignSelf:'flex-end'}}>
                    <Icon name="check-circle" size={30} color="green" />
                    </View>
                  )}
                  <View style={styles.addressInfo}>
                    <View style={styles.row}>
                      <Feather name='user' size={20}  />
                      <Text style={styles.addressName}>{addressItem.name}</Text>
                    </View>
                    <View style={styles.row}> 
                      <Icon name='location-on' size={20}/>
                      <Text style={styles.addressDetails}>
                      {addressItem.line1}, {addressItem.line2},{' '}
                      {addressItem.city}, {addressItem.state} -{' '}
                      {addressItem.pincode}
                    </Text>
                    </View>
                    
                   <View style={styles.row}>
                    <Feather name='phone' size={20}/>
                    <Text style={styles.addressPhone}>
                      {addressItem.mobile},</Text>
                    {addressItem.alternateMobile && (
                      <Text style={styles.addressPhone}>
                        {addressItem.alternateMobile}
                      </Text>
                    )}
                   </View>
                   
                   
                  </View>
                
                </TouchableOpacity>
              ))
            )}
          </View>
          <TouchableOpacity
            onPress={onNext}
            style={[styles.confirmButton, {opacity: selectedAddress ? 1 : 0.5}]}
            disabled={!selectedAddress}>
            <Text style={styles.confirmButtonText}>Confirm Address</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {width: '110%', maxHeight: 500},
  row:{
    flexDirection:'row',
    gap:10,
    marginBottom:10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems:'center',gap:5
    // paddingVertical:4
  },
  headerText: {fontSize: 15, fontWeight: 'bold', color: 'black'},
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgb(37 99 235)',
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {color: 'white', marginLeft: 8},
  addressList: {marginBottom: 16},
  addressItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAddress: {borderColor: '#6200EE', backgroundColor: '#f3f3f3'},
  addressInfo: {marginBottom: 8},
  addressName: {fontWeight: 'bold'},
  addressDetails: {color: '#555',maxWidth:'90%'},
  addressPhone: {color: '#555'},
  confirmButton: {
    backgroundColor: '#00a96e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {color: 'white', fontWeight: 'bold'},
  modal: {
    padding: 10,
    borderRadius: 8,
    width: '100%',
    // height:400
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },
  input: {
    // borderColor: '#ddd',
    // borderWidth: 1,
    borderRadius: 8,
    // padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: 'rgb(37 99 235)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {color: '#fff'},
  errorText: {color: 'red'},
  loadingText: {textAlign: 'center', marginTop: 16},
  emptyText: {textAlign: 'center', marginTop: 16, color: 'black'},
});
