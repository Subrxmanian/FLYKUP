import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, ToastAndroid } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const AadhaarVerificationScreen = ({ navigation }) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [name, setName] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [nameError, setNameError] = useState('');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progress}>
          <View style={[styles.progressStep, styles.completed]} />
          <View style={[styles.progressStep]} />
          <View style={styles.progressStep} />
        </View>
        <Text style={styles.headerText}>Aadhaar Verification</Text>
      </View>

      <View style={styles.form}>
        {/* Aadhaar Number */}
        <Text style={styles.label}>Aadhaar Number</Text>
        <View style={styles.inputContainer}>
          <AntDesign name="lock" size={25} color="blue" />
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
          <AntDesign name="user" size={25} color="blue" />
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
    padding: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 10,
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
