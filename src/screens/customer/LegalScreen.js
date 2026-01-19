import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../constants/mockData';

export default function LegalScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Privacidad</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>Términos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>Privacidad</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.legalText}>
          {activeTab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background.tertiary },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  placeholder: { width: 40 },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.background.secondary },
  tabActive: { backgroundColor: COLORS.accent.gold + '20' },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  tabTextActive: { color: COLORS.accent.gold },
  content: { flex: 1, paddingHorizontal: SPACING.md },
  legalText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20, paddingBottom: SPACING.xl },
});
