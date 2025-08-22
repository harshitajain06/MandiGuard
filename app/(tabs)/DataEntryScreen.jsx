import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, dailyDataRef, auth } from '../../config/firebase';
import { addDoc, getDocs, query, where } from 'firebase/firestore';

export default function HomeScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [stockType, setStockType] = useState("Vegetables");
  const [vegetable, setVegetable] = useState("Tomatoes");
  const [quantity, setQuantity] = useState("");
  const [shelfLife, setShelfLife] = useState("");

  const user = auth.currentUser; // Logged-in user

  // Generate unique UID: userId-stockType-date-XX
  const generateUID = async () => {
    const formattedDate = date.toISOString().split('T')[0];

    // Only fetch current user's entries for today & stockType
    const q = query(
      dailyDataRef,
      where("userId", "==", user.uid),
      where("date", "==", formattedDate),
      where("stockType", "==", stockType)
    );

    const snapshot = await getDocs(q);
    const count = snapshot.docs.length + 1;
    const suffix = count.toString().padStart(2, '0');
    return `${user.uid}-${stockType}-${formattedDate}-${suffix}`;
  };

  const handleSubmit = async () => {
    if (!quantity || !shelfLife) return alert("Please fill all fields");
    if (!user) return alert("User not logged in");

    try {
      const uid = await generateUID();
      await addDoc(dailyDataRef, {
        uid,
        userId: user.uid,   // 🔑 store userId
        date: date.toISOString().split('T')[0],
        stockType,
        vegetable,
        quantity: parseFloat(quantity),
        shelfLife: parseInt(shelfLife),
        createdAt: new Date()
      });
      alert(`Data saved! UID: ${uid}`);
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reduce Surplus Food Waste</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
          <Text>{date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Stock Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={stockType} onValueChange={setStockType}>
            <Picker.Item label="Fruits" value="Fruits" />
            <Picker.Item label="Vegetables" value="Vegetables" />
            <Picker.Item label="Cereals" value="Cereals" />
          </Picker>
        </View>

        <Text style={styles.label}>Item Name</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={vegetable} onValueChange={setVegetable}>
            <Picker.Item label="Tomatoes" value="Tomatoes" />
            <Picker.Item label="Spinach" value="Spinach" />
            <Picker.Item label="Wheat" value="Wheat" />
            <Picker.Item label="Mangoes" value="Mangoes" />
          </Picker>
        </View>

        <Text style={styles.label}>Stocked Quantity (kg)</Text>
        <TextInput
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="e.g., 100"
          style={styles.input}
        />

        <Text style={styles.label}>Shelf Life (in days)</Text>
        <TextInput
          keyboardType="numeric"
          value={shelfLife}
          onChangeText={setShelfLife}
          placeholder="e.g., 3"
          style={styles.input}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  form: { backgroundColor: "#f97316", borderRadius: 10, padding: 15 },
  label: { color: "#fff", marginTop: 10 },
  input: {
    backgroundColor: "#fff", padding: 10, borderRadius: 5, marginTop: 5
  },
  pickerContainer: {
    backgroundColor: "#fff", borderRadius: 5, marginTop: 5
  },
  submitButton: {
    backgroundColor: "#fff", marginTop: 15, padding: 12, borderRadius: 5
  },
  submitText: { color: "#f97316", fontWeight: "bold", textAlign: "center" }
});
