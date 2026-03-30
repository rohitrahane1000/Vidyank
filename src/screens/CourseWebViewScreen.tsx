import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/course';
import { useCourseStore } from '../store/courseStore';

interface CourseWebViewScreenProps {
  course: Course;
  visible: boolean;
  onClose: () => void;
}

export default function CourseWebViewScreen({ course, visible, onClose }: CourseWebViewScreenProps) {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const { enrollInCourse } = useCourseStore();

  // Generate HTML content for the course
  const generateCourseHTML = () => {
    // Get consistent fallback image based on course ID (same logic as CourseDetailsScreen)
    const fallbackImages = [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA3QUZGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TmjwvdGV4dD4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMjhhNzQ1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TmjwvdGV4dD4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZmY5ODAwIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TmjwvdGV4dD4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGMzNTQ1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TmjwvdGV4dD4KPC9zdmc+',
    ];
    
    const getConsistentFallbackImage = () => {
      const courseIdHash = course._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = courseIdHash % fallbackImages.length;
      return fallbackImages[index];
    };
    
    const courseImage = course.thumbnail || getConsistentFallbackImage();
    const instructorImage = course.instructor?.picture?.large || course.instructor?.picture?.medium || course.instructor?.picture?.thumbnail;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${course.title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
                min-height: 100vh;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .course-header {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                gap: 15px;
                align-items: flex-start;
            }
            
            .course-image {
                width: 150px;
                height: 150px;
                border-radius: 10px;
                object-fit: cover;
                flex-shrink: 0;
            }
            
            .course-info {
                flex: 1;
            }
            
            .course-title {
                font-size: 1.5em;
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
                line-height: 1.3;
            }
            
            .course-description {
                font-size: 0.85em;
                color: #666;
                line-height: 1.4;
                margin-bottom: 0;
            }
            
            .course-details-table {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .section-title {
                font-size: 1.4em;
                font-weight: 600;
                color: #333;
                margin-bottom: 15px;
                font-family: 'Georgia', 'Times New Roman', serif;
                letter-spacing: 0.5px;
            }
            
            .details-table {
                width: 100%;
                border-collapse: collapse;
                border: 2px solid #333;
                background: white;
            }
            
            .details-table th,
            .details-table td {
                border: 1px solid #333;
                padding: 12px 15px;
                text-align: left;
                vertical-align: middle;
            }
            
            .details-table th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
                border-bottom: 2px solid #333;
            }
            
            .details-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .details-table tr:nth-child(odd) {
                background: white;
            }
            
            .detail-label {
                font-weight: 600;
                color: #333;
                width: 35%;
                background: #f1f3f4;
            }
            
            .detail-value {
                font-weight: 500;
                color: #333;
                background: white;
            }
            
            .instructor-section {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .instructor-table {
                width: 100%;
                border-collapse: collapse;
                border: 2px solid #333;
                background: white;
                margin-top: 15px;
            }
            
            .instructor-table th,
            .instructor-table td {
                border: 1px solid #333;
                padding: 10px 15px;
                text-align: left;
                vertical-align: middle;
            }
            
            .instructor-table th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
                border-bottom: 2px solid #333;
            }
            
            .instructor-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .instructor-table tr:nth-child(odd) {
                background: white;
            }
            
            .instructor-table .detail-label {
                background: #f1f3f4;
                font-weight: 600;
                color: #333;
                width: 35%;
            }
            
            .instructor-table .detail-value {
                background: white;
                font-weight: 500;
                color: #333;
            }
            
            .modules-section {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .module-card {
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-bottom: 20px;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            
            .module-card:hover {
                border-color: #999;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            }
            
            .module-header {
                background: #f8f9fa;
                color: #333;
                padding: 15px 20px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background 0.3s ease;
                border-bottom: 1px solid #ddd;
                font-family: 'Georgia', 'Times New Roman', serif;
            }
            
            .module-header:hover {
                background: #e9ecef;
            }
            
            .module-number {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-size: 1.1em;
            }
            
            .module-icon {
                width: 28px;
                height: 28px;
                min-width: 28px;
                min-height: 28px;
                background: #666;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .module-toggle {
                font-size: 1.2em;
                transition: transform 0.3s ease;
                color: #666;
            }
            
            .module-card.active .module-toggle {
                transform: rotate(180deg);
            }
            
            .module-content {
                padding: 20px;
                display: none;
                background: white;
                border-top: 1px solid #eee;
            }
            
            .module-card.active .module-content {
                display: block;
            }
            
            .module-content p {
                margin-bottom: 15px;
                color: #555;
                line-height: 1.6;
                font-style: italic;
            }
            
            .module-content ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .module-content li {
                padding: 8px 0;
                padding-left: 25px;
                position: relative;
                color: #444;
                border-bottom: 1px dotted #ddd;
            }
            
            .module-content li:last-child {
                border-bottom: none;
            }
            
            .module-content li:before {
                content: "→";
                position: absolute;
                left: 0;
                color: #666;
                font-weight: bold;
                font-size: 14px;
            }
            
            .action-section {
                background: transparent;
                border-radius: 0;
                padding: 30px 20px;
                box-shadow: none;
                text-align: center;
                margin-top: 20px;
            }
            
            .enroll-btn {
                background: linear-gradient(135deg, #ff6b9d 0%, #dc2626 50%, #1f2937 100%);
                color: white;
                border: none;
                padding: 18px 35px;
                border-radius: 50px;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                width: auto;
                max-width: none;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
            }
            
            .enroll-btn:before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .enroll-btn:hover:before {
                left: 100%;
            }
            
            .enroll-btn:hover {
                background: linear-gradient(135deg, #f43f5e 0%, #b91c1c 50%, #111827 100%);
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
            }
            
            .enroll-btn:active {
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(255, 107, 157, 0.3);
            }
            
            .enroll-icon {
                font-size: 1.1em;
                margin-right: 2px;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 10px;
                }
                
                .course-header {
                    flex-direction: row;
                    text-align: left;
                    padding: 15px;
                    gap: 12px;
                }
                
                .course-image {
                    width: 100px;
                    height: 100px;
                }
                
                .course-title {
                    font-size: 1.2em;
                    margin-bottom: 6px;
                }
                
                .course-description {
                    font-size: 0.75em;
                }
                
                .detail-label {
                    width: 40%;
                    font-size: 0.9em;
                }
                
                .detail-value {
                    font-size: 0.9em;
                }
                
                .details-table th,
                .details-table td,
                .instructor-table th,
                .instructor-table td {
                    padding: 8px 10px;
                    font-size: 0.85em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Course Header with Image and Info -->
            <div class="course-header">
                <img src="${courseImage}" alt="${course.title}" class="course-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 150px; height: 150px; background: #007AFF; border-radius: 10px; align-items: center; justify-content: center; color: white; font-size: 48px;">📚</div>
                
                <div class="course-info">
                    <h1 class="course-title">${course.title}</h1>
                    <p class="course-description">
                        ${course.description || 'This comprehensive course will provide you with in-depth knowledge and practical skills. You will learn from industry experts and gain hands-on experience through interactive lessons and real-world projects.'}
                    </p>
                </div>
            </div>
            
            <!-- Course Details Table -->
            <div class="course-details-table">
                <h2 class="section-title">Course Information</h2>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="detail-label">Course ID</td>
                            <td class="detail-value">${course.id}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Category</td>
                            <td class="detail-value">${course.category}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Price</td>
                            <td class="detail-value" style="color: #007AFF; font-weight: bold;">$${course.price}</td>
                        </tr>
                        ${course.rating ? `
                        <tr>
                            <td class="detail-label">Rating</td>
                            <td class="detail-value">${course.rating}/5 ⭐</td>
                        </tr>
                        ` : ''}
                        ${course.stock ? `
                        <tr>
                            <td class="detail-label">Available Spots</td>
                            <td class="detail-value">${course.stock}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
            
            <!-- Instructor Section -->
            ${course.instructor ? `
            <div class="instructor-section">
                <h2 class="section-title">Meet Your Instructor</h2>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    ${instructorImage ? `
                        <img src="${instructorImage}" alt="Instructor" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #e0e0e0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display: none; width: 60px; height: 60px; border-radius: 50%; background: #007AFF; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">👤</div>
                    ` : `
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: #007AFF; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">👤</div>
                    `}
                    <div style="font-size: 1.2em; font-weight: bold; color: #333;">
                        ${course.instructor.name?.title || ''} ${course.instructor.name?.first || ''} ${course.instructor.name?.last || ''}
                    </div>
                </div>
                <table class="instructor-table">
                    <thead>
                        <tr>
                            <th>Contact Type</th>
                            <th>Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="detail-label">Email</td>
                            <td class="detail-value">${course.instructor.email || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Phone</td>
                            <td class="detail-value">${course.instructor.phone || 'N/A'}</td>
                        </tr>
                        ${course.instructor.cell ? `
                        <tr>
                            <td class="detail-label">Mobile</td>
                            <td class="detail-value">${course.instructor.cell}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
            ` : ''}
            
            <!-- Course Modules -->
            <div class="modules-section">
                <h2 class="section-title">Course Modules</h2>
                
                <div class="module-card">
                    <div class="module-header" onclick="toggleModule(this)">
                        <div class="module-number">
                            <div class="module-icon">1</div>
                            <span>Module 1: Introduction & Fundamentals</span>
                        </div>
                        <span class="module-toggle">▼</span>
                    </div>
                    <div class="module-content">
                        <p>Get started with the basics and build a strong foundation. This module covers essential concepts and terminology.</p>
                        <ul>
                            <li>Course overview and objectives</li>
                            <li>Key concepts and terminology</li>
                            <li>Setting up your learning environment</li>
                            <li>First hands-on exercise</li>
                        </ul>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-header" onclick="toggleModule(this)">
                        <div class="module-number">
                            <div class="module-icon">2</div>
                            <span>Module 2: Core Concepts</span>
                        </div>
                        <span class="module-toggle">▼</span>
                    </div>
                    <div class="module-content">
                        <p>Dive deeper into the core concepts and learn practical applications.</p>
                        <ul>
                            <li>Advanced techniques and methods</li>
                            <li>Real-world case studies</li>
                            <li>Interactive exercises</li>
                            <li>Best practices and tips</li>
                        </ul>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-header" onclick="toggleModule(this)">
                        <div class="module-number">
                            <div class="module-icon">3</div>
                            <span>Module 3: Advanced Topics</span>
                        </div>
                        <span class="module-toggle">▼</span>
                    </div>
                    <div class="module-content">
                        <p>Master advanced topics and prepare for real-world challenges.</p>
                        <ul>
                            <li>Complex problem solving</li>
                            <li>Industry standards and practices</li>
                            <li>Capstone project</li>
                            <li>Certification preparation</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Action Section -->
            ${!course.isEnrolled ? `
            <div class="action-section">
                <button class="enroll-btn" onclick="enrollCourse()">
                    <span class="enroll-icon">▶</span>
                    <span>Enroll Now - $${course.price}</span>
                </button>
            </div>
            ` : `
            <div class="action-section">
                <div style="background: linear-gradient(135deg, #007AFF 0%, #0056CC 50%, #003D99 100%); color: white; padding: 18px 35px; border-radius: 50px; font-size: 1.2em; font-weight: bold; display: inline-flex; align-items: center; gap: 12px; box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3); text-transform: uppercase; letter-spacing: 0.5px; position: relative; overflow: hidden;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 17L12 22L21 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 12L12 17L21 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Enjoy Learning</span>
                </div>
            </div>
            `}
        </div>
        
        <script>
            function toggleModule(header) {
                const moduleCard = header.parentElement;
                moduleCard.classList.toggle('active');
            }
            
            function enrollCourse() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ENROLL_COURSE',
                    courseId: '${course._id}',
                    courseTitle: '${course.title}',
                    price: ${course.price}
                }));
            }
            
            // Send ready message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'WEBVIEW_READY',
                courseId: '${course._id}'
            }));
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'WEBVIEW_READY':
          // WebView ready
          break;
          
        case 'ENROLL_COURSE':
          Alert.alert(
            'Enroll in Course',
            `Would you like to enroll in "${data.courseTitle}" for $${data.price}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Enroll', 
                onPress: async () => {
                  try {
                    await enrollInCourse(data.courseId);
                    Alert.alert(
                      'Success!', 
                      'Enrollment successful! Welcome to the course.',
                      [
                        { 
                          text: 'OK', 
                          onPress: () => {
                            // Reload the webview to show the updated enrollment status
                            webViewRef.current?.reload();
                          }
                        }
                      ]
                    );
                  } catch (error) {
                    Alert.alert('Error', 'Failed to enroll in course. Please try again.');
                  }
                }
              }
            ]
          );
          break;
          
        default:
          // Unknown message type
      }
    } catch (error) {
      // Handle message parsing error silently
    }
  };

  const reload = () => {
    webViewRef.current?.reload();
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
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Image 
            source={require('../assets/images/VlogoNavbar.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <TouchableOpacity onPress={reload} style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading course content...</Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ html: generateCourseHTML() }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  logo: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  webview: {
    flex: 1,
  },
});