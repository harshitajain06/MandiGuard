import { Picker } from '@react-native-picker/picker';
import { doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, dailyDataRef, db } from '../../config/firebase';

export default function UpdateStockScreen() {
  const [entries, setEntries] = useState([]);
  const [selectedUID, setSelectedUID] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dailySold, setDailySold] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [predictedWaste, setPredictedWaste] = useState(null);
  const [restockRecommendation, setRestockRecommendation] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    if (!auth.currentUser) return;

    // 🔑 Fetch only the current user's entries
    const q = query(dailyDataRef, where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  useEffect(() => {
    const match = entries.find(entry => entry.uid === selectedUID);
    setSelectedEntry(match || null);
    setPredictedWaste(null);
    setRestockRecommendation('');
    setDailySold('');
  }, [selectedUID]);

  const handleUpdate = async () => {
    if (!dailySold || !selectedEntry) {
      alert("Please fill daily sold quantity.");
      return;
    }

    const { quantity, shelfLife, createdAt } = selectedEntry;

    const averageStock = quantity / shelfLife;
    const remainingDays = Math.max(
      0,
      Math.ceil((new Date(createdAt.toDate ? createdAt.toDate() : createdAt).getTime() + shelfLife * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 3600 * 24))
    );

    const wasteUnits = Math.max(0, (averageStock - dailySold) * remainingDays);

    let recommendation = '';
    if (dailySold > averageStock) {
      const restock = Math.round((dailySold - averageStock) * remainingDays);
      recommendation = `You may need to restock approx. ${restock} kg based on recent sales.`;
    } else if (dailySold < averageStock  && wasteUnits > 0) {
      recommendation = `❌ Sales are underperforming. 
      Current sales (${dailySold} kg) are below the expected average of ${averageStock.toFixed(1)} kg/day. 
      Risk of higher waste: approx. ${wasteUnits.toFixed(1)} kg may be wasted if sales do not improve.`;
    }

    setPredictedWaste(wasteUnits.toFixed(1));
    setRestockRecommendation(recommendation);
    setModalVisible(true);

    // 🔄 Update Firestore
    const docRef = doc(db, 'dailyData', selectedEntry.id);
    await updateDoc(docRef, {
      lastSold: parseFloat(dailySold),
      wastePredicted: parseFloat(wasteUnits.toFixed(1))
    });
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Update Daily Stock</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={onRefresh}>
          <Text style={styles.reloadButtonText}>🔄 Reload</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Select UID</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedUID}
          onValueChange={(value) => setSelectedUID(value)}
        >
          <Picker.Item label="Select UID" value="" />
          {entries.map((item) => (
            <Picker.Item key={item.uid} label={item.uid} value={item.uid} />
          ))}
        </Picker>
      </View>

      {selectedEntry && (
        <View style={styles.details}>
          <Text>Stock Type: {selectedEntry.stockType}</Text>
          <Text>Item: {selectedEntry.vegetable}</Text>
          <Text>Quantity: {selectedEntry.quantity} kg</Text>
          <Text>Shelf Life: {selectedEntry.shelfLife} days</Text>
        </View>
      )}

      <Text style={styles.label}>Today's Sold Quantity (kg)</Text>
      <TextInput
        keyboardType="numeric"
        value={dailySold}
        onChangeText={setDailySold}
        placeholder="e.g., 30"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Submit & Predict</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Prediction Result</Text>
            <Text style={styles.modalText}>Predicted Waste: {predictedWaste} kg</Text>
            {restockRecommendation ? (
              <Text style={styles.modalText}>{restockRecommendation}</Text>
            ) : (
              <Text style={styles.modalText}>You're within average limits ✅</Text>
            )}
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, flexGrow: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  reloadButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  label: { marginTop: 10, fontWeight: '600' },
  input: {
    backgroundColor: '#f4f4f4', borderRadius: 6, padding: 10, marginTop: 5
  },
  picker: {
    backgroundColor: '#f4f4f4', borderRadius: 6, marginTop: 5
  },
  button: {
    backgroundColor: '#f97316', padding: 12, borderRadius: 8, marginTop: 20
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', textAlign: 'center'
  },
  details: {
    backgroundColor: '#eef1f6', padding: 10, borderRadius: 6, marginTop: 10
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%', backgroundColor: '#fff', borderRadius: 10,
    padding: 20, alignItems: 'center'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, marginTop: 5, textAlign: 'center' }
});
