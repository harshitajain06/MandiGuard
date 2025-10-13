import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { addDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, dailyDataRef } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';

export default function HomeScreen() {
  const { language } = useLanguage();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [stockType, setStockType] = useState("Vegetables");
  const [vegetable, setVegetable] = useState("Tomatoes");
  const [quantity, setQuantity] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const user = auth.currentUser; // Logged-in user

  // Comprehensive item lists by category
  const itemOptions = {
    Vegetables: [
      "Tomatoes", "Potatoes", "Onions", "Spinach", "Cabbage", "Cauliflower",
      "Broccoli", "Carrots", "Beetroot", "Radish", "Turnip", "Pumpkin",
      "Bottle Gourd", "Ridge Gourd", "Bitter Gourd", "Snake Gourd", "Okra",
      "Eggplant", "Bell Pepper", "Green Chili", "Ginger", "Garlic",
      "Coriander", "Mint", "Fenugreek", "Lettuce", "Cucumber", "Zucchini",
      "Green Beans", "Peas", "Corn", "Mushrooms", "Drumstick"
    ],
    Fruits: [
      "Mangoes", "Apples", "Bananas", "Oranges", "Grapes", "Watermelon",
      "Muskmelon", "Papaya", "Pineapple", "Guava", "Pomegranate", "Strawberries",
      "Litchi", "Cherries", "Peaches", "Plums", "Pears", "Kiwi",
      "Dragon Fruit", "Avocado", "Custard Apple", "Sweet Lime", "Lemon",
      "Coconut", "Dates", "Figs", "Jackfruit", "Berries", "Sapota"
    ],
    Cereals: [
      "Wheat", "Rice", "Barley", "Corn", "Oats", "Millet",
      "Sorghum", "Quinoa", "Rye", "Buckwheat", "Amaranth",
      "Pearl Millet", "Finger Millet", "Foxtail Millet"
    ]
  };

  // Update vegetable when stockType changes
  const handleStockTypeChange = (newStockType) => {
    setStockType(newStockType);
    // Set default item for the new stock type
    setVegetable(itemOptions[newStockType][0]);
  };

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
    if (!quantity || !shelfLife || !purchasePrice) {
      setErrorMessage(getTranslation('errorFillAllFields', language));
      setShowErrorModal(true);
      return;
    }
    if (!user) {
      setErrorMessage(getTranslation('errorUserNotLoggedIn', language));
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
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
        purchasePrice: parseFloat(purchasePrice),
        createdAt: new Date()
      });
      setShowSuccessModal(true);
      setQuantity("");
      setShelfLife("");
      setPurchasePrice("");
    } catch (error) {
      console.error("Error saving data: ", error);
      setErrorMessage("Error adding stock. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{getTranslation('stockInTitle', language)}</Text>
      </View>

      <View style={styles.orangeBox}>
        <Text style={styles.label}>{getTranslation('stockInDate', language)}</Text>
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

        <Text style={styles.label}>{getTranslation('stockInStockType', language)}</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={stockType} onValueChange={handleStockTypeChange}>
            <Picker.Item label={getTranslation('stockInFruits', language)} value="Fruits" />
            <Picker.Item label={getTranslation('stockInVegetables', language)} value="Vegetables" />
            <Picker.Item label={getTranslation('stockInCereals', language)} value="Cereals" />
          </Picker>
        </View>

        <Text style={styles.label}>{getTranslation('stockInItemName', language)}</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={vegetable} onValueChange={setVegetable}>
            {itemOptions[stockType].map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>{getTranslation('stockInQuantity', language)}</Text>
        <TextInput
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="e.g., 100"
          style={styles.input}
        />

        <Text style={styles.label}>{getTranslation('stockInShelfLife', language)}</Text>
        <TextInput
          keyboardType="numeric"
          value={shelfLife}
          onChangeText={setShelfLife}
          placeholder="e.g., 3"
          style={styles.input}
        />

        <Text style={styles.label}>{getTranslation('stockInPurchasePrice', language)}</Text>
        <TextInput
          keyboardType="numeric"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="e.g., 25"
          style={styles.input}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{getTranslation('stockInSubmit', language)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              {getTranslation('stockInTitle', language)} data has been saved successfully.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>❌</Text>
            </View>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={[styles.modalButton, styles.errorButton]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    })
  },
  container: { 
    padding: 20, 
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { 
    fontSize: Platform.OS === 'web' ? 28 : 24, 
    fontWeight: 'bold',
    color: '#1e293b',
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
  pickerContainer: {
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
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
      ':hover': {
        backgroundColor: '#94a3b8',
        transform: 'none',
        boxShadow: 'none',
      }
    })
  },
  buttonText: { 
    color: '#f97316', 
    fontWeight: 'bold', 
    textAlign: 'center',
    fontSize: 16
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    })
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 30,
  },
  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#2563eb',
      }
    })
  },
  errorButton: {
    backgroundColor: '#ef4444',
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: '#dc2626',
      }
    })
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
