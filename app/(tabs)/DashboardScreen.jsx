import React from "react";
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function OverviewScreen() {
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section with Background Image */}
      <View style={styles.heroSection}>
        <Image
          source={require("../../assets/images/mandi.jpg")}
          style={styles.backgroundImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>MandiGuard</Text>
          <Text style={styles.heroSubtitle}>
            Reducing Food Waste in Local Markets Through Smart Analytics
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
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

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📊 Analytics</Text>
            <Text style={styles.featureText}>
              Real-time waste prediction and inventory analytics
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🎯 Smart Recommendations</Text>
            <Text style={styles.featureText}>
              AI-powered suggestions for optimal stock levels
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📱 Easy to Use</Text>
            <Text style={styles.featureText}>
              Simple interface for vendors and SHGs
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🌱 Sustainable</Text>
            <Text style={styles.featureText}>
              Reduce food waste and improve market efficiency
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    })
  },
  heroSection: {
    position: 'relative',
    height: Platform.OS === 'web' ? 400 : 300,
    width: '100%',
    marginBottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 28 : 24,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
  },
  contentSection: {
    padding: Platform.OS === 'web' ? 40 : 16,
    ...(Platform.OS === 'web' && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    })
  },
  card: {
    backgroundColor: "#fff",
    padding: Platform.OS === 'web' ? 24 : 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    })
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2d3748",
  },
  paragraph: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    lineHeight: Platform.OS === 'web' ? 28 : 22,
    color: "#4a5568",
  },
  featuresGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    ...(Platform.OS === 'web' && {
      gap: 20,
    })
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flex: Platform.OS === 'web' ? '1 1 calc(50% - 10px)' : 1,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      }
    })
  },
  featureTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 24 : 20,
  },
});
