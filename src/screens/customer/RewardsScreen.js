import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getUserData, redeemReward } from '../../services/loyaltyService';
import { MOCK_REWARDS } from '../../constants/mockData';
import RewardCard from '../../components/loyalty/RewardCard';

export default function RewardsScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    setUserData(data || { points: 0, level: 'bronze' });
  };

  const handleRedeem = async (reward) => {
    try {
      await redeemReward(userData.userId, reward);
      Alert.alert('🎉 ¡Canjeado!', `Has canjeado: ${reward.title}`, [
        { text: 'OK', onPress: loadData }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredRewards = filter === 'all' ? MOCK_REWARDS : MOCK_REWARDS.filter(r => r.category === filter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RECOMPENSAS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.pointsHeader}>
        <Text style={styles.pointsText}>💎 {userData?.points.toLocaleString()} puntos disponibles</Text>
      </View>

      <View style={styles.filters}>
        {['all', 'discount', 'delivery', 'product'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todos' : f === 'discount' ? 'Descuentos' : f === 'delivery' ? 'Envíos' : 'Productos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRewards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RewardCard reward={item} userPoints={userData?.points || 0} onRedeem={handleRedeem} />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  pointsHeader: { padding: SPACING.lg, backgroundColor: COLORS.bg.secondary },
  pointsText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center' },
  filters: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, backgroundColor: COLORS.bg.tertiary },
  filterChipActive: { backgroundColor: COLORS.accent.gold },
  filterText: { fontSize: 14, color: COLORS.text.secondary },
  filterTextActive: { color: COLORS.bg.primary, fontWeight: 'bold' },
  list: { padding: SPACING.lg },
});
