import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { FAQ_DATA } from '../../constants/mockData';

export default function HelpScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView>
        <View style={styles.content}>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>¿Necesitas ayuda inmediata?</Text>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="logo-whatsapp" size={24} color={COLORS.semantic.success} />
              <Text style={styles.contactButtonText}>Contactar por WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES</Text>
          {FAQ_DATA.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.text.tertiary} />
              </View>
              {expandedId === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
  content: { padding: SPACING.md },
  contactCard: { backgroundColor: COLORS.accent.gold + '15', padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.xl, borderLeftWidth: 3, borderLeftColor: COLORS.accent.gold },
  contactTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.md },
  contactButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 8 },
  contactButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.tertiary, letterSpacing: 1, marginBottom: SPACING.md },
  faqCard: { backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary, flex: 1, marginRight: SPACING.sm },
  faqAnswer: { fontSize: 14, color: COLORS.text.secondary, marginTop: SPACING.md, lineHeight: 20 },
});
