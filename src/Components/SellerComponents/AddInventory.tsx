import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ToastAndroid,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ColorPicker from 'react-native-wheel-color-picker';
import {ActivityIndicator} from 'react-native-paper';
import api from '../../Utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InventoryList = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [lowLevelThreshold, setLowLevelThreshold] = useState('');
  const [items, setItems] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const Navigation = useNavigation();
  const [color, setColor] = useState('#ff0000');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState('');

  const [errors, setErrors] = useState({
    productName: '',
    productDescription: '',
    lowLevelThreshold: '',
    quantity: '',
    expiryDate: '',
  });

  const validate = () => {
    const newErrors = {};

    // Check for required fields
    if (!productName) newErrors.productName = 'Product name is required';
    if (!productDescription)
      newErrors.productDescription = 'Description is required';
    if (!lowLevelThreshold)
      newErrors.lowLevelThreshold = 'Low level threshold is required';

    // Validate quantity
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0)
      newErrors.quantity = 'Please enter a valid quantity';

    // Check if expiry date is in the future
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const currentDate = new Date();
      const expiry = new Date(expiryDate);

      if (expiry <= currentDate) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    // Set and return errors
    setErrors(newErrors);
    return newErrors;
  };

  const handleAddItem = () => {
    validate();

    
    if (quantity>0) {
      // Logic for handling 'sizeColorQuantity'
      if (type === 'sizeColorQuantity') {
        // Check if item with the same color already exists
        const existingItem = items.find(item => item.color === color && item.size === size);
        
        if (existingItem) {
          // If item with the same color and size exists, update the quantity
          existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
          const updatedItems = [...items];
          setItems(updatedItems);
        } else {
          // If item doesn't exist, add a new item with the same color
          setItems([...items, {color, size, quantity, type}]);
        }
      } else {
        // Default behavior for other types (just add new item without color checks)
        setItems([...items, {color, size, quantity, type}]);
      }
      
      // Reset fields after adding item
      // setColor('#000000');
      setSize('');
      // setQuantity('');
      // setType('');
    }
  };
  

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expiryDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpiryDate(currentDate);
  };

  const difference = [
    {label: 'Quantity', value: 'quantity'},
    {label: 'Color + Quantity', value: 'colorQuantity'},
    {label: 'Size + Quantity', value: 'sizeQuantity'},
    {label: 'Size + Color + Quantity', value: 'sizeColorQuantity'},
  ];

  const sizes =[
    { label: "Extra Small", value: "extra_small" },
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
    { label: "Extra Large", value: "extra_large" },
    { label: "2XL", value: "2xl" },
    { label: "3XL", value: "3xl" },
    { label: "4XL", value: "4xl" },
    { label: "5XL", value: "5xl" },
    { label: "Big", value: "big" },
    { label: "Regular", value: "regular" },
    { label: "Free Size", value: "free_size" },
    { label: "One Size Fits All", value: "one_size_fits_all" },
    { label: "24", value: "24" },
    { label: "26", value: "26" },
    { label: "28", value: "28" },
    { label: "30", value: "30" },
    { label: "32", value: "32" },
    { label: "33", value: "33" },
    { label: "34", value: "34" },
    { label: "35", value: "35" },
    { label: "36", value: "36" },
    { label: "38", value: "38" },
    { label: "40", value: "40" },
    { label: "42", value: "42" },
    { label: "44", value: "44" },
    { label: "46", value: "46" },
    { label: "48", value: "48" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "11", value: "11" },
    { label: "12", value: "12" },
    { label: "13", value: "13" },
    { label: "14", value: "14" },
    { label: "14.5", value: "14.5" },
    { label: "15", value: "15" },
    { label: "15.5", value: "15.5" },
    { label: "16", value: "16" },
    { label: "16.5", value: "16.5" },
    { label: "17", value: "17" },
    { label: "17.5", value: "17.5" },
    { label: "18", value: "18" }
  ]
  

  const handleRemoveItem = index => {
    const updatedItems = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(updatedItems);
  };
  const [loading, setloading] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setloading(true);
      try {
        const id = await AsyncStorage.getItem('userId');
        const user = await api.get(`/user/id/${id}`);
  
        if (user) {
          let totalQuantity = 0;
          let inventory = [];
          // console.log("from inventory",items)
          // Loop through items to create payload based on the type
          items.forEach(item => {
            // If the type is 'quantity', add item with only quantity
            if (item.type == 'quantity') {
              inventory.push({
                color: null,   // No color for 'quantity' type
                size: null,    // No size for 'quantity' type
                quantity: parseInt(item.quantity), // Only quantity
                addMoreQuantity: 0,
                sizes: []      // No sizes field for 'quantity' type
              });
              console.log({
                color: null,   // No color for 'quantity' type
                size: null,    // No size for 'quantity' type
                quantity: parseInt(item.quantity), // Only quantity
                addMoreQuantity: 0,
                sizes: []      // No sizes field for 'quantity' type
              },"from inventory")
            } 
            // Check for 'sizeColorQuantity' type
            else if (item.type === 'sizeColorQuantity') {
              const existingItem = inventory.find(inventoryItem => inventoryItem.color === item.color);
              if (existingItem) {
                existingItem.sizes.push({ size: item.size, quantity: parseInt(item.quantity) });
              } else {
                inventory.push({
                  color: item.color,
                  size: null,
                  addMoreQuantity: 0,
                  sizes: [{ size: item.size, quantity: parseInt(item.quantity), addMoreQuantity: 0 }]
                });
              }
            }
            // Check for 'sizeQuantity' type
            else if (item.type === 'sizeQuantity') {
              inventory.push({
                color: null,
                size: item.size,
                quantity: parseInt(item.quantity),
                addMoreQuantity: 0,
                sizes: []
              });
            } 
            // Check for 'colorQuantity' type
            else if (item.type === 'colorQuantity') {
              inventory.push({
                color: item.color,
                size: null,
                quantity: parseInt(item.quantity),
                addMoreQuantity: 0,
                sizes: []
              });
            }
  
            // Calculate total quantity
            totalQuantity += parseInt(item.quantity);
          });
      
    
          const response = await api.post(`/seller/inventory/add`, {
            sellerId: user.data.data.sellerInfo._id,
            inventoryName: productName,
            description: productDescription,
            expiryDate: expiryDate,
            totalQuantity: totalQuantity,
            lowLevelThreshold: lowLevelThreshold,
            inventoryType: type,
            inventory: inventory,
          });
  
          ToastAndroid.show("Inventory added successfully!",ToastAndroid.SHORT);
        }
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setloading(false);
      }
    } else {
      ToastAndroid.show('Please fill out all fields correctly.', ToastAndroid.SHORT);
    }
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
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => Navigation.goBack()}>
        <AntDesign name="left" size={20} />
        <Text style={styles.backButtonText}>Back </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.label,
            {fontSize: 16, alignSelf: 'center', fontWeight: '800'},
          ]}>
          Add Item to Inventory
        </Text>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={productName}
          placeholderTextColor={'#777'}
          onChangeText={setProductName}
          placeholder="Enter product name"
        />
        {errors.productName ? (
          <Text style={styles.errorText}>{errors.productName}</Text>
        ) : null}

        <Text style={styles.label}>Product Description</Text>
        <TextInput
          style={[styles.input]}
          value={productDescription}
          placeholderTextColor={'#777'}
          onChangeText={setProductDescription}
          placeholder="Enter product description"
        />
        {errors.productDescription ? (
          <Text style={styles.errorText}>{errors.productDescription}</Text>
        ) : null}

        <Text style={styles.label}>Expiry Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={{fontSize: 16}}>{expiryDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={expiryDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {errors.expiryDate ? (
          <Text style={styles.errorText}>{errors.expiryDate}</Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Select Type</Text>
          <Dropdown
            data={difference}
            labelField={'label'}
            value={type}
            style={[styles.dateButton, {padding: 10}]}
            valueField={'value'}
            onChange={item =>{
              setItems([])
              setType(item.value)}}
          />

          {type !== 'quantity' && (
            <>
              {type === 'colorQuantity' || type === 'sizeColorQuantity' ? (
                <>
                  <Text style={styles.label}>Color</Text>
                  {/* Color Picker */}
                  <ColorPicker
                    color={color}
                    onColorChange={value => setColor(value)}
                    thumbSize={40}
                    sliderSize={20}
                    noSnap={true}
                    gapSize={30}
                    // onColorChangeComplete={false}
                    shadeSliderThumb={true}
                    row={true}
                  />
                </>
              ) : null}

              {type === 'sizeQuantity' || type === 'sizeColorQuantity' ? (
                <>
                  <Text style={styles.label}>Size</Text>
                  <Dropdown
                    data={sizes}
                    labelField={'label'}
                    searchPlaceholderTextColor="#777"
                    searchPlaceholder="search"
                    search
                    value={size}
                    style={[styles.dateButton, {padding: 10}]}
                    valueField={'value'}
                    placeholder="Select size"
                    onChange={item => setSize(item.value)}
                  />
                </>
              ) : null}
            </>
          )}

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholderTextColor={'#777'}
            placeholder="Enter quantity"
          />
          {errors.quantity ? (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleAddItem}
            style={[
              styles.dateButton,
              {
                backgroundColor: '#28ba00',
                alignItems: 'center',
                gap: 10,
                alignSelf: 'center',
                justifyContent: 'center',
                elevation: 2,
                width: '40%',
                flexDirection: 'row',
              },
            ]}>
            <AntDesign name="plus" color="white" size={20} />
            <Text style={{fontSize: 16, color: 'white', fontWeight: 'bold'}}>
              Add Item
            </Text>
          </TouchableOpacity>

          {items.length <= 0 ? null : (
            <>
              <Text style={styles.label}>Items List</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.item}>
                 
                  {item.color? <View style={styles.itemRow}>
                    <Text style={styles.itemLabel}>Color</Text>
                    <View style={{flexDirection: 'row', gap: 5}}>
                      <View
                        style={[
                          styles.colorIndicator,
                          {backgroundColor: item.color},
                        ]}
                      />
                      <Text style={styles.itemValue}>{item.color}</Text>
                    </View>
                  </View>:null}
                  <View style={styles.itemRow}>
                    <Text style={styles.itemLabel}>Quantity</Text>
                    <Text style={styles.itemValue}>{item.quantity}</Text>
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemLabel}>Type</Text>
                    <Text style={styles.itemValue}>{item.type}</Text>
                  </View>
                  {item.size?
                   <View style={styles.itemRow}>
                    <Text style={styles.itemLabel}>Size</Text>
                    <Text style={styles.itemValue}>{item.size}</Text>
                  </View>:null}
                 

                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    style={styles.removeButton}>
                    <AntDesign name="delete" size={20} color="white" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>

        <Text style={styles.label}>Low Level Threshold</Text>
        <TextInput
          style={styles.input}
          value={lowLevelThreshold}
          onChangeText={setLowLevelThreshold}
          placeholderTextColor={'#777'}
          keyboardType="numeric"
          placeholder="Enter low level threshold"
        />
        {errors.lowLevelThreshold ? (
          <Text style={styles.errorText}>{errors.lowLevelThreshold}</Text>
        ) : null}

        <TouchableOpacity onPress={handleSubmit} style={styles.buttonsubmit}>
          {loading ? (
            <ActivityIndicator color="white" size={20} />
          ) : (
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>Submit</Text>
          )}
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemValue: {
    textTransform: 'lowercase',
    fontWeight: '600',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20, // Add padding at the bottom for better scrolling
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  backButtonText: {
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonsubmit: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgb(255 190 0)',
    marginTop: 20,
  },
  dateButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    padding: 10,
    height: 50,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'left',
  },
  item: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    lineHeight: 20,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 12,
    width: 100,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  colorIndicator: {
    height: 15,
    width: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default InventoryList;
