import axios from 'axios';
import { CoursesResponse, InstructorsResponse } from '../../types/course';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.freeapi.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const courseService = {
  async getCourses(): Promise<CoursesResponse> {
    const response = await api.get<CoursesResponse>('/public/randomproducts');
    return response.data;
  },

  async getInstructors(): Promise<InstructorsResponse> {
    const response = await api.get<InstructorsResponse>('/public/randomusers');
    return response.data;
  },
};