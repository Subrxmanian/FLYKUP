import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, ToastAndroid } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { uploadImageToS3 } from '../../Utils/aws';

import {launchImageLibrary} from 'react-native-image-picker';

const AadhaarVerificationScreen = ({ navigation }) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [name, setName] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [nameError, setNameError] = useState('');
  
    const [image, setImage] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setloading] = useState(false);
    const [isGst,setIsGst]=useState('')
  
  const route=useRoute()
  // const { formData } = route.params as { formData:any };
  const {formData}= route.params as {formData:any}||''
  

  // Handle Aadhaar number change
  const handleAadhaarChange = (text) => {
    setAadhaarNumber(text);
    if (text.replace(/\s+/g, '').length !== 12) {
      setAadhaarError('Aadhaar number must be exactly 12 digits');
    } else {
      setAadhaarError('');
    }
  };

  // Handle Name change
  const handleNameChange = (text) => {
    setName(text);
    if (text.trim().length === 0) {
      setNameError('Name cannot be empty');
    } else {
      setNameError('');
    }
  };

  const handleContinue = () => {
    if (!aadhaarError && !nameError && aadhaarNumber && name) {
      const data={
        basicInfo:formData,
        aadharInfo:{aadharNumber:aadhaarNumber, aadharName:name}
      }
      navigation.navigate('AddressDetails',{data:data});
    
    } else {
            
        ToastAndroid.show("Please fill out the fields correctly",ToastAndroid.SHORT)

    }
  };
    const selectMedia = async () => {
      const options = {mediaType: 'photo', quality: 1};
  
      launchImageLibrary(options, async response => {
        if (response.didCancel) {
          console.log('User canceled image picker');
          return;
        }
        if (response.errorMessage) {
          console.error('Image Picker Error: ', response.errorMessage);
          return;
        }
  
        const uri = response.assets[0].uri;
        if (!uri) {
          console.error('No URI found for the image');
          return;
        }
  
        try {
          console.log('Selected Image URI: ', uri); // Log URI to verify
          setloading(true);
          setImage(uri);
  
          // Upload to S3
          console.log('Uploading image to S3...');
          const url = await uploadImageToS3(uri, 'gstdocument');
  
          if (!url) {
            console.error('Failed to upload image, URL not received');
          } else {
            setImageUrl(url);
            console.log('Image uploaded successfully. URL:', url);
          }
        } catch (err) {
          console.error('Error during image upload:', err);
        } finally {
          setloading(false);
        }
      });
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progress}>
          <View style={[styles.progressStep, styles.completed]} />
          <View style={[styles.progressStep,styles.completed]} />
          <View style={styles.progressStep} />
        </View>
        <Text style={styles.headerText}>Business & KYC Verification</Text>
      </View>

      <View style={styles.form}>
        <View>
          <Text>Do you Have GST? </Text>
        </View>
        <View style={[styles.row, { marginTop: 10, marginBottom: 20 }]}>
      {["Yes", "No"].map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button,value === isGst ? styles.selectedButton : {backgroundColor:'white',paddingHorizontal:20}]}
          onPress={() => setIsGst(value)} >
          <Text style={{color:value === isGst?"white":'black'}}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>

            {isGst === 'Yes' && (
            <>
              <Text style={styles.label}>GST Number</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Enter GST number"
                value={'GstNumber'}
                // onChangeText={text => handleInputChange('GstNumber', text)}
                placeholderTextColor={'#777'}
              />
            
              <Text style={styles.label}>Upload GST Document : </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => selectMedia()}>
                <AntDesign name="upload" size={20} color="white" />
                <Text style={styles.uploadButtonText}>
                  Upload your GST Document{' '}
                </Text>
              </TouchableOpacity>
              {image && (
                <Image source={{uri: image}} style={styles.imagePreview} />
              )}
            </>
          )}
        {/* Aadhaar Number */}
        <Text style={styles.label}>Aadhaar Number</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-person" size={25} color="blue" />
          <TextInput
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor={"#777"}
            keyboardType="numeric"
            value={aadhaarNumber}
            onChangeText={handleAadhaarChange}
            maxLength={14}
            style={styles.input}
          />
        </View>
        {aadhaarError ? <Text style={styles.errorText}>{aadhaarError}</Text> : null}

        {/* Name as per Aadhaar */}
        <Text style={styles.label}>Name as per Aadhaar</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={25} color="blue" />
          <TextInput
            placeholder="Enter name exactly as on Aadhar"
            placeholderTextColor={"#777"}
            value={name}
            onChangeText={handleNameChange}
            style={styles.input}
          />
        </View>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      {/* Important Note */}
      <View style={styles.note}>
        <View style={styles.noteHeader}>
          <AntDesign name="warning" size={20} />
          <Text style={styles.noteTitle}>Important Note</Text>
        </View>
        <Text style={styles.noteText}>
          Please ensure the name matches exactly as it appears on your Aadhar card, including spaces and special characters.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleContinue} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor:'#F7CE45'
  },
  Gstbutton:{
  paddingVertical:7,
  paddingHorizontal:10,
  backgroundColor:'white',
  
  },
  selectedButton:{
    backgroundColor:'#333'
  },
  row:{
  flexDirection:'row',
  gap:10,
  alignItems:'center'
  
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
    // margin: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  completed: {
    backgroundColor: '#333',
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
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
    fontSize: 16,
  },
  note: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 14,
    marginTop: 10,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor:'#eff6ff',
    borderRadius:10,
  },
  backButtonText: {
    color: "rgb(37 99 235)",
    fontSize: 16,
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default AadhaarVerificationScreen;
