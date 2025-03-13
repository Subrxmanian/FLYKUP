import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For the success icon
import ConfettiCannon from 'react-native-confetti-cannon'; // For confetti explosion
import { useRoute } from '@react-navigation/native';
import Header from '../../SellerComponents/Header';
// { product, amount, isOrderPlaced, onClose }

const PaymentSuccess = ({navigation}) => {
  const route = useRoute();
  const data = route.params;
  const amount = data?.product?.productPrice;
  const product = data?.product;
  // const isOrderPlaced = true;
  const [isOrderPlaced,setisOrderPlaced]=useState(true)
  // console.log(data)

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#28a745" />
              </View>
              <Text style={styles.headerTitle}>Payment Successful!</Text>
              <Text style={styles.headerSubtitle}>
                Thank you for your purchase. Your order has been confirmed.
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.transactionInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Product</Text>
                    <Text style={styles.value}>{product?.title}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Order ID</Text>
                    <Text style={styles.value}>
                      {data?.orderID||'N/F'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalAmountRow}>
                    <Text style={styles.label}>Total Amount</Text>
                    <Text style={styles.amount}>₹{amount}</Text>
                  </View>
                </View>
              </View>

              {/* Next Steps */}
              <View style={styles.nextSteps}>
                <Text style={styles.sectionTitle}>What's Next?</Text>
                <View style={styles.stepsContainer}>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>1</Text>
                    <Text style={styles.stepText}>
                      You will receive an email confirmation with your order details shortly.
                    </Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>2</Text>
                    <Text style={styles.stepText}>
                      Track your order status in your account dashboard.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.viewOrderButton} onPress={()=>setisOrderPlaced(!isOrderPlaced)}>
                  <Text style={styles.buttonText}>View Order Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={()=>navigation.goBack()}
                  style={styles.continueShoppingButton}>
                  <Text style={[styles.buttonText, { color: 'green' }]}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {isOrderPlaced && (
            <ConfettiCannon
              count={200}
              origin={{ x: -10, y: 0 }}
              fallSpeed={2500}
              explosionSpeed={500}
              fadeOut={true}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up full height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  scrollViewContainer: {
    paddingBottom: 20, // Ensure some bottom spacing when scrolling
    marginTop:10,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: '#28a74520',
    padding: 16,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  detailsContainer: {
    marginTop: 10,
  },
  orderSummary: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: '#6c757d',
  },
  value: {
    fontWeight: 'bold',
    color: '#212529',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#28a745',
  },
  nextSteps: {
    marginTop: 20,
  },
  stepsContainer: {
    marginTop: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: 5,
    borderRadius: 50,
    width: 25,
    height: 25,
    textAlign: 'center',
    marginRight: 10,
  },
  stepText: {
    color: '#6c757d',
    fontSize: 14,
    flex: 1,
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 10,
  },
  viewOrderButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueShoppingButton: {
    backgroundColor: '#fff',
    borderColor: '#28a745',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PaymentSuccess;
