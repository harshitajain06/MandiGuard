import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';

export default function AuthPage() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success', 'error', 'info'
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  // Toast message handler
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(loginPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerName.trim()) {
      errors.name = 'Full name is required';
    } else if (!validateName(registerName)) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!registerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      showToast('Login successful!', 'success');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCredential.user, {
        displayName: registerName,
      });
      showToast('Account created successfully!', 'success');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    }
  };

  return (
    <View style={styles.pageContainer}>
      {/* Toast Message */}
      {toastMessage ? (
        <View style={[
          styles.toast,
          toastType === 'error' && styles.toastError,
          toastType === 'success' && styles.toastSuccess,
          toastType === 'info' && styles.toastInfo,
        ]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
      {/* Logo Section */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Image
            source={require('../../assets/images/logoM.jpg')} // ✅ your logo image
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text style={styles.title}>
        {getTranslation('authTitle', language)}
      </Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setMode('login')}
          style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>{getTranslation('authLogin', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('register')}
          style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>{getTranslation('authRegister', language)}</Text>
        </TouchableOpacity>
      </View>

      {/* Forms */}
      {mode === 'login' ? (
        <View style={styles.form}>
          <Text style={styles.label}>{getTranslation('authEmail', language)}</Text>
          <TextInput
            placeholder="name@example.com"
            style={[
              styles.input,
              loginErrors.email && styles.inputError
            ]}
            value={loginEmail}
            onChangeText={(text) => {
              setLoginEmail(text);
              if (loginErrors.email) {
                setLoginErrors({ ...loginErrors, email: '' });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
          
          <Text style={styles.label}>{getTranslation('authPassword', language)}</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            style={[
              styles.input,
              loginErrors.password && styles.inputError
            ]}
            value={loginPassword}
            onChangeText={(text) => {
              setLoginPassword(text);
              if (loginErrors.password) {
                setLoginErrors({ ...loginErrors, password: '' });
              }
            }}
          />
          {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{getTranslation('authForgotPassword', language)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{getTranslation('authLoginButton', language)}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>{getTranslation('authName', language)}</Text>
          <TextInput
            placeholder="John Doe"
            style={[
              styles.input,
              registerErrors.name && styles.inputError
            ]}
            value={registerName}
            onChangeText={(text) => {
              setRegisterName(text);
              if (registerErrors.name) {
                setRegisterErrors({ ...registerErrors, name: '' });
              }
            }}
          />
          {registerErrors.name && <Text style={styles.errorText}>{registerErrors.name}</Text>}
          
          <Text style={styles.label}>{getTranslation('authEmail', language)}</Text>
          <TextInput
            placeholder="name@example.com"
            style={[
              styles.input,
              registerErrors.email && styles.inputError
            ]}
            value={registerEmail}
            onChangeText={(text) => {
              setRegisterEmail(text);
              if (registerErrors.email) {
                setRegisterErrors({ ...registerErrors, email: '' });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {registerErrors.email && <Text style={styles.errorText}>{registerErrors.email}</Text>}
          
          <Text style={styles.label}>{getTranslation('authPassword', language)}</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            style={[
              styles.input,
              registerErrors.password && styles.inputError
            ]}
            value={registerPassword}
            onChangeText={(text) => {
              setRegisterPassword(text);
              if (registerErrors.password) {
                setRegisterErrors({ ...registerErrors, password: '' });
              }
            }}
          />
          {registerErrors.password && <Text style={styles.errorText}>{registerErrors.password}</Text>}
          
          <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{getTranslation('authRegisterButton', language)}</Text>}
          </TouchableOpacity>
        </View>
      )}


      <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
        <Text style={styles.privacyPolicy}>{getTranslation('authPrivacyPolicy', language)}</Text>
      </TouchableOpacity>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPrivacyModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
    </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              <Text style={styles.privacySectionTitle}>1. Information We Collect</Text>
              <Text style={styles.privacyText}>
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include:
              </Text>
              <Text style={styles.privacyBullet}>• Name and email address</Text>
              <Text style={styles.privacyBullet}>• Stock and inventory data</Text>
              <Text style={styles.privacyBullet}>• Sales and waste prediction data</Text>
              <Text style={styles.privacyBullet}>• Usage analytics and app interactions</Text>

              <Text style={styles.privacySectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.privacyText}>
                We use the information we collect to:
              </Text>
              <Text style={styles.privacyBullet}>• Provide and improve our waste management services</Text>
              <Text style={styles.privacyBullet}>• Generate accurate predictions and analytics</Text>
              <Text style={styles.privacyBullet}>• Send you important updates about the service</Text>
              <Text style={styles.privacyBullet}>• Provide customer support</Text>

              <Text style={styles.privacySectionTitle}>3. Data Security</Text>
              <Text style={styles.privacyText}>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. Your data is encrypted 
                and stored securely using industry-standard practices.
              </Text>

              <Text style={styles.privacySectionTitle}>4. Data Sharing</Text>
              <Text style={styles.privacyText}>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy or as required by law.
              </Text>

              <Text style={styles.privacySectionTitle}>5. Your Rights</Text>
              <Text style={styles.privacyText}>
                You have the right to:
              </Text>
              <Text style={styles.privacyBullet}>• Access your personal data</Text>
              <Text style={styles.privacyBullet}>• Correct inaccurate information</Text>
              <Text style={styles.privacyBullet}>• Delete your account and data</Text>
              <Text style={styles.privacyBullet}>• Opt out of certain data processing</Text>

              <Text style={styles.privacySectionTitle}>6. Contact Us</Text>
              <Text style={styles.privacyText}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.privacyContact}>Email: privacy@mandiguard.com</Text>
              <Text style={styles.privacyContact}>Phone: +1 (555) 123-4567</Text>

              <Text style={styles.privacyLastUpdated}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </ScrollView>
      </View>
      </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    })
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: Platform.OS === 'web' ? 24 : 24,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: Platform.OS === 'web' ? 100 : 100,
    backgroundColor: '#fff',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: 420,
      alignSelf: 'center',
      width: '100%',
    })
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      maxWidth: 400,
      alignSelf: 'center',
      left: 'auto',
      right: 'auto',
    })
  },
  toastSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  toastError: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  toastInfo: {
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  toastText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 12 : 16,
  },
  iconCircle: {
    backgroundColor: '#e6f0ff',
    padding: Platform.OS === 'web' ? 12 : 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: Platform.OS === 'web' ? 60 : 80,
    height: Platform.OS === 'web' ? 60 : 80,
    borderRadius: Platform.OS === 'web' ? 15 : 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Platform.OS === 'web' ? 20 : 30,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'web' ? 16 : 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 8 : 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabBackground: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007bff',
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#212529',
  },
  form: {
    marginBottom: Platform.OS === 'web' ? 20 : 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: Platform.OS === 'web' ? 12 : 12,
    borderRadius: 8,
    marginBottom: Platform.OS === 'web' ? 8 : 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: Platform.OS === 'web' ? 14 : 16,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ':focus': {
        borderColor: '#007bff',
        boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
      }
    })
  },
  inputError: {
    borderColor: '#dc3545',
    ...(Platform.OS === 'web' && {
      ':focus': {
        borderColor: '#dc3545',
        boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.25)',
      }
    })
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#cce0ff',
    padding: Platform.OS === 'web' ? 12 : 14,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
      ':hover': {
        backgroundColor: '#b3d9ff',
        transform: 'translateY(-1px)',
      },
      ':active': {
        transform: 'translateY(0)',
      }
    })
  },
  buttonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 14 : 16,
  },
  updateText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#6c757d',
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    maxHeight: '80%',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  privacyBullet: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  privacyContact: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
    marginBottom: 4,
  },
  privacyLastUpdated: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});
