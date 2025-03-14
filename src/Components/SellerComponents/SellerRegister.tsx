import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import api from '../../Utils/Api';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {uploadImageToS3} from '../../Utils/aws';

const SellerRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [GstNumber, setGstNumber] = useState('');
  const [email, setemail] = useState('');
  const [categories, setCategories] = useState([
    {categoryName: 'Partner ship'},
    {categoryName: 'Sole Proprietor'},
    {categoryName: 'Individual'},
    {categoryName: 'Private Limited'},
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [businessType, setBusinessType] = useState('');
  const [errors, setErrors] = useState({});
  const Navigation = useNavigation();
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setloading(true);

      try {
        const response = await api.get('/categories/get');
        // console.log('this works')
        // setCategories(response.data); // Assuming response.data is an array of categories
      } catch (err) {
        console.log('Failed to fetch categories', err);
      } finally {
        setloading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = category => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter(item => item !== category),
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
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

    if (businessType === 'brand') {
      // GST Number validation for Brand Seller
      if (!GstNumber) {
        validationErrors.GstNumber = 'GST Number is required for Brand Seller.';
      } else {
        // Corrected GST Number Regex pattern
        const gstRegex =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        // Test if GST number matches the regex pattern
        if (!gstRegex.test(GstNumber)) {
          validationErrors.GstNumber = 'Please enter a valid GST number.';
        }
      }
    }

    // Business Category Validation
    if (selectedCategories.length === 0) {
      validationErrors.categories = 'Please select at least one category.';
    }

    if (!email) {
      validationErrors.email = 'Email is required.';
    }

    setErrors(validationErrors);
    return validationErrors;
  };
  // console.log(categories)
  const handleSubmit = () => {
    Navigation.navigate('aadharverify', {formData: ''});
    const validationErrors = validate();
    if (businessType == 'brand') {
      if (!imageUrl) {
        console.log(imageUrl);
        ToastAndroid.show(
          'Please Upload Your GST Document. ',
          ToastAndroid.SHORT,
        );
        return;
      }
    }

    if (Object.keys(validationErrors).length === 0) {
      // Create a data object
      const formData = {
        phone: mobileNumber, // Assuming mobileNumber is the state value
        name: companyName,
        email: email, // Assuming email is the state value
        businessType: businessType, // Assuming businessType is the state value
        categories: selectedCategories,
        gstNumber: GstNumber,
        gstDocument: imageUrl,
      };

      // Send the data object to the next screen
      
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'companyName') {
      setCompanyName(value);
    } else if (field === 'mobileNumber') {
      setMobileNumber(value);
    } else if (field === 'GstNumber') {
      setGstNumber(value);
    } else if (field == 'email') {
      setemail(value);
    }

    // Validate the field whenever the user types
    validate();
  };

  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <ActivityIndicator color="gray" size={20} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.container}>
        <TouchableOpacity
          style={{marginBottom: 10, flexDirection: 'row'}}
          onPress={() => Navigation.goBack()}>
          <AntDesign name="left" size={20} />
          <Text> Back to Home</Text>
        </TouchableOpacity>

        {/* Step Indicator */}
        <View style={styles.header}>
          <View style={styles.progress}>
            <View style={[styles.progressStep, {backgroundColor: '#333'}]} />
            <View style={[styles.progressStep]} />
            <View style={styles.progressStep} />
          </View>
        </View>
        <View style={styles.row}>
          <Icons name="pencil-box" size={30} />
          <Text style={styles.headerText}>Social Seller</Text>
        </View>

        {/* Wrap the entire content in a ScrollView */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.label}>Full Name/Business Name</Text>
          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            placeholder="Enter company name"
            value={companyName}
            placeholderTextColor={'#777'}
            onChangeText={text => handleInputChange('companyName', text)}
          />
          {errors.companyName && (
            <Text style={styles.errorText}>{errors.companyName}</Text>
          )}

          {/* Mobile Number */}
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, errors.mobileNumber && styles.inputError]}
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={text => handleInputChange('mobileNumber', text)}
            keyboardType="numeric"
            maxLength={10} // Example: +999
            placeholderTextColor={'#777'}
          />
          {errors.mobileNumber && (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          )}

          {/* Business Type */}
          {/* <Text style={styles.label}>Business Type</Text>
          <Dropdown
            data={businessTypes}
            style={[
              styles.dropdown,
              errors.businessType && styles.dropdownError,
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Business Type"
            value={businessType}
            onChange={(item) => {
              setBusinessType(item.value);
              validate(); // Validate immediately after selection
            }}
          />
          {errors.businessType && (
            <Text style={styles.errorText}>{errors.businessType}</Text>
          )} */}

          {/* {businessType === 'brand' && (
            <>
              <Text style={styles.label}>GST Number</Text>
              <TextInput
                style={[styles.input, errors.GstNumber && styles.inputError]}
                placeholder="Enter GST number"
                value={GstNumber}
                onChangeText={text => handleInputChange('GstNumber', text)}
                placeholderTextColor={'#777'}
              />
              {errors.GstNumber && (
                <Text style={styles.errorText}>{errors.GstNumber}</Text>
              )}
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
          )} */}

          {/* Business Categories */}
          <Text style={styles.label}>Business Type</Text>

          {/* Scrollable Category Container */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal>
              {categories.length > 0
                ? categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.checkboxLabel,
                        selectedCategories.includes(category.categoryName) &&
                          styles.selectedCategory,
                      ]}
                      onPress={() =>
                        handleCategoryChange(category.categoryName)
                      }>
                      <Text
                        style={{
                          color: selectedCategories.includes(
                            category.categoryName,
                          )
                            ? 'white'
                            : 'black',
                        }}>
                        {selectedCategories.includes(category.categoryName) ? (
                          <Icons
                            name="checkbox-marked-circle-outline"
                            color="green"
                            size={20}
                          />
                        ) : null}{' '}
                        {category.categoryName}
                      </Text>
                    </TouchableOpacity>
                  ))
                : null}
            </ScrollView>
          </View>
          {errors.categories && (
            <Text style={styles.errorText}>{errors.categories}</Text>
          )}

          <Text style={styles.label}>Business Address </Text>
          <View style={styles.row}>
            <View style={{width: '50%'}}>
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={20} />
                <Text style={styles.label}>Street Address </Text>
              </View>

              <TextInput
                style={[styles.input]}
                placeholder="Enter Street Address"
                keyboardType="email-address"
                value={email}
                placeholderTextColor={'#777'}
                onChangeText={text => handleInputChange('email', text)}
              />
            </View>
            <View style={{width: '50%'}}>
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={20} />
                <Text style={styles.label}>City </Text>
              </View>
              <TextInput
                style={[styles.input]}
                placeholder="Enter city"
                keyboardType="email-address"
                value={email}
                placeholderTextColor={'#777'}
                onChangeText={text => handleInputChange('email', text)}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{width: '50%'}}>
              <View style={styles.row}>
                <Icons name="sign-real-estate" size={20} />
                <Text style={styles.label}>State </Text>
              </View>

              <TextInput
                style={[styles.input]}
                placeholder="Enter the State"
                keyboardType="email-address"
                value={email}
                placeholderTextColor={'#777'}
                onChangeText={text => handleInputChange('email', text)}
              />
            </View>
            <View style={{width: '50%'}}>
              <View style={styles.row}>
                <Icons name="office-building-outline" size={20} />
                <Text style={styles.label}>Pincode </Text>
              </View>
              <TextInput
                style={[styles.input]}
                placeholder="Enter Pincode"
                keyboardType="email-address"
                value={email}
                maxLength={6}
                placeholderTextColor={'#777'}
                onChangeText={text => handleInputChange('email', text)}
              />
            </View>
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleSubmit()}>
            <Text style={{fontSize: 16,color:'white'}}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  overlayContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F7CE45',
  },
  scrollContainer: {
    flexGrow: 1, // Ensures the ScrollView expands to fit content
  },
  uploadButton: {
    backgroundColor: '#222',
    padding: 12,
    height: 70,
    borderRadius: 8,
    gap: 10,
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 10,

    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 50,
    // borderColor: '#ddd',
    // borderWidth: 1,
    elevation: 3,
    backgroundColor: '#fff',
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
    // maxHeight: 200,
    // flexDirection:'row',
    // width: '100%',
    borderRadius: 8,
    // height:50,
    // borderColor: '#ddd',
    // borderWidth: 1,
    // paddingBotto
    gap: 10,

    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  checkboxContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: 'black',
    backgroundColor: 'white',
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    // borderWidth: 1,
    // borderColor: '#777/',
    marginBottom: 5,
    borderRadius: 8,
    textAlign: 'center',
  },
  selectedCategory: {
    fontWeight: 'bold',
    backgroundColor: '#1E1E1E',

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
