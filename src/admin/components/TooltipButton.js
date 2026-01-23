import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TooltipButton = ({
  label,
  icon,
  tooltip,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  iconOnly = false
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
    hideTooltipAnimated();
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

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#FFB800', color: '#0A0A0A' };
      case 'secondary':
        return { backgroundColor: '#2C2C2E', color: '#FFFFFF' };
      case 'danger':
        return { backgroundColor: '#FF3B30', color: '#FFFFFF' };
      case 'success':
        return { backgroundColor: '#34C759', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#FFB800', color: '#0A0A0A' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 8, fontSize: 12, iconSize: 18 };
      case 'medium':
        return { height: 44, paddingHorizontal: 12, fontSize: 14, iconSize: 20 };
      case 'large':
        return { height: 52, paddingHorizontal: 16, fontSize: 16, iconSize: 24 };
      default:
        return { height: 44, paddingHorizontal: 12, fontSize: 14, iconSize: 20 };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        disabled={disabled}
        style={[
          styles.button,
          { 
            backgroundColor: variantStyle.backgroundColor,
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            opacity: disabled ? 0.5 : 1
          }
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={sizeStyle.iconSize} 
            color={variantStyle.color} 
          />
        )}
        {label && !iconOnly && (
          <Text style={[
            styles.label,
            { color: variantStyle.color, fontSize: sizeStyle.fontSize }
          ]}>
            {label}
          </Text>
        )}
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
          <View style={styles.tooltipArrow} />
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12
  },
  label: {
    fontWeight: '600'
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
  tooltipArrow: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -4 }],
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.9)'
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center'
  }
});

export default TooltipButton;
