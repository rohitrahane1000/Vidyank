import { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { Course } from '../types/course';
import { useCourseStore } from '../store/courseStore';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';

interface CourseGridProps {
  courses: Course[];
  title: string;
}

export default function CourseGrid({ courses, title }: CourseGridProps) {
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);

  const renderGridItem = ({ item }: { item: Course }) => (
    <GridCard course={item} onToggleBookmark={toggleBookmark} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={courses}
        renderItem={renderGridItem}
        keyExtractor={(item) => `grid-${item._id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        scrollEnabled={false} // Disable scroll since it's inside main ScrollView
      />
    </View>
  );
}

function GridCard({ course, onToggleBookmark }: { course: Course; onToggleBookmark: (id: string) => void }) {
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

  const getImageUrl = () => {
    if (imageError) return null;
    if (course.thumbnail) return course.thumbnail;
    if (course.images && course.images.length > 0) return course.images[0];
    return null;
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
        style={styles.gridCard}
        onPress={() => setShowDetails(true)}
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.gridImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image 
            source={getConsistentFallbackImage()} 
            style={styles.gridImage}
            resizeMode="cover"
          />
        )}
        
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onToggleBookmark(course._id);
          }}
          style={styles.bookmarkButton}
        >
          <View style={styles.bookmarkCircle}>
            <Text style={[styles.bookmark, course.isBookmarked && styles.bookmarked]}>
              {course.isBookmarked ? '★' : '☆'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.gridInfo}>
          <Text style={styles.gridTitle} numberOfLines={2}>{course.title}</Text>
          
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
              <Text style={styles.instructorName} numberOfLines={1}>
                {course.instructor.name?.first} {course.instructor.name?.last}
              </Text>
            </View>
          )}
          
          <Text style={styles.gridPrice}>${course.price}</Text>
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
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  gridContent: {
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderText: {
    fontSize: 32,
    color: '#fff',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 18,
    color: '#fff',
    lineHeight: 18,
    textAlign: 'center',
  },
  bookmarked: {
    color: '#FFD700',
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: '#f0f0f0',
  },
  placeholderInstructorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderInstructorText: {
    fontSize: 12,
    color: '#fff',
  },
  instructorName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});