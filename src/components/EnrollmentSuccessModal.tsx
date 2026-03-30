import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/course';

interface EnrollmentSuccessModalProps {
  visible: boolean;
  course: Course | null;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function EnrollmentSuccessModal({ visible, course, onClose }: EnrollmentSuccessModalProps) {
  if (!course) return null;

  const getInstructorImageUrl = () => {
    return course.instructor?.picture?.large || 
           course.instructor?.picture?.medium || 
           course.instructor?.picture?.thumbnail || 
           null;
  };

  const instructorImageUrl = getInstructorImageUrl();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#007AFF', '#0056CC', '#003D99']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
            </View>

            {/* Congratulations Text */}
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsSubtitle}>You have successfully unlocked</Text>

            {/* Course Info */}
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{course.title}</Text>
              <Text style={styles.courseDescription} numberOfLines={3}>
                {course.description || 'Start your learning journey with this amazing course!'}
              </Text>
            </View>

            {/* Instructor Info */}
            {course.instructor && (
              <View style={styles.instructorSection}>
                <Text style={styles.instructorLabel}>Your Instructor</Text>
                <View style={styles.instructorInfo}>
                  {instructorImageUrl ? (
                    <Image 
                      source={{ uri: instructorImageUrl }} 
                      style={styles.instructorImage}
                    />
                  ) : (
                    <View style={[styles.instructorImage, styles.placeholderImage]}>
                      <Ionicons name="person" size={24} color="#fff" />
                    </View>
                  )}
                  <View style={styles.instructorDetails}>
                    <Text style={styles.instructorName}>
                      {course.instructor.name?.title} {course.instructor.name?.first} {course.instructor.name?.last}
                    </Text>
                    <Text style={styles.instructorEmail}>{course.instructor.email}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: screenWidth - 40,
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
    letterSpacing: 1,
  },
  congratsSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    fontFamily: 'System',
  },
  courseInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  courseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  courseDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'System',
  },
  instructorSection: {
    width: '100%',
    marginBottom: 25,
  },
  instructorLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  instructorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  instructorEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    fontFamily: 'System',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
});