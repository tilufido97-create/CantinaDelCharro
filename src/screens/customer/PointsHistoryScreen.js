import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getUserData, getActivities } from '../../services/loyaltyService';
import PointsActivityItem from '../../components/loyalty/PointsActivityItem';

export default function PointsHistoryScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    const acts = await getActivities();
    setUserData(data || { points: 0, totalEarned: 0, totalSpent: 0 });
    setActivities(acts);
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key].push(activity);
    return acc;
  }, {});

  const sections = Object.keys(groupedActivities).map(month => ({
    title: month,
    data: groupedActivities[month],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HISTORIAL</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total ganado</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>+{userData?.totalEarned.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total gastado</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{userData?.totalSpent.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo actual</Text>
          <Text style={[styles.summaryValue, { color: COLORS.accent.gold }]}>{userData?.points.toLocaleString()}</Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PointsActivityItem {...item} />}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.monthHeader}>{title}</Text>}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  summary: { flexDirection: 'row', backgroundColor: COLORS.bg.secondary, margin: SPACING.lg, padding: SPACING.md, borderRadius: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: COLORS.text.tertiary, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: COLORS.bg.tertiary, marginHorizontal: SPACING.sm },
  list: { paddingHorizontal: SPACING.lg },
  monthHeader: { fontSize: 14, fontWeight: 'bold', color: COLORS.text.secondary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
});
