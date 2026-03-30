export interface Instructor {
  id: number;
  name: {
    first: string;
    last: string;
    title: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  phone: string;
  cell: string;
}

export interface Course {
  _id: string;
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  images: string[];
  description: string;
  brand?: string;
  rating?: number;
  stock?: number;
  image?: {
    url: string;
  };
  instructor?: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
}

export interface CoursesResponse {
  data: {
    data: Course[];
    currentPageItems: number;
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
  success: boolean;
}

export interface InstructorsResponse {
  data: {
    data: Instructor[];
    currentPageItems: number;
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
  success: boolean;
}