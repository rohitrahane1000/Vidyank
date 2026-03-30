import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { authService } from '../services/auth/authService';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { setUser, setTokens } = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await authService.login({
        username,
        password,
      });
      
      if (response.success) {
        setSuccessMessage('Login successful!');
        
        // Store tokens first
        if (response.data.accessToken && response.data.refreshToken) {
          await setTokens(response.data.accessToken, response.data.refreshToken);
        }
        
        // Then set user (this will trigger user-specific data loading)
        setUser(response.data.user);
        
        // Navigate to course list after successful login
        setTimeout(() => {
          setSuccessMessage('');
        }, 1000);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      let displayError = '';
      
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        displayError = errorData.errors.map((err: any) => {
          const key = Object.keys(err)[0];
          return err[key];
        }).join(', ');
      } else {
        displayError = errorData?.message || 'Login failed';
      }
      
      setErrorMessage(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await authService.register({
        email,
        password,
        username,
        role: 'USER',
      });
      
      if (response.success) {
        setSuccessMessage(response.message);
        setUser(response.data.user);
        
        // Switch to login after 2 seconds
        setTimeout(() => {
          setIsSignup(false);
          setSuccessMessage('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      }
    } catch (error: any) {
      // Handle validation errors
      const errorData = error.response?.data;
      let displayError = '';
      
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        displayError = errorData.errors.map((err: any) => {
          const key = Object.keys(err)[0];
          return err[key];
        }).join(', ');
      } else {
        displayError = errorData?.message || 'Registration failed';
      }
      
      setErrorMessage(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/backkk1.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Image 
                source={require('../assets/images/VlogoNavbar.png')} 
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>
              <Text style={styles.subtitle}>{isSignup ? 'Sign up to get started' : 'Sign in to continue'}</Text>

              {successMessage ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>✓ {successMessage}</Text>
                </View>
              ) : null}

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {isSignup && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                />
              </View>

              {isSignup && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                </View>
              )}

              {/* {!isSignup && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )} */}

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={isSignup ? handleSignup : handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => {
                  setIsSignup(!isSignup);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}>
                  <Text style={styles.signupLink}>{isSignup ? 'Login' : 'Sign Up'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  successText: {
    color: '#155724',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
