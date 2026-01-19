import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getUserData } from '../../services/loyaltyService';
import ReferralCodeCard from '../../components/loyalty/ReferralCodeCard';

export default function ReferralScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    setUserData(data || { referralCode: 'CHARRO-ABC123', referralsCount: 0 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INVITA Y GANA</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <ReferralCodeCard code={userData?.referralCode} referralsCount={userData?.referralsCount} />

        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>¿CÓMO FUNCIONA?</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Comparte tu código</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Tu amigo completa su primera compra</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Ambos ganan 200 puntos</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { flex: 1, paddingTop: SPACING.lg },
  howItWorks: { margin: SPACING.lg, backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.tertiary, marginBottom: SPACING.md, letterSpacing: 1 },
  step: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent.gold, color: COLORS.bg.primary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 },
  stepText: { flex: 1, fontSize: 14, color: COLORS.text.primary },
});
