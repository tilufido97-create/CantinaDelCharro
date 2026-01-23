import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TooltipIcon from './TooltipIcon';

const KPICard = ({
  title,
  value,
  comparison,
  comparisonValue = 0,
  icon,
  color = '#FFB800',
  tooltip,
  onPress
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, []);

  const getGradientColors = () => {
    if (comparisonValue > 0) {
      return ['#34C759', '#248A3D'];
    } else if (comparisonValue < 0) {
      return ['#FF3B30', '#C62828'];
    }
    return ['#2C2C2E', '#1C1C1E'];
  };

  const getTrendIcon = () => {
    if (comparisonValue > 0) return 'arrow-up';
    if (comparisonValue < 0) return 'arrow-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (comparisonValue > 0) return '#34C759';
    if (comparisonValue < 0) return '#FF3B30';
    return '#8E8E93';
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <Container onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.header}>
            <Ionicons name={icon} size={32} color="#FFFFFF" />
            {tooltip && (
              <TooltipIcon 
                tooltip={tooltip}
                color="#FFFFFF"
                size={18}
              />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>

          {comparison && (
            <View style={styles.comparison}>
              <Ionicons 
                name={getTrendIcon()} 
                size={14} 
                color={getTrendColor()} 
              />
              <Text style={[styles.comparisonText, { color: getTrendColor() }]}>
                {comparison}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Container>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 280,
    height: 140
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 8
  },
  value: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default KPICard;
