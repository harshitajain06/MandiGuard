import React from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";

export default function OverviewScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>About Us</Text>

      {/* Illustration Section */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require("../../assets/images/mandi.jpg")}
          style={styles.image}
        />
      </View>

      {/* Overview Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.paragraph}>
          The MandiGuard web app aims to address the issue of food wastage in
          local markets (mandis), where vendors often overstock due to a lack of
          predictive planning tools. The app enables vendors or Self-Help Groups
          (SHGs) to input daily stock and sales data, receive waste forecasts
          using predictive models, and get smart inventory recommendations. This
          helps reduce overstocking, improve efficiency, and minimize food
          spoilage.
        </Text>
      </View>

      {/* Problem Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Problem</Text>
        <Text style={styles.paragraph}>
          Around 30–40% of food goes to waste in local markets. The app enables
          vendors or Self-Help Groups to input daily stock and sales data,
          receive waste forecasts using predictive models, and get smart
          inventory recommendations.
        </Text>
      </View>

      {/* Solution Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Solution</Text>
        <Text style={styles.paragraph}>
          MandiGuard web app aims to address issue of food wastage in local
          markets in mandis. Enables vendors or Self-Help Groups (SHGs) to input
          daily stock and sales data, receive waste forecasts using predictive
          models, and get smart inventory recommendations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7", // light cream background
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  illustrationWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#444",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: "#555",
  },
});
