import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WasteCard() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.label}>Predicted Waste</Text>
        <Text style={styles.boldText}>25 kg</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Stocking Recommendation</Text>
        <Text style={styles.boldText}>Restock 80 kg tomorrow</Text>
        <Text>Sell leafy greens at a discount in the evening</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Waste Performance</Text>
        <Text style={styles.boldText}>🏆 Low-Waste Champion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { marginTop: 20 },
  card: {
    backgroundColor: "#f4f4f4", padding: 15, borderRadius: 10, marginVertical: 8
  },
  label: { fontWeight: "bold", marginBottom: 5 },
  boldText: { fontSize: 16, fontWeight: "bold", marginBottom: 5 }
});
