import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  ImageBackground,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { courseService } from '../services/course/courseService';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import CourseCarousel from '../components/CourseCarousel';
import CourseGrid from '../components/CourseGrid';
import ProfileScreen from './ProfileScreen';
import SideNavbar from '../components/SideNavbar';

export default function CourseListScreen() {
  const {
    courses,
    loading,
    showBookmarksOnly,
    showEnrolledOnly,
    setCourses,
    setInstructors,
    setLoading,
    loadUserData,
    getFilteredCourses,
    getBookmarkedCourses,
    getEnrolledCourses,
    setShowBookmarksOnly,
    setShowEnrolledOnly,
  } = useCourseStore();

  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [showSideNav, setShowSideNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [coursesResponse, instructorsResponse] = await Promise.all([
        courseService.getCourses(),
        courseService.getInstructors(),
      ]);

      // Handle nested response structure: response.data.data
      const coursesData = coursesResponse.data?.data || [];
      const instructorsData = instructorsResponse.data?.data || [];

      if (!Array.isArray(coursesData) || !Array.isArray(instructorsData)) {
        throw new Error('Invalid data format received from API');
      }

      // Assign random instructors to courses and add missing fields
      const coursesWithInstructors = coursesData.map((course, index) => {
        const instructor = instructorsData[index % instructorsData.length];
        
        return {
          ...course,
          _id: course.id?.toString() || `course-${index}`,
          description: course.description || 'No description available',
          image: {
            url: course.thumbnail || 'https://via.placeholder.com/300x200'
          },
          instructor: instructor,
          isBookmarked: false,
        };
      });

      setCourses(coursesWithInstructors);
      setInstructors(instructorsData);
    } catch (error: any) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      // Load user-specific data if user is logged in
      if (user?._id) {
        await loadUserData(user._id);
      }
      
      // Then fetch and set courses (which will apply the loaded statuses)
      await fetchData();
    };
    
    initializeData();
  }, [user?._id]);

  // Get filtered courses based on bookmark filter and search query
  const getSearchFilteredCourses = (courseList: any[]) => {
    if (!searchQuery.trim()) return courseList;
    
    return courseList.filter((course: any) => {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = course.title?.toLowerCase().includes(searchLower);
      const descriptionMatch = course.description?.toLowerCase().includes(searchLower);
      const instructorMatch = course.instructor?.first?.toLowerCase().includes(searchLower) ||
                             course.instructor?.last?.toLowerCase().includes(searchLower) ||
                             course.instructor?.title?.toLowerCase().includes(searchLower);
      
      return titleMatch || descriptionMatch || instructorMatch;
    });
  };

  const filteredCourses = getFilteredCourses();
  const searchFilteredCourses = getSearchFilteredCourses(filteredCourses);
  
  // Split courses into different sections
  const featuredCourses = searchFilteredCourses.slice(0, 5);
  const allOtherCourses = searchFilteredCourses.slice(5);
  
  // Get title based on current view
  const getScreenTitle = () => {
    if (showEnrolledOnly) {
      const enrolledCount = getEnrolledCourses().length;
      return `My Courses (${enrolledCount})`;
    }
    if (showBookmarksOnly) {
      const bookmarkedCount = getBookmarkedCourses().length;
      return `My Bookmarks (${bookmarkedCount})`;
    }
    if (searchQuery.trim()) {
      return `Search Results (${searchFilteredCourses.length})`;
    }
    return 'Featured Courses';
  };
  
  const getRecommendedTitle = () => {
    if (showEnrolledOnly) {
      return 'More Enrolled Courses';
    }
    if (showBookmarksOnly) {
      return 'More Bookmarked Courses';
    }
    if (searchQuery.trim()) {
      return 'More Search Results';
    }
    return 'Recommended For You';
  };

  const isHomeView = !showBookmarksOnly && !showEnrolledOnly && !searchQuery.trim();

  const getProfileInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSideNav(true)}
        >
          <View style={styles.menuIconContainer}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/VlogoNavbar.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          {!isHomeView && (
            <TouchableOpacity 
              style={styles.viewIndicator}
              onPress={() => {
                setShowBookmarksOnly(false);
                setShowEnrolledOnly(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="home" size={10} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.viewIndicatorText}>
                {showEnrolledOnly ? 'My Courses' : showBookmarksOnly ? 'Bookmarks' : 'Search'} • Tap for Home
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => setShowProfile(true)}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{getProfileInitial()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
        {/* Banner Image with Search Overlay */}
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../assets/images/banner12.png')} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.searchOverlay}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses, instructors..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Featured Courses Carousel with Auto-scroll - Overlapping banner */}
        <View style={styles.featuredCoursesContainer}>
          {featuredCourses.length > 0 && (
            <CourseCarousel 
              key={`featured-${showEnrolledOnly}-${showBookmarksOnly}-${searchQuery}`}
              courses={featuredCourses} 
              title={getScreenTitle()} 
              autoScroll={!showBookmarksOnly && !showEnrolledOnly}
              pauseAutoScroll={isAnyModalOpen}
              onModalStateChange={setIsAnyModalOpen}
            />
          )}
        </View>

        {/* Show All Courses Button when in bookmark, enrolled, or search mode */}
        {(showBookmarksOnly || showEnrolledOnly || searchQuery.trim()) && (
          <View style={styles.showAllContainer}>
            <TouchableOpacity 
              style={styles.showAllButton}
              onPress={() => {
                setShowBookmarksOnly(false);
                setShowEnrolledOnly(false);
                setSearchQuery(''); // Clear search query as well
              }}
            >
              <Ionicons name="home" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.showAllButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* All Other Courses Grid */}
        {allOtherCourses.length > 0 && (
          <CourseGrid 
            key={`grid-${showEnrolledOnly}-${showBookmarksOnly}-${searchQuery}`}
            courses={allOtherCourses} 
            title={getRecommendedTitle()} 
          />
        )}
      </ScrollView>
      </ImageBackground>

      {/* Bottom Navigation Background */}
      <View style={[styles.bottomNavBackground, { height: insets.bottom }]} />

      {/* Side Navigation */}
      {showSideNav && (
        <SideNavbar visible={showSideNav} onClose={() => setShowSideNav(false)} />
      )}

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ProfileScreen onClose={() => setShowProfile(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  menuIconContainer: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  logo: {
    height: 40,
    width: 120,
  },
  logoContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  viewIndicator: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  profileContainer: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  searchOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingRight: 8,
    height: 32,
    paddingVertical: 0,
  },
  searchIcon: {
    padding: 4,
  },
  featuredCoursesContainer: {
    zIndex: 1,
  },
  showAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  showAllButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },
});