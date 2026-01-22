import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

export default function VideoLoadingScreen({ onComplete }) {
  const player = useVideoPlayer(require('../../../assets/PantallaDeCarga.mp4'), player => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    // Reproducir video automáticamente
    player.play();
    
    // Timer de 4 segundos para completar la carga
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: height,
  },
});