import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TooltipIcon = ({
  tooltip,
  icon = 'information-circle',
  size = 20,
  color = '#8E8E93',
  position = 'top'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const handlePressIn = () => {
    if (Platform.OS !== 'web') {
      timeoutRef.current = setTimeout(() => {
        showTooltipAnimated();
      }, 500);
    }
  };

  const handlePressOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTimeout(() => hideTooltipAnimated(), 2000);
  };

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      showTooltipAnimated();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      hideTooltipAnimated();
    }
  };

  const showTooltipAnimated = () => {
    setShowTooltip(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const hideTooltipAnimated = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true
      })
    ]).start(() => setShowTooltip(false));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        style={styles.iconButton}
      >
        <Ionicons name={icon} size={size} color={color} />
      </TouchableOpacity>

      {showTooltip && (
        <Animated.View 
          style={[
            styles.tooltip,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  iconButton: {
    padding: 4
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    maxWidth: 200,
    zIndex: 9999
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center'
  }
});

export default TooltipIcon;
