import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator,
  Dimensions,
  Image, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/firebase';

export default function AuthPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
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
      contentContainerStyle={[
        styles.container,
        isDarkMode && { backgroundColor: '#121212' },
      ]}
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

      <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>
        Welcome to MandiGuard
      </Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setMode('login')}
          style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('register')}
          style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Forms */}
      {mode === 'login' ? (
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
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
          
          <Text style={styles.label}>Password</Text>
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
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
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
          
          <Text style={styles.label}>Email</Text>
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
          
          <Text style={styles.label}>Password</Text>
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
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* OAuth Buttons */}
      <OAuthButtons />

      <TouchableOpacity>
        <Text style={styles.privacyPolicy}>Privacy Policy.</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function OAuthButtons() {
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: '#6c757d' }}>Or continue with</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <TouchableOpacity style={styles.oauthButton} onPress={() => alert('Facebook login coming soon')}>
          <Text style={styles.oauthButtonText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthButton} onPress={() => alert('Google login coming soon')}>
          <Text style={styles.oauthButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
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
    padding: Platform.OS === 'web' ? 40 : 24,
    paddingTop: Platform.OS === 'web' ? 80 : 60,
    backgroundColor: '#fff',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: 500,
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
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: '#e6f0ff',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabBackground: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: 16,
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
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: Platform.OS === 'web' ? 16 : 16,
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
    padding: Platform.OS === 'web' ? 16 : 14,
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
    fontSize: Platform.OS === 'web' ? 16 : 16,
  },
  oauthButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'web' ? 14 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 10,
    flex: 1,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s, border-color 0.2s, transform 0.1s',
      ':hover': {
        backgroundColor: '#f8f9fa',
        borderColor: '#adb5bd',
        transform: 'translateY(-1px)',
      },
      ':active': {
        transform: 'translateY(0)',
      }
    })
  },
  oauthButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 14,
    fontWeight: '600',
    color: '#343a40',
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
});
