import { Modal, StyleSheet, View, Text, TouchableOpacity, Animated, Image, Alert, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

interface SideNavbarProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideNavbar({ visible, onClose }: SideNavbarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const logout = useAuthStore((state) => state.logout);
  const { setShowBookmarksOnly, showBookmarksOnly, getBookmarkedCourses, setShowEnrolledOnly, showEnrolledOnly, getEnrolledCourses } = useCourseStore();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false, // Changed to false for better compatibility
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const handleBookmarks = () => {
    const bookmarkedCourses = getBookmarkedCourses();
    if (bookmarkedCourses.length === 0) {
      Alert.alert(
        'No Bookmarks',
        'You haven\'t bookmarked any courses yet. Start exploring and bookmark your favorite courses!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowBookmarksOnly(!showBookmarksOnly);
    setShowEnrolledOnly(false); // Reset enrolled filter
    onClose();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onClose();
          },
        },
      ]
    );
  };

  const bookmarkedCount = getBookmarkedCourses().length;
  const enrolledCount = getEnrolledCourses().length;

  const handleHome = () => {
    // Reset all filters to show the main course list (home screen)
    setShowBookmarksOnly(false);
    setShowEnrolledOnly(false);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };
  const handleMyCourses = () => {
    const enrolledCourses = getEnrolledCourses();
    
    if (enrolledCourses.length === 0) {
      Alert.alert(
        'No Enrolled Courses',
        'You haven\'t enrolled in any courses yet. Browse our courses and enroll to start learning!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowEnrolledOnly(!showEnrolledOnly);
    setShowBookmarksOnly(false); // Reset bookmarks filter
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: opacityAnim }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={1} 
          onPress={handleClose}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.sidebar,
          { left: slideAnim }
        ]}
      >
        <SafeAreaView style={styles.sidebarContent} edges={['top', 'left', 'bottom']}>
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/VlogoNavbar.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handleHome}>
              <Ionicons 
                name={(!showBookmarksOnly && !showEnrolledOnly) ? "home" : "home-outline"} 
                size={24} 
                color={(!showBookmarksOnly && !showEnrolledOnly) ? "#007AFF" : "#333"} 
                style={styles.menuIcon} 
              />
              <Text style={[styles.menuText, (!showBookmarksOnly && !showEnrolledOnly) && styles.activeMenuText]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleMyCourses}>
              <Ionicons 
                name={showEnrolledOnly ? "school" : "school-outline"} 
                size={24} 
                color={showEnrolledOnly ? "#007AFF" : "#333"} 
                style={styles.menuIcon} 
              />
              <Text style={[styles.menuText, showEnrolledOnly && styles.activeMenuText]}>
                My Courses
              </Text>
              {enrolledCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{enrolledCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleBookmarks}>
              <Ionicons 
                name={showBookmarksOnly ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={showBookmarksOnly ? "#007AFF" : "#333"} 
                style={styles.menuIcon} 
              />
              <Text style={[styles.menuText, showBookmarksOnly && styles.activeMenuText]}>
                My Bookmarks
              </Text>
              {bookmarkedCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bookmarkedCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings-outline" size={24} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="power-outline" size={24} color="#FF3B30" style={styles.menuIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    height: 40,
    width: 120,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  menuItems: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  activeMenuText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutContainer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
