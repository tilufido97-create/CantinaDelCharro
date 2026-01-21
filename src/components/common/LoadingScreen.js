import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Video } from 'expo-av';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen({ isVisible, onLoadingComplete, duration = 3000, type = 'app' }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset opacity when showing
      fadeAnim.setValue(1);
      
      // Start fade out after duration
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, fadeAnim, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {type === 'app' ? (
        <Video
          source={require('../../../assets/PantallaDeCarga.mp4')}
          style={styles.loadingVideo}
          shouldPlay
          isLooping
          isMuted
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require('../../../assets/PantallaCarga.gif')}
          style={styles.loadingGif}
          contentFit="cover"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingVideo: {
    width: width * 1,
    height: height * 1,
  },
  loadingGif: {
    width: width * 0.8,
    height: height * 0.6,
  },
});