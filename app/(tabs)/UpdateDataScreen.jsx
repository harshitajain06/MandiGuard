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
  const [sellingPrice, setSellingPrice] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [predictedWaste, setPredictedWaste] = useState(null);
  const [restockRecommendation, setRestockRecommendation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [profitLoss, setProfitLoss] = useState(null);
  const [wasteReduction, setWasteReduction] = useState(null);

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
    setSellingPrice('');
  }, [selectedUID]);

  const handleUpdate = async () => {
    if (!dailySold || !sellingPrice || !selectedEntry) {
      alert("Please fill daily sold quantity and selling price.");
      return;
    }

    const { quantity, shelfLife, createdAt, purchasePrice } = selectedEntry;

    const averageStock = quantity / shelfLife;
    const remainingDays = Math.max(
      0,
      Math.ceil((new Date(createdAt.toDate ? createdAt.toDate() : createdAt).getTime() + shelfLife * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 3600 * 24))
    );

    const wasteUnits = Math.max(0, (averageStock - dailySold) * remainingDays);
    const soldUnits = Math.min(dailySold, averageStock * remainingDays);

    // Calculate profit/loss
    const totalPurchaseCost = quantity * (purchasePrice || 0);
    const totalSellingRevenue = soldUnits * parseFloat(sellingPrice);
    const wasteLoss = wasteUnits * (purchasePrice || 0);
    const netProfitLoss = totalSellingRevenue - totalPurchaseCost - wasteLoss;

    // Calculate waste reduction (compared to previous prediction if available)
    const previousWaste = selectedEntry.wastePredicted || 0;
    const wasteReductionAmount = Math.max(0, previousWaste - wasteUnits);

    let recommendation = '';
    if (dailySold > averageStock) {
      const restock = Math.round((dailySold - averageStock) * remainingDays);
      recommendation = `You may need to restock approx. ${restock} kg based on recent sales.`;
    } else if (dailySold < averageStock  && wasteUnits > 0) {
      recommendation = `❌ Sales are underperforming. 
      Current sales (${dailySold} kg) are below the expected average of ${averageStock.toFixed(1)} kg/day. 
      Risk of higher waste: approx. ${wasteUnits.toFixed(1)} kg may be wasted if sales do not improve.`;
    }

    // Add selling price calculation details
    if (sellingPrice && dailySold > 0) {
      const revenueFromSold = parseFloat(dailySold) * parseFloat(sellingPrice);
      recommendation += `\n\n💰 Revenue from ${dailySold} kg sold: ₹${revenueFromSold.toFixed(2)} (₹${sellingPrice}/kg × ${dailySold} kg)`;
    }

    // Add profit/loss insights to recommendation
    if (netProfitLoss > 0) {
      recommendation += `\n\n💰 Profit: ₹${netProfitLoss.toFixed(2)} (Revenue: ₹${totalSellingRevenue.toFixed(2)} - Costs: ₹${(totalPurchaseCost + wasteLoss).toFixed(2)})`;
    } else if (netProfitLoss < 0) {
      recommendation += `\n\n📉 Loss: ₹${Math.abs(netProfitLoss).toFixed(2)} (Revenue: ₹${totalSellingRevenue.toFixed(2)} - Costs: ₹${(totalPurchaseCost + wasteLoss).toFixed(2)})`;
    }

    if (wasteReductionAmount > 0) {
      recommendation += `\n\n🌱 Waste Reduced: ${wasteReductionAmount.toFixed(1)} kg compared to previous prediction`;
    }

    setPredictedWaste(wasteUnits.toFixed(1));
    setProfitLoss(netProfitLoss.toFixed(2));
    setWasteReduction(wasteReductionAmount.toFixed(1));
    setRestockRecommendation(recommendation);
    setModalVisible(true);

    // 🔄 Update Firestore
    const docRef = doc(db, 'dailyData', selectedEntry.id);
    await updateDoc(docRef, {
      lastSold: parseFloat(dailySold),
      sellingPrice: parseFloat(sellingPrice),
      wastePredicted: parseFloat(wasteUnits.toFixed(1)),
      profitLoss: parseFloat(netProfitLoss.toFixed(2)),
      wasteReduction: parseFloat(wasteReductionAmount.toFixed(1))
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
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>

      {/* Orange Box Container */}
      <View style={styles.orangeBox}>
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
            <Text style={styles.detailText}>Stock Type: {selectedEntry.stockType}</Text>
            <Text style={styles.detailText}>Item: {selectedEntry.vegetable}</Text>
            <Text style={styles.detailText}>Quantity: {selectedEntry.quantity} kg</Text>
            <Text style={styles.detailText}>Shelf Life: {selectedEntry.shelfLife} days</Text>
            {selectedEntry.purchasePrice && (
              <Text style={styles.detailText}>Purchase Price: ₹{selectedEntry.purchasePrice}/kg</Text>
            )}
            {selectedEntry.profitLoss !== undefined && (
              <Text style={[styles.detailText, { 
                color: selectedEntry.profitLoss >= 0 ? '#10B981' : '#EF4444',
                fontWeight: 'bold'
              }]}>
                Profit/Loss: ₹{selectedEntry.profitLoss}
              </Text>
            )}
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

        <Text style={styles.label}>Selling Price (₹ per kg)</Text>
        <TextInput
          keyboardType="numeric"
          value={sellingPrice}
          onChangeText={setSellingPrice}
          placeholder="e.g., 35"
          style={styles.input}
        />

        {selectedEntry && sellingPrice && dailySold && parseFloat(dailySold) > 0 && (
          <View style={styles.calculationCard}>
            <Text style={styles.calculationTitle}>Revenue Calculation</Text>
            <Text style={styles.calculationText}>
              {dailySold} kg × ₹{sellingPrice}/kg = ₹{(parseFloat(dailySold) * parseFloat(sellingPrice)).toFixed(2)}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Submit & Predict</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enhanced Prediction Result</Text>
            
            <View style={styles.predictionCard}>
              <Text style={styles.predictionLabel}>Predicted Waste</Text>
              <Text style={styles.predictionValue}>{predictedWaste} kg</Text>
            </View>

            {sellingPrice && dailySold && (
              <View style={styles.predictionCard}>
                <Text style={styles.predictionLabel}>Revenue from Sales</Text>
                <Text style={[styles.predictionValue, { color: '#3B82F6' }]}>
                  ₹{(parseFloat(dailySold) * parseFloat(sellingPrice)).toFixed(2)}
                </Text>
                <Text style={styles.predictionSubtext}>
                  {dailySold} kg × ₹{sellingPrice}/kg
                </Text>
              </View>
            )}

            {profitLoss !== null && (
              <View style={styles.predictionCard}>
                <Text style={styles.predictionLabel}>Profit/Loss</Text>
                <Text style={[styles.predictionValue, { 
                  color: parseFloat(profitLoss) >= 0 ? '#10B981' : '#EF4444'
                }]}>
                  ₹{profitLoss}
                </Text>
              </View>
            )}

            {wasteReduction !== null && parseFloat(wasteReduction) > 0 && (
              <View style={styles.predictionCard}>
                <Text style={styles.predictionLabel}>Waste Reduced</Text>
                <Text style={[styles.predictionValue, { color: '#10B981' }]}>
                  {wasteReduction} kg
                </Text>
              </View>
            )}

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
  orangeBox: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  label: { 
    marginTop: 10, 
    fontWeight: '600',
    color: '#fff',
    fontSize: 16
  },
  input: {
    backgroundColor: '#fff', 
    borderRadius: 6, 
    padding: 12, 
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  picker: {
    backgroundColor: '#fff', 
    borderRadius: 6, 
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  button: {
    backgroundColor: '#fff', 
    padding: 14, 
    borderRadius: 8, 
    marginTop: 20
  },
  buttonText: {
    color: '#f97316', 
    fontWeight: 'bold', 
    textAlign: 'center',
    fontSize: 16
  },
  details: {
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 6, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  detailText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 4
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%', backgroundColor: '#fff', borderRadius: 10,
    padding: 20, alignItems: 'center', maxHeight: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalText: { fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20 },
  predictionCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center'
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  predictionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  predictionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic'
  },
  calculationCard: {
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4
  },
  calculationText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600'
  }
});
