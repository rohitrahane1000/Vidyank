import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth/authService';
import RobustImage from '../components/RobustImage';

interface ProfileScreenProps {
  onClose: () => void;
}

export default function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { user, accessToken, setUser, isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchUserProfile = async () => {
    const currentToken = useAuthStore.getState().accessToken;
    if (!currentToken) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await authService.getCurrentUser(currentToken);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      // Wait a bit for auth state to settle, then fetch profile
      const timer = setTimeout(() => {
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken) {
          fetchUserProfile();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Add a focus effect to refresh profile when screen becomes visible
  useEffect(() => {
    const refreshProfile = async () => {
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken && user) {
        try {
          const response = await authService.getCurrentUser(currentToken);
          if (response.success) {
            setUser(response.data);
          }
        } catch (error: any) {
          // Handle error silently
        }
      }
    };

    // Refresh profile data when component mounts or becomes visible
    refreshProfile();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Please grant photo library access to update your profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false, // Don't include base64 to reduce memory usage
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        await updateAvatar(selectedImage.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to open image picker: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateAvatar = async (imageUri: string) => {
    const currentToken = useAuthStore.getState().accessToken;
    
    if (!currentToken) {
      Alert.alert('Error', 'No access token available. Please try logging out and logging back in.');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const response = await authService.updateAvatar(currentToken, imageUri);
      
      if (response.success && response.data) {
        setUser(response.data);
        setImageError(false);
        
        setTimeout(async () => {
          try {
            const freshToken = useAuthStore.getState().accessToken;
            if (freshToken) {
              const freshProfile = await authService.getCurrentUser(freshToken);
              if (freshProfile.success) {
                setUser(freshProfile.data);
              }
            }
          } catch (error: any) {
            // Handle error silently
          }
        }, 2000);
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile picture');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      
      // Check if it's a network error
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        Alert.alert(
          'Network Error', 
          'Please check your internet connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => updateAvatar(imageUri) }
          ]
        );
      } else {
        Alert.alert('Error', `Failed to update profile picture: ${errorMessage}`);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getAvatarUrl = () => {
    if (imageError) {
      return null;
    }
    
    const avatarUrl = user?.avatar?.url;
    return avatarUrl || null;
  };

  const avatarUrl = getAvatarUrl();

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/VlogoNavbar.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not authenticated, show error state
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/VlogoNavbar.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please login to view your profile</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={onClose}
          >
            <Text style={styles.loginButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/VlogoNavbar.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileGrid}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => {
                pickImage();
              }}
              disabled={uploadingAvatar}
              activeOpacity={0.7}
            >
              {avatarUrl ? (
                <RobustImage
                  uri={avatarUrl}
                  style={styles.avatar}
                  onLoad={() => {
                    setImageError(false);
                  }}
                  onError={(error) => {
                    setImageError(true);
                  }}
                  fallbackComponent={
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <Text style={styles.placeholderAvatarText}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  }
                  retryCount={3}
                  retryDelay={1500}
                />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Text style={styles.placeholderAvatarText}>
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              
              {uploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfoContainer}>
              <Text style={styles.username}>{user?.username || 'Unknown User'}</Text>
              <Text style={styles.email}>{user?.email || 'No email'}</Text>
              
              {user?.isEmailVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user?.role || 'User'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Login Type</Text>
            <Text style={styles.infoValue}>{user?.loginType || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email Status</Text>
            <Text style={[styles.infoValue, user?.isEmailVerified ? styles.verified : styles.unverified]}>
              {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: 40,
    width: 120,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderAvatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  verified: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  unverified: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});