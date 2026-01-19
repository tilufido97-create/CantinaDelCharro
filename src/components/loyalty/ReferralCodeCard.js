import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function ReferralCodeCard({ code, referralsCount }) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('✅ Copiado', 'Código copiado al portapapeles');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Únete a La Cantina del Charro con mi código ${code} y ambos ganamos 200 puntos! 🍺`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>TU CÓDIGO DE REFERIDO</Text>
      
      <View style={styles.codeContainer}>
        <Text style={styles.code}>{code}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={20} color={COLORS.accent.gold} />
        </TouchableOpacity>
      </View>

      <Text style={styles.info}>Comparte y gana 200 puntos</Text>
      <Text style={styles.subinfo}>Tu amigo también gana 200 puntos</Text>

      <View style={styles.stats}>
        <Ionicons name="people" size={20} color={COLORS.accent.gold} />
        <Text style={styles.statsText}>{referralsCount} referidos activos</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color={COLORS.bg.primary} />
        <Text style={styles.shareText}>COMPARTIR CÓDIGO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: 16, marginHorizontal: SPACING.md },
  title: { fontSize: 12, fontWeight: '700', color: COLORS.text.tertiary, marginBottom: SPACING.md, letterSpacing: 1 },
  codeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bg.tertiary, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md },
  code: { fontSize: 24, fontWeight: '800', color: COLORS.accent.gold, letterSpacing: 2 },
  copyButton: { padding: SPACING.sm },
  info: { fontSize: 14, color: COLORS.text.primary, marginBottom: 4 },
  subinfo: { fontSize: 12, color: COLORS.text.secondary, marginBottom: SPACING.md },
  stats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  statsText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent.gold, padding: SPACING.md, borderRadius: 12 },
  shareText: { fontSize: 14, fontWeight: '700', color: COLORS.bg.primary },
});
