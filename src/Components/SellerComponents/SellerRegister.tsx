import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import api from '../../Utils/Api';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const SellerRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [GstNumber, setGstNumber] = useState('');
  const [email, setemail] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [businessType, setBusinessType] = useState('');
  const [errors, setErrors] = useState({}); 
  const Navigation =useNavigation()

  const businessTypes = [
    { label: 'Social Seller', value: 'social' },
    { label: 'Brand Seller', value: 'brand' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/get');
        setCategories(response.data); // Assuming response.data is an array of categories
      } catch (err) {
        console.log('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const validate = () => {
    let validationErrors = {};

    // Validation logic for each field
    if (!companyName) {
      validationErrors.companyName = 'Company Name is required.';
    }

    if (!mobileNumber) {
      validationErrors.mobileNumber = 'Mobile Number is required.';
    }

    if (!businessType) {
      validationErrors.businessType = 'Please select a Business Type.';
    }

    if (businessType === 'brand' && !GstNumber) {
      validationErrors.GstNumber = 'GST Number is required for Brand Seller.';
    }

    if (selectedCategories.length === 0) {
      validationErrors.categories = 'Please select at least one category.';
    }
    if(!email)
    {
      validationErrors.email="Email is required"
    }

    setErrors(validationErrors);
    return validationErrors;
  };
  const handleSubmit = () => {
    const validationErrors = validate();
    
    // If no validation errors, proceed with form submission logic
    if (Object.keys(validationErrors).length === 0) {
      // Create a data object
      const formData = {
        phone: mobileNumber,  // Assuming mobileNumber is the state value
        name: companyName,    // Assuming companyName is the state value
        email: email,         // Assuming email is the state value
        businessType: businessType, // Assuming businessType is the state value
        categories:selectedCategories
      };
  
      console.log(formData);  // Log the data object for debugging
  
      // Send the data object to the next screen
      Navigation.navigate('aadharverify', { formData: formData });
    }
  };
  
  const handleInputChange = (field, value) => {
    if (field === 'companyName') {
      setCompanyName(value);
    } else if (field === 'mobileNumber') {
      setMobileNumber(value);
    } else if (field === 'GstNumber') {
      setGstNumber(value);
    }
    else if(field=='email')
    {setemail(value)}

    // Validate the field whenever the user types
    validate();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <TouchableOpacity style={{marginBottom:10,flexDirection:'row'}} onPress={()=>Navigation.goBack()}>
        <AntDesign name='left' size={20}/>
        <Text> Back to Home</Text>
      </TouchableOpacity>
      {/* Step Indicator */}
       <View style={styles.header}>
                <View style={styles.progress}>
                  <View style={[styles.progressStep, {backgroundColor:'rgb(37 99 235)'}]} />
                  <View style={[styles.progressStep,]} />
                  <View style={styles.progressStep} />
                </View>
                <Text style={styles.headerText}>Seller Details</Text>
              </View>
      {/* <View style={styles.stepContainer}>
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.stepText, {color: 'white', borderColor: "rgb(59 130 246)", backgroundColor: 'rgb(59 130 246)'}]}>1</Text>
          <Text style={{color: "#777"}}>Basic Info</Text>
        </View>
        <View style={[styles.stepLine]}></View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.stepText}>2</Text>
          <Text style={{color: "#777"}}>Aadhar Verify</Text>
        </View>
        <View style={styles.stepLine}></View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.stepText}>3</Text>
          <Text style={{color: "#777"}}>Address Info</Text>
        </View>
      </View> */}

      {/* Company Name */}
      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={[styles.input, errors.companyName && styles.inputError]}
        placeholder="Enter company name"
        value={companyName}
        placeholderTextColor={"#777"}
        onChangeText={(text) => handleInputChange('companyName', text)}
      />
      {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

      {/* Mobile Number */}
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={[styles.input, errors.mobileNumber && styles.inputError]}
        placeholder="Enter mobile number"
        value={mobileNumber}
        onChangeText={(text) => handleInputChange('mobileNumber', text)}
        keyboardType="phone-pad"
        placeholderTextColor={"#777"}
      />
      {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

      {/* Business Type */}
      <Text style={styles.label}>Business Type</Text>
      <Dropdown
        data={businessTypes}
        style={[styles.dropdown, errors.businessType && styles.dropdownError]}
        labelField="label"
        valueField="value"
        placeholder="Select Business Type"
        value={businessType}
        onChange={item => {
          setBusinessType(item.value);
          validate();  // Validate immediately after selection
        }}
      />
      {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}

      {businessType === 'brand' && (
        <>
          <Text style={styles.label}>GST Number</Text>
          <TextInput
            style={[styles.input, errors.GstNumber && styles.inputError]}
            placeholder="Enter GST number"
            value={GstNumber}
            onChangeText={(text) => handleInputChange('GstNumber', text)}
            placeholderTextColor={"#777"}
          />
          {errors.GstNumber && <Text style={styles.errorText}>{errors.GstNumber}</Text>}
        </>
      )}

      {/* Business Categories */}
      <Text style={styles.label}>Business Categories</Text>

      {/* Scrollable Category Container */}
      <View style={styles.categoryContainer}>
        <ScrollView style={styles.checkboxContainer}>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <Text
                key={index}
                style={[styles.checkboxLabel, selectedCategories.includes(category.categoryName) && styles.selectedCategory]}
                onPress={() => handleCategoryChange(category.categoryName)}
              >
                {selectedCategories.includes(category.categoryName) ? '✓' : null} {category.categoryName}
              </Text>
            ))
          ) : (
            <Text style={styles.label}>No categories available</Text>
          )}
        </ScrollView>
      </View>
      {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}
      <Text style={styles.label}>Email </Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Enter the Email"
        keyboardType='email-address'
        value={email}
        placeholderTextColor={"#777"}
        onChangeText={(text) => handleInputChange('email', text)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={{ fontSize: 16 }}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
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
  submitButton: {
    marginTop:10,
    backgroundColor: 'rgb(255 190 0)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    marginBottom: 20,
  },
  stepText: {
    fontSize: 16,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    color: '#333',
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    padding: 10,
    height: 50,
  },
  dropdownError: {
    borderColor: 'red',
  },
  categoryContainer: {
    maxHeight: 200, // You can control the height to make sure the list is scrollable
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    // marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  checkboxContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#777",
    marginBottom: 5,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  selectedCategory: {
    fontWeight: 'bold',
    backgroundColor: '#1e90ff',
    color: 'white',
    borderColor: '#1e90ff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default SellerRegister;
