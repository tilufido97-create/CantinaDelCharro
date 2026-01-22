import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getUserData, getActivities, LEVELS } from '../../services/loyaltyService';
import LevelCard from '../../components/loyalty/LevelCard';
import BenefitChip from '../../components/loyalty/BenefitChip';
import PointsActivityItem from '../../components/loyalty/PointsActivityItem';

export default function LoyaltyScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    if (data) {
      setUserData(data);
    } else {
      setUserData({ userId: 'user123', points: 0, level: 'bronze', totalEarned: 0, totalSpent: 0, referralCode: 'CHARRO-USER12', referralsCount: 0 });
    }
    
    const acts = await getActivities();
    setActivities(acts.slice(0, 5));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!userData) return null;

  const levelData = LEVELS[userData.level];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FIDELIDAD</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.gold} />}
      >
        <LevelCard level={userData.level} points={userData.points} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BENEFICIOS ACTIVOS</Text>
          <FlatList
            horizontal
            data={levelData.benefits}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <BenefitChip icon="star" label={item} />}
            contentContainerStyle={styles.benefitsList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVIDAD RECIENTE</Text>
          {activities.map(activity => (
            <PointsActivityItem key={activity.id} {...activity} />
          ))}
          {activities.length > 0 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('PointsHistory')}>
              <Text style={styles.viewAllText}>Ver todo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Rewards')}>
          <Text style={styles.ctaText}>🎁 VER RECOMPENSAS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ctaButton, styles.ctaButtonSecondary]} onPress={() => navigation.navigate('Referral')}>
          <Text style={styles.ctaText}>👥 INVITAR AMIGOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { flex: 1 },
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text.tertiary, marginBottom: SPACING.md },
  benefitsList: { gap: SPACING.sm },
  viewAllButton: { alignItems: 'center', paddingVertical: SPACING.md },
  viewAllText: { fontSize: 14, color: COLORS.accent.gold, fontWeight: '600' },
  ctaButton: { backgroundColor: COLORS.accent.gold, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  ctaButtonSecondary: { backgroundColor: COLORS.bg.secondary, borderWidth: 2, borderColor: COLORS.accent.gold },
  ctaText: { fontSize: 16, fontWeight: 'bold', color: COLORS.bg.primary },
});
