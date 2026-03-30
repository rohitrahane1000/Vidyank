import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/course';
import { useCourseStore } from '../store/courseStore';
import CourseWebViewScreen from './CourseWebViewScreen';
import EnrollmentSuccessModal from '../components/EnrollmentSuccessModal';

interface CourseDetailsScreenProps {
  course: Course;
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function CourseDetailsScreen({ course, visible, onClose }: CourseDetailsScreenProps) {
  const { toggleBookmark, enrollInCourse, unenrollFromCourse } = useCourseStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [instructorImageError, setInstructorImageError] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);
  const insets = useSafeAreaInsets();

  // Fallback images array
  const fallbackImages = [
    require('../assets/images/fallback1.png'),
    require('../assets/images/fallback2.png'),
    require('../assets/images/fallback3.png'),
    require('../assets/images/fallback4.png'),
  ];

  // Get consistent fallback image based on course ID
  const getConsistentFallbackImage = () => {
    // Use course ID to generate consistent index
    const courseIdHash = course._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = courseIdHash % fallbackImages.length;
    return fallbackImages[index];
  };

  // Get all available images
  const getAllImages = (): string[] | null => {
    const images: string[] = [];
    if (course.thumbnail) images.push(course.thumbnail);
    if (course.images && course.images.length > 0) {
      course.images.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    return images.length > 0 ? images : null;
  };

  const images = getAllImages();
  const currentImage = images ? images[currentImageIndex] : null;

  const getInstructorImageUrl = () => {
    if (instructorImageError) return null;
    return course.instructor?.picture?.large || course.instructor?.picture?.medium || course.instructor?.picture?.thumbnail || null;
  };

  const instructorImageUrl = getInstructorImageUrl();

  const handleEnrollment = async () => {
    if (course.isEnrolled) {
      // Already enrolled, just show web view
      setShowWebView(true);
      return;
    }
    
    // Enroll in course
    await enrollInCourse(course._id);
    setShowEnrollmentSuccess(true);
  };

  const handleUnenroll = () => {
    Alert.alert(
      'Unenroll from Course',
      `Are you sure you want to unenroll from "${course.title}"? You will lose access to the course content.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: async () => {
            await unenrollFromCourse(course._id);
            Alert.alert('Success', 'You have been unenrolled from the course.');
          },
        },
      ]
    );
  };

  const handleNextImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <TouchableOpacity 
            onPress={() => toggleBookmark(course._id)}
            style={styles.bookmarkButton}
          >
            <Text style={[styles.bookmark, course.isBookmarked && styles.bookmarked]}>
              {course.isBookmarked ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
          {/* Image Gallery */}
          <View style={styles.imageContainer}>
            {currentImage && !imageError ? (
              <View>
                <Image 
                  source={{ uri: currentImage }} 
                  style={styles.courseImage}
                  onError={() => setImageError(true)}
                />
                {images && images.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.prevButton]}
                      onPress={handlePrevImage}
                    >
                      <Text style={styles.imageNavText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.nextButton]}
                      onPress={handleNextImage}
                    >
                      <Text style={styles.imageNavText}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.imageIndicator}>
                      <Text style={styles.imageIndicatorText}>
                        {currentImageIndex + 1} / {images.length}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <Image 
                source={getConsistentFallbackImage()} 
                style={styles.courseImage}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Course Info */}
          <View style={styles.contentContainer}>
            <View style={styles.titleSection}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={styles.categoryPriceRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{course.category}</Text>
                </View>
                <Text style={styles.price}>${course.price}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {course.description || 'No description available for this course.'}
              </Text>
            </View>

            {/* Course Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course ID:</Text>
                <Text style={styles.detailValue}>{course.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{course.category}</Text>
              </View>
              {course.brand && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand:</Text>
                  <Text style={styles.detailValue}>{course.brand}</Text>
                </View>
              )}
              {course.rating && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <Text style={styles.detailValue}>{course.rating}/5 ⭐</Text>
                </View>
              )}
              {course.stock && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Available:</Text>
                  <Text style={styles.detailValue}>{course.stock} spots</Text>
                </View>
              )}
            </View>

            {/* Instructor Information */}
            {course.instructor && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructor</Text>
                <View style={styles.instructorCard}>
                  <View style={styles.instructorHeader}>
                    {instructorImageUrl ? (
                      <Image 
                        source={{ uri: instructorImageUrl }} 
                        style={styles.instructorImage}
                        onError={() => setInstructorImageError(true)}
                      />
                    ) : (
                      <View style={[styles.instructorImage, styles.placeholderInstructorImage]}>
                        <Text style={styles.placeholderInstructorText}>👤</Text>
                      </View>
                    )}
                    <View style={styles.instructorInfo}>
                      <Text style={styles.instructorName}>
                        {course.instructor.name?.title} {course.instructor.name?.first} {course.instructor.name?.last}
                      </Text>
                      <Text style={styles.instructorEmail}>{course.instructor.email}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.instructorDetails}>
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Phone:</Text>
                      <Text style={styles.contactValue}>{course.instructor.phone}</Text>
                    </View>
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Mobile:</Text>
                      <Text style={styles.contactValue}>{course.instructor.cell}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={styles.webViewButtonContainer}
                onPress={() => setShowWebView(true)}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC', '#003D99']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.webViewButton}
                >
                  <Ionicons name="book-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.webViewButtonText}>View Course Content</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.enrollButtonContainer,
                  { shadowColor: course.isEnrolled ? '#007AFF' : '#ff6b9d' }
                ]} 
                onPress={handleEnrollment}
              >
                <LinearGradient
                  colors={course.isEnrolled ? ['#007AFF', '#0056CC', '#003D99'] : ['#ff6b9d', '#dc2626', '#1f2937']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.enrollButton}
                >
                  {course.isEnrolled ? (
                    <>
                      <Ionicons name="library-outline" size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.enrollButtonText}>Enjoy Learning</Text>
                    </>
                  ) : (
                    <Text style={styles.enrollButtonText}>▶ Enroll Now - ${course.price}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Unenroll Button - Only show if enrolled */}
              {course.isEnrolled && (
                <TouchableOpacity 
                  style={styles.unenrollButtonContainer}
                  onPress={handleUnenroll}
                >
                  <View style={styles.unenrollButton}>
                    <Ionicons name="remove-circle-outline" size={18} color="#dc2626" style={styles.buttonIcon} />
                    <Text style={styles.unenrollButtonText}>Unenroll from Course</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
        
        {/* WebView Modal */}
        <CourseWebViewScreen
          course={course}
          visible={showWebView}
          onClose={() => setShowWebView(false)}
        />
        
        {/* Enrollment Success Modal */}
        <EnrollmentSuccessModal
          visible={showEnrollmentSuccess}
          course={course}
          onClose={() => setShowEnrollmentSuccess(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookmarkButton: {
    padding: 8,
  },
  bookmark: {
    fontSize: 24,
    color: '#ccc',
  },
  bookmarked: {
    color: '#FFD700',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: screenWidth,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageNavText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  instructorCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  placeholderInstructorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderInstructorText: {
    fontSize: 24,
    color: '#fff',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorEmail: {
    fontSize: 14,
    color: '#666',
  },
  instructorDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  webViewButtonContainer: {
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  webViewButton: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  webViewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  unenrollButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  unenrollButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unenrollButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  enrollButtonContainer: {
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  enrollButton: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});