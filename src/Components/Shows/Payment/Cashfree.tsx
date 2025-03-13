import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for payment features
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // For other icons like credit card
import { useRoute } from "@react-navigation/native";
import api from "../../../Utils/Api"; // Adjust this import based on your API
import Header from "../../SellerComponents/Header";



const CashfreePaymentGateway = ({ navigation }: any) => {
  const route = useRoute();
  const item = route.params;
  const amount = item?.item?.productPrice;
  const numericAmount = parseInt(amount, 10);

  const handlePayment = async () => {
    try {
      // Call backend to create an order and get paymentSessionId
      const response = await api.post(`/cashfree/create-order`, {
        amount: numericAmount,
      });
  
      const  paymentSessionId  = response.data.paymentSessionId;
      const orderID=response.data.orderId

      const session = new CFSession(
        paymentSessionId,
        orderID,
        CFEnvironment.SANDBOX
      );
  
      CFPaymentGatewayService.setCallback({
        onVerify(orderID: string): void {
          console.log('Order ID is: ' + orderID);
          // Assuming a successful order verification
  
          navigation.navigate("PaymentSuccess", { orderID,product:item?.item });
        },
  
        onError(error: CFErrorResponse, orderID: string): void {
          console.log('Error: ' + JSON.stringify(error) + '\nOrder ID: ' + orderID);
          // navigation.navigate("PaymentFailed", { error,numericAmount });
        },
      });
  
      const theme = new CFThemeBuilder()
        .setNavigationBarBackgroundColor('#333')
        .setNavigationBarTextColor('#FFFFFF')
        .setButtonBackgroundColor('#FFC107')
        .setButtonTextColor('#FFFFFF')
        .setPrimaryTextColor('#212121')
        .setSecondaryTextColor('#757575')
        .build();
        // CFPaymentGatewayService.setEventSubscriber({
          // onReceivedEvent(eventName, map) {
          //     console.log('Event recieved on screen: ' +
          //         eventName +
          //         ' map: ' +
          //         JSON.stringify(map));
          // },
// });
  
      // If you want to use UPI checkout, you can use this:
      const upiPayment = new CFUPIIntentCheckoutPayment(session, theme);
      CFPaymentGatewayService.doUPIPayment(upiPayment);
  
      // const cardPayment = new CFCreditCardCheckoutPayment(session, theme,numericAmount);
      const dropPayment = new CFDropCheckoutPayment(session, null, theme);
      CFPaymentGatewayService.doPayment(dropPayment);
    } catch (error) {
      console.log("Error initiating payment:", error);
      // navigation.navigate("PaymentFailed", { error: error.message });
    }
  };
  
  return (
    <>
    <Header/>
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={styles.headerTitle}>Secure Payment</Text>
          </View>
          <View style={styles.headerLogoContainer}>
            <Text style={styles.headerText}>Protected by</Text>
            {/* <Image source={require("../assets/Cashfree.svg")} style={styles.logo} /> */}
          </View>
        </View>
{/* <PaymentSuccess/> */}
        <View style={styles.cardBody}>
          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <View style={styles.amountContent}>
              <Text style={styles.amountValue}>₹{numericAmount.toLocaleString("en-IN")}</Text>
              <Text style={styles.currency}>INR</Text>
            </View>
          </View>

          {/* Payment Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="shield" size={24} color="#6B7280" />
              <Text style={styles.featureText}>Secure Payment</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="credit-card" size={24} color="#6B7280" />
              <Text style={styles.featureText}>Multiple Options</Text>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton]}
            onPress={handlePayment}
            // disabled={!isSDKLoaded}
          >
            <Text style={styles.payButtonText}>Pay Securely</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By proceeding, you agree to our Terms and Conditions
            </Text>
          </View>
        </View>

        {/* Payment Methods Footer */}
        {/* <View style={styles.paymentMethodsContainer}>
          <Image source={require("../assets/visa.svg")} style={styles.paymentMethodLogo} />
          <Image source={require("../assets/mastercard.svg")} style={styles.paymentMethodLogo} />
          <Image source={require("../assets/upi-ar21.svg")} style={styles.paymentMethodLogo} />
        </View> */}
      </View>
    </View>
    {/* <PaymentSuccess isOrderPlaced={true}/> */}
    {/* <PaymentFailed/> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    marginRight: 8,
  },
  logo: {
    height: 40,
    resizeMode: "contain",
  },
  cardBody: {
    padding: 16,
  },
  amountContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  amountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  currency: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    marginLeft: 8,
    color: "#6B7280",
  },
  payButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  arrowIcon: {
    marginLeft: 10,
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  paymentMethodsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  paymentMethodLogo: {
    width: 30,
    height: 30,
    marginHorizontal: 8,
    resizeMode: "contain",
  },
});

export default CashfreePaymentGateway;
