import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Course } from '../types/course';
import { useCourseStore } from '../store/courseStore';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';

interface CourseCarouselProps {
  courses: Course[];
  title: string;
  autoScroll?: boolean;
  pauseAutoScroll?: boolean;
  onModalStateChange?: (isOpen: boolean) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards visible with margins
const CARD_MARGIN = 8;

export default function CourseCarousel({ courses, title, autoScroll = false, pauseAutoScroll = false, onModalStateChange }: CourseCarouselProps) {
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || courses.length <= 2 || isUserInteracting || pauseAutoScroll) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % (courses.length - 1); // -1 because we show 2 cards at a time
        
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        
        return nextIndex;
      });
    }, 2000); // Auto-scroll every 2 seconds

    return () => clearInterval(interval);
  }, [autoScroll, courses.length, isUserInteracting, pauseAutoScroll]);

  const renderCarouselItem = ({ item }: { item: Course }) => (
    <CarouselCard course={item} onToggleBookmark={toggleBookmark} onModalStateChange={onModalStateChange} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        ref={flatListRef}
        data={courses.slice(0, 8)} // Show up to 8 courses
        renderItem={renderCarouselItem}
        keyExtractor={(item) => `carousel-${item._id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onScrollBeginDrag={() => setIsUserInteracting(true)}
        onMomentumScrollEnd={() => {
          // Resume auto-scroll after 5 seconds of no interaction
          setTimeout(() => setIsUserInteracting(false), 5000);
        }}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
    </View>
  );
}

function CarouselCard({ course, onToggleBookmark, onModalStateChange }: { course: Course; onToggleBookmark: (id: string) => void; onModalStateChange?: (isOpen: boolean) => void }) {
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

  const handleOpenDetails = () => {
    setShowDetails(true);
    onModalStateChange?.(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    onModalStateChange?.(false);
  };

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
        style={styles.carouselCard}
        onPress={handleOpenDetails}
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.carouselImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image 
            source={getConsistentFallbackImage()} 
            style={styles.carouselImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.carouselOverlay}>
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
        </View>
        
        <View style={styles.carouselInfo}>
          <Text style={styles.carouselTitle} numberOfLines={2}>{course.title}</Text>
          
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
          
          <Text style={styles.carouselPrice}>${course.price}</Text>
        </View>
      </TouchableOpacity>

      {/* Course Details Modal */}
      <CourseDetailsScreen
        course={course}
        visible={showDetails}
        onClose={handleCloseDetails}
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
  carouselContent: {
    paddingHorizontal: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carouselImage: {
    width: '100%',
    height: 140, // Reduced height for smaller cards
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderText: {
    fontSize: 32, // Reduced size
    color: '#fff',
  },
  carouselOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bookmarkButton: {
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
  carouselInfo: {
    padding: 12, // Reduced padding
  },
  carouselTitle: {
    fontSize: 14, // Reduced font size
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructorImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: '#f0f0f0',
  },
  placeholderInstructorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  placeholderInstructorText: {
    fontSize: 10,
    color: '#fff',
  },
  instructorName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  carouselPrice: {
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
    color: '#007AFF',
  },
});