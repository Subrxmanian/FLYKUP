import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../SellerComponents/Header";

const PaymentFailed = ({navigation}) => {
  const route = useRoute();
  const data = route.params;

  return (
    <>
      <Header />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header */}
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="close-circle" size={48} color="#e74c3c" />
              </View>
              <Text style={styles.headerTitle}>Payment Failed!</Text>
              <Text style={styles.headerSubtitle}>
                We weren't able to process your payment. Please try again.
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              {/* Error Details */}
              <View style={styles.errorDetails}>
                <Text style={styles.sectionTitle}>Transaction Details</Text>
                <View style={styles.transactionInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>Failed</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.value}>₹{data?.numericAmount}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.errorMessage}>
                  <Text style={styles.errorText}>
                    {data?.error?.message || "Transaction was declined. Please check your payment details and try again."}
                  </Text>
                </View>
              </View>

              {/* Troubleshooting Steps */}
              <View style={styles.troubleshooting}>
                <Text style={styles.sectionTitle}>Troubleshooting Steps</Text>
                <View style={styles.troubleshootingSteps}>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>1</Text>
                    <Text style={styles.stepText}>
                      Verify that your card has sufficient funds and isn't expired.
                    </Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>2</Text>
                    <Text style={styles.stepText}>
                      Check if your card allows online/international transactions.
                    </Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>3</Text>
                    <Text style={styles.stepText}>
                      Ensure all payment details were entered correctly.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.retryButton} onPress={()=>navigation.goBack()}>
                  <Text style={[styles.buttonText, { color: 'white' }]}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.buttonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>Need help? Our support team is available 24/7</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  scrollViewContent: {
    paddingBottom: 20, // To add some bottom spacing when scrolling
    paddingHorizontal: 15, // To ensure content doesn't touch the edges
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: "#f8d7da",
    padding: 16,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
  },
  detailsContainer: {
    marginTop: 10,
  },
  errorDetails: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transactionInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    color: "#6c757d",
  },
  value: {
    fontWeight: "bold",
    color: "#212529",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
  },
  troubleshooting: {
    marginTop: 20,
  },
  troubleshootingSteps: {
    marginTop: 10,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepNumber: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    padding: 5,
    borderRadius: 50,
    width: 25,
    height: 25,
    textAlign: "center",
    marginRight: 10,
  },
  stepText: {
    color: "#6c757d",
    fontSize: 14,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    width: "48%", // Ensures both buttons fit side by side
  },
  contactButton: {
    borderColor: "#777",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    // width: "48%", // Ensures both buttons fit side by side
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#777", // Changed to white for visibility
  },
  helpText: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
    color: "#6c757d",
  },
});

export default PaymentFailed;
