import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Course, Instructor } from '../types/course';
import { notificationService } from '../services/notificationService';

const getBookmarksKey = (userId: string) => `user_bookmarked_courses_${userId}`;
const getEnrolledCoursesKey = (userId: string) => `user_enrolled_courses_${userId}`;

interface CourseState {
  courses: Course[];
  instructors: Instructor[];
  bookmarkedCourses: string[];
  enrolledCourses: string[];
  searchQuery: string;
  loading: boolean;
  showBookmarksOnly: boolean;
  showEnrolledOnly: boolean;
  currentUserId: string | null;
  setCourses: (courses: Course[]) => void;
  setInstructors: (instructors: Instructor[]) => void;
  toggleBookmark: (courseId: string) => void;
  enrollInCourse: (courseId: string) => void;
  unenrollFromCourse: (courseId: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setShowBookmarksOnly: (show: boolean) => void;
  setShowEnrolledOnly: (show: boolean) => void;
  setCurrentUser: (userId: string | null) => void;
  loadUserData: (userId: string) => Promise<void>;
  clearUserData: () => void;
  loadBookmarks: (userId: string) => Promise<void>;
  loadEnrolledCourses: (userId: string) => Promise<void>;
  saveBookmarks: (bookmarks: string[], userId: string) => Promise<void>;
  saveEnrolledCourses: (enrolled: string[], userId: string) => Promise<void>;
  getFilteredCourses: () => Course[];
  getBookmarkedCourses: () => Course[];
  getEnrolledCourses: () => Course[];
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  instructors: [],
  bookmarkedCourses: [],
  enrolledCourses: [],
  searchQuery: '',
  loading: false,
  showBookmarksOnly: false,
  showEnrolledOnly: false,
  currentUserId: null,
  
  setCourses: (courses) => {
    const { bookmarkedCourses, enrolledCourses } = get();
    const coursesWithStatus = courses.map(course => ({
      ...course,
      isBookmarked: bookmarkedCourses.includes(course._id),
      isEnrolled: enrolledCourses.includes(course._id)
    }));
    set({ courses: coursesWithStatus });
  },
  
  setInstructors: (instructors) => set({ instructors }),
  
  toggleBookmark: async (courseId) => {
    const state = get();
    if (!state.currentUserId) return;
    
    const isBookmarked = state.bookmarkedCourses.includes(courseId);
    const bookmarkedCourses = isBookmarked
      ? state.bookmarkedCourses.filter(id => id !== courseId)
      : [...state.bookmarkedCourses, courseId];
    
    const courses = state.courses.map(course => 
      course._id === courseId 
        ? { ...course, isBookmarked: !isBookmarked }
        : course
    );
    
    // Save to AsyncStorage with user ID
    await get().saveBookmarks(bookmarkedCourses, state.currentUserId);
    
    set({ bookmarkedCourses, courses });
    
    // Show notification for bookmark milestones
    if (!isBookmarked) {
      await notificationService.showBookmarkMilestoneNotification(bookmarkedCourses.length);
    }
  },
  
  enrollInCourse: async (courseId) => {
    const state = get();
    if (!state.currentUserId) return;
    
    const isAlreadyEnrolled = state.enrolledCourses.includes(courseId);
    
    if (isAlreadyEnrolled) return;
    
    const enrolledCourses = [...state.enrolledCourses, courseId];
    
    const courses = state.courses.map(course => 
      course._id === courseId 
        ? { ...course, isEnrolled: true }
        : course
    );
    
    // Save to storage with user ID
    await get().saveEnrolledCourses(enrolledCourses, state.currentUserId);
    
    set({ enrolledCourses, courses });
  },
  
  unenrollFromCourse: async (courseId) => {
    const state = get();
    if (!state.currentUserId) return;
    
    const isEnrolled = state.enrolledCourses.includes(courseId);
    
    if (!isEnrolled) return;
    
    const enrolledCourses = state.enrolledCourses.filter(id => id !== courseId);
    
    const courses = state.courses.map(course => 
      course._id === courseId 
        ? { ...course, isEnrolled: false }
        : course
    );
    
    // Save to storage with user ID
    await get().saveEnrolledCourses(enrolledCourses, state.currentUserId);
    
    set({ enrolledCourses, courses });
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
  setShowBookmarksOnly: (show) => set({ showBookmarksOnly: show }),
  setShowEnrolledOnly: (show) => set({ showEnrolledOnly: show }),
  
  setCurrentUser: (userId) => set({ currentUserId: userId }),
  
  loadUserData: async (userId) => {
    if (!userId) return;
    
    set({ currentUserId: userId });
    await Promise.all([
      get().loadBookmarks(userId),
      get().loadEnrolledCourses(userId)
    ]);
  },
  
  clearUserData: () => {
    set({
      bookmarkedCourses: [],
      enrolledCourses: [],
      showBookmarksOnly: false,
      showEnrolledOnly: false,
      currentUserId: null,
      courses: get().courses.map(course => ({
        ...course,
        isBookmarked: false,
        isEnrolled: false
      }))
    });
  },
  
  loadBookmarks: async (userId) => {
    if (!userId) return;
    
    try {
      const bookmarksJson = await SecureStore.getItemAsync(getBookmarksKey(userId));
      if (bookmarksJson) {
        const bookmarkedCourses = JSON.parse(bookmarksJson);
        set({ bookmarkedCourses });
        
        // Update courses with bookmark status
        const { courses, enrolledCourses } = get();
        const coursesWithStatus = courses.map(course => ({
          ...course,
          isBookmarked: bookmarkedCourses.includes(course._id),
          isEnrolled: enrolledCourses.includes(course._id)
        }));
        set({ courses: coursesWithStatus });
      }
    } catch (error) {
      // Handle error silently
    }
  },
  
  saveBookmarks: async (bookmarks, userId) => {
    if (!userId) return;
    
    try {
      await SecureStore.setItemAsync(getBookmarksKey(userId), JSON.stringify(bookmarks));
    } catch (error) {
      // Handle error silently
    }
  },
  
  saveEnrolledCourses: async (enrolled, userId) => {
    if (!userId) return;
    
    try {
      await SecureStore.setItemAsync(getEnrolledCoursesKey(userId), JSON.stringify(enrolled));
    } catch (error) {
      // Handle error silently
    }
  },
  
  loadEnrolledCourses: async (userId) => {
    if (!userId) return;
    
    try {
      const enrolledJson = await SecureStore.getItemAsync(getEnrolledCoursesKey(userId));
      if (enrolledJson) {
        const enrolledCourses = JSON.parse(enrolledJson);
        set({ enrolledCourses });
        
        // Update courses with enrollment status
        const { courses, bookmarkedCourses } = get();
        const coursesWithStatus = courses.map(course => ({
          ...course,
          isBookmarked: bookmarkedCourses.includes(course._id),
          isEnrolled: enrolledCourses.includes(course._id)
        }));
        set({ courses: coursesWithStatus });
      }
    } catch (error) {
      // Handle error silently
    }
  },
  
  getFilteredCourses: () => {
    const { courses, searchQuery, showBookmarksOnly, showEnrolledOnly } = get();
    let filteredCourses = courses;
    
    // Filter by enrolled courses if showEnrolledOnly is true
    if (showEnrolledOnly) {
      filteredCourses = courses.filter(course => course.isEnrolled);
    }
    // Filter by bookmarks if showBookmarksOnly is true (and not showing enrolled)
    else if (showBookmarksOnly) {
      filteredCourses = courses.filter(course => course.isBookmarked);
    }
    
    // Filter by search query
    if (searchQuery) {
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredCourses;
  },
  
  getBookmarkedCourses: () => {
    const { courses } = get();
    return courses.filter(course => course.isBookmarked);
  },
  
  getEnrolledCourses: () => {
    const { courses } = get();
    return courses.filter(course => course.isEnrolled);
  },
}));