import { Platform } from 'react-native';

export const debugImageLoad = (uri: string, context: string) => {
  // Debug logging disabled for production
};

export const testImageUrl = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getImageInfo = (uri: string) => {
  const url = new URL(uri);
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
    isSecure: url.protocol === 'https:',
    hasQuery: url.search.length > 0,
  };
};