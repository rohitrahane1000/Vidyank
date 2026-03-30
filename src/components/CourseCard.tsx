import { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Course } from '../types/course';
import { useCourseStore } from '../store/courseStore';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const [imageError, setImageError] = useState(false);
  const [instructorImageError, setInstructorImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fallback images array
  const fallbackImages = [
    require('../assets/images/fallback1.png'),
    require('../assets/images/fallback2.png'),
    require('../assets/images/fallback3.png'),
    require('../assets/images/fallback4.png'),
  ];

  // Get the best available image URL
  const getImageUrl = () => {
    if (imageError) return null; // Will show fallback image
    
    // Try thumbnail first
    if (course.thumbnail) return course.thumbnail;
    
    // Try first image from images array
    if (course.images && course.images.length > 0) return course.images[0];
    
    return null; // Will show fallback image
  };

  // Get consistent fallback image based on course ID
  const getConsistentFallbackImage = () => {
    // Use course ID to generate consistent index
    const courseIdHash = course._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = courseIdHash % fallbackImages.length;
    return fallbackImages[index];
  };

  const getInstructorImageUrl = () => {
    if (instructorImageError) return null;
    return course.instructor?.picture?.thumbnail || null;
  };

  const imageUrl = getImageUrl();
  const instructorImageUrl = getInstructorImageUrl();

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setShowDetails(true)}
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.thumbnail}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image 
            source={getConsistentFallbackImage()} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark(course._id);
              }}
              style={styles.bookmarkButton}
            >
              <View style={styles.bookmarkCircle}>
                <Text style={[styles.bookmark, course.isBookmarked && styles.bookmarked]}>
                  {course.isBookmarked ? '★' : '☆'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description} numberOfLines={3}>
            {course.description}
          </Text>
          
          <View style={styles.footer}>
            {course.instructor && (
              <View style={styles.instructorContainer}>
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
                <Text style={styles.instructorName}>
                  {course.instructor.name?.first} {course.instructor.name?.last}
                </Text>
              </View>
            )}
            <Text style={styles.price}>${course.price}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Course Details Modal */}
      <CourseDetailsScreen
        course={course}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  bookmarkButton: {
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 18,
    overflow: 'hidden',
  },
  bookmarkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmark: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 20,
    textAlign: 'center',
  },
  bookmarked: {
    color: '#FFD700',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderInstructorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderInstructorText: {
    fontSize: 16,
    color: '#fff',
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});