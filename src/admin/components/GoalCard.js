import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { formatCurrency } from '../utils/financialCalculator';

const GoalCard = ({ title, period, goal, current, percentage, achieved, active, onEdit, onToggle }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(percentage, 100),
      duration: 1000,
      useNativeDriver: false
    }).start();

    if (achieved) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [percentage, achieved]);

  const getIcon = () => {
    switch (period) {
      case 'diaria': return 'sunny';
      case 'semanal': return 'calendar';
      case 'mensual': return 'stats-chart';
      default: return 'flag';
    }
  };

  const getBorderColor = () => {
    if (!active) return '#8E8E93';
    if (achieved) return '#34C759';
    return '#FFB800';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <Animated.View style={[styles.container, { borderLeftColor: getBorderColor(), transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getIcon()} size={24} color={active ? COLORS.accentGold : COLORS.textTertiary} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Switch
          value={active}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.bgTertiary, true: COLORS.accentGold + '60' }}
          thumbColor={active ? COLORS.accentGold : COLORS.textTertiary}
        />
      </View>

      {active ? (
        <>
          <View style={styles.values}>
            <View style={styles.valueRow}>
              <Text style={styles.label}>Meta:</Text>
              <Text style={styles.value}>{formatCurrency(goal)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.label}>Actual:</Text>
              <Text style={[styles.value, { color: achieved ? COLORS.success : COLORS.warning }]}>
                {formatCurrency(current)}
              </Text>
            </View>
            {!achieved && (
              <View style={styles.valueRow}>
                <Text style={styles.label}>Faltante:</Text>
                <Text style={[styles.value, { color: COLORS.textTertiary }]}>
                  {formatCurrency(goal - current)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                <LinearGradient
                  colors={achieved ? ['#34C759', '#28A745'] : ['#FFB800', '#FF9500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                />
              </Animated.View>
            </View>
            <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
          </View>

          {achieved && (
            <View style={styles.achievedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.achievedText}>¡Meta Alcanzada!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="create" size={16} color={COLORS.accentGold} />
            <Text style={styles.editButtonText}>Editar Meta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.inactiveState}>
          <Text style={styles.inactiveText}>Meta desactivada</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.bgSecondary, borderRadius: 20, padding: 20, marginBottom: 16, borderLeftWidth: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  values: { marginBottom: 16 },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: COLORS.textSecondary },
  value: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  progressContainer: { marginBottom: 16 },
  progressBar: { height: 12, backgroundColor: COLORS.bgTertiary, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 12, borderRadius: 6, overflow: 'hidden' },
  gradient: { flex: 1 },
  percentage: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  achievedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.success, padding: 12, borderRadius: 12, marginBottom: 12 },
  achievedText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: COLORS.bgTertiary, borderRadius: 12 },
  editButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.accentGold },
  inactiveState: { paddingVertical: 20, alignItems: 'center' },
  inactiveText: { fontSize: 14, color: COLORS.textTertiary, opacity: 0.6 }
});

export default GoalCard;
