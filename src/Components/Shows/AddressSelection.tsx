import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';  // Importing Material Icons
import api from "../../Utils/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({ selectedAddress, onSelectAddress, onNext, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    alternateMobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const fetchAddressesByUserId = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userId=await AsyncStorage.getItem('userID')
      const response = await api.get(`/address/${userId}`);

   
      const result = await response.data;
      if (result.status && result.data) {
        setAddresses(result.data);
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
      fetchAddressesByUserId();
  
  }, []);

  const handleSubmit = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId')
      const response = await api.post(`/address/${userId}`, 
        formData
      );

      setShowModal(false);
      setFormData({
        name: "",
        mobile: "",
        alternateMobile: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });

      // Refresh addresses after successful submission
      await fetchAddressesByUserId();
    } catch (error) {
      console.error("Address submission error:", error);
      Alert.alert("Error", "Error saving address. Please try again.");
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Delivery Address</Text>
      </View>

      <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
        <Icon name="add" size={24} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Address List Here */}
      <View style={styles.addressList}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading addresses...</Text>
        ) : error ? (
          <Text style={styles.errorText}>Error loading addresses: {error}</Text>
        ) : addresses.length === 0 ? (
          <Text style={styles.emptyText}>No saved addresses found. Add a new address to continue.</Text>
        ) : (
          addresses.map((addressItem) => (
            <TouchableOpacity
              key={addressItem._id}
              style={[
                styles.addressItem,
                selectedAddress?._id === addressItem._id ? styles.selectedAddress : {},
              ]}
              onPress={() => onSelectAddress(addressItem)}
            >
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{addressItem.name}</Text>
                <Text style={styles.addressDetails}>
                  {addressItem.line1}, {addressItem.line2}, {addressItem.city}, {addressItem.state} - {addressItem.pincode}
                </Text>
                <Text style={styles.addressPhone}>{addressItem.mobile}</Text>
                {addressItem.alternateMobile && <Text style={styles.addressPhone}>{addressItem.alternateMobile}</Text>}
              </View>
              {selectedAddress?._id === addressItem._id && <Icon name="check-circle" size={20} color="green" />}
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={[styles.confirmButton, { opacity: selectedAddress ? 1 : 0.5 }]}
        disabled={!selectedAddress}
      >
        <Text style={styles.confirmButtonText}>Confirm Address</Text>
      </TouchableOpacity>

      {/* Address Form Modal */}
      <Modal
       visible={showModal} 
       animationType="none"
       transparent={true}
       onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalHeader}>Add New Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={'#777'}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            placeholderTextColor={'#777'}
            value={formData.mobile}
            onChangeText={(text) => handleChange("mobile", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Alternate Mobile"
            keyboardType="phone-pad"
            placeholderTextColor={'#777'}
            value={formData.alternateMobile}
            onChangeText={(text) => handleChange("alternateMobile", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address Line 1"
            value={formData.line1}
            placeholderTextColor={'#777'}
            onChangeText={(text) => handleChange("line1", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address Line 2"
            value={formData.line2}
            placeholderTextColor={'#777'}
            onChangeText={(text) => handleChange("line2", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={'#777'}
            value={formData.city}
            onChangeText={(text) => handleChange("city", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={'#777'}
            value={formData.state}
            onChangeText={(text) => handleChange("state", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor={'#777'}
            maxLength={6}
            value={formData.pincode}
            onChangeText={(text) => handleChange("pincode", text)}
            keyboardType="number-pad"
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { marginRight: 8 },
  headerText: { fontSize: 24, fontWeight: "bold" },
  addButton: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#6200EE", borderRadius: 8, marginBottom: 16 },
  addButtonText: { color: "#fff", marginLeft: 8 },
  addressList: { marginBottom: 16 },
  addressItem: { padding: 16, backgroundColor: "#fff", borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  selectedAddress: { borderColor: "#6200EE", backgroundColor: "#f3f3f3" },
  addressInfo: { marginBottom: 8 },
  addressName: { fontWeight: "bold" },
  addressDetails: { color: "#555" },
  addressPhone: { color: "#555" },
  confirmButton: { backgroundColor: "#4CAF50", padding: 16, borderRadius: 8, alignItems: "center" },
  confirmButtonText: { color: "#fff", fontWeight: "bold" },
  modal: { backgroundColor: "#fff", padding: 10, borderRadius: 8,
    // height:400

   },
  modalHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  input: { borderColor: "#ddd", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  saveButton: { backgroundColor: "#6200EE", padding: 12, borderRadius: 8, alignItems: "center" },
  saveButtonText: { color: "#fff" },
  errorText: { color: "red" },
  loadingText: { textAlign: "center", marginTop: 16 },
  emptyText: { textAlign: "center", marginTop: 16 },
});

