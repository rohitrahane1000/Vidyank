import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';
import { debugImageLoad, testImageUrl, getImageInfo } from '../utils/imageDebug';

interface RobustImageProps {
  uri: string;
  style: any;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
  retryCount?: number;
  retryDelay?: number;
}

export default function RobustImage({
  uri,
  style,
  fallbackComponent,
  onLoad,
  onError,
  retryCount = 3,
  retryDelay = 1000,
}: RobustImageProps) {
  const [currentUri, setCurrentUri] = useState(uri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setCurrentUri(uri);
    setError(false);
    setLoading(true);
    setAttempts(0);
  }, [uri]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = (errorEvent: any) => {
    setLoading(false);
    
    if (attempts < retryCount) {
      // Retry with cache-busting parameter
      setTimeout(() => {
        const separator = uri.includes('?') ? '&' : '?';
        const newUri = `${uri}${separator}retry=${attempts + 1}&t=${Date.now()}`;
        setCurrentUri(newUri);
        setAttempts(prev => prev + 1);
        setLoading(true);
      }, retryDelay);
    } else {
      setError(true);
      onError?.(errorEvent);
    }
  };

  if (error) {
    return fallbackComponent ? (
      <View style={style}>{fallbackComponent}</View>
    ) : (
      <View style={[style, styles.errorContainer]} />
    );
  }

  return (
    <View style={style}>
      <Image
        source={{
          uri: currentUri,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: style?.borderRadius }]}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer, { borderRadius: style?.borderRadius }]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  errorContainer: {
    backgroundColor: '#f0f0f0',
  },
});