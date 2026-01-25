import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { sendPhoneOTP } from '../../services/authService';

const COUNTRIES = [
  { code: 'BO', dialCode: '+591', flag: '🇧🇴', name: 'Bolivia', length: 8 },
  { code: 'AR', dialCode: '+54', flag: '🇦🇷', name: 'Argentina', length: 10 },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brasil', length: 11 },
  { code: 'CL', dialCode: '+56', flag: '🇨🇱', name: 'Chile', length: 9 },
  { code: 'CO', dialCode: '+57', flag: '🇨🇴', name: 'Colombia', length: 10 },
  { code: 'CR', dialCode: '+506', flag: '🇨🇷', name: 'Costa Rica', length: 8 },
  { code: 'EC', dialCode: '+593', flag: '🇪🇨', name: 'Ecuador', length: 9 },
  { code: 'SV', dialCode: '+503', flag: '🇸🇻', name: 'El Salvador', length: 8 },
  { code: 'GT', dialCode: '+502', flag: '🇬🇹', name: 'Guatemala', length: 8 },
  { code: 'HN', dialCode: '+504', flag: '🇭🇳', name: 'Honduras', length: 8 },
  { code: 'MX', dialCode: '+52', flag: '🇲🇽', name: 'México', length: 10 },
  { code: 'NI', dialCode: '+505', flag: '🇳🇮', name: 'Nicaragua', length: 8 },
  { code: 'PA', dialCode: '+507', flag: '🇵🇦', name: 'Panamá', length: 8 },
  { code: 'PY', dialCode: '+595', flag: '🇵🇾', name: 'Paraguay', length: 9 },
  { code: 'PE', dialCode: '+51', flag: '🇵🇪', name: 'Perú', length: 9 },
  { code: 'UY', dialCode: '+598', flag: '🇺🇾', name: 'Uruguay', length: 8 },
  { code: 'VE', dialCode: '+58', flag: '🇻🇪', name: 'Venezuela', length: 10 },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'Estados Unidos', length: 10 },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'España', length: 9 },
];

export default function PhoneLoginScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef(null);
  const phoneInputRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const isPhoneValid = () => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    return cleanNumber.length === selectedCountry.length;
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, selectedCountry.length);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  const handleContinue = async () => {
    if (!isPhoneValid()) return;
    
    Keyboard.dismiss();
    setLoading(true);
    
    const fullNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/\s/g, '')}`;
    
    try {
      console.log('📱 Enviando SMS a:', fullNumber);
      const result = await sendPhoneOTP(fullNumber);
      
      if (result.success) {
        console.log('✅ SMS enviado exitosamente');
        Alert.alert('✅ Código Enviado', result.message || 'Revisa tu teléfono');
        navigation.navigate('OTPVerification', {
          phone: fullNumber,
          country: selectedCountry,
          verificationId: result.verificationId,
        });
      } else {
        console.log('❌ Error:', result.error);
        Alert.alert('Error', result.error || 'No se pudo enviar el código');
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={[COLORS.bg.primary, COLORS.bg.secondary]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>

            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroSection}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>💀</Text>
                  <Text style={styles.emoji}>🤠</Text>
                </View>
                <Text style={styles.title}>¡Hola, amigo!</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu número para empezar
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.flag}>{selectedCountry.flag}</Text>
                  <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                  <Text style={styles.chevron}>▼</Text>
                </TouchableOpacity>

                <TextInput
                  ref={phoneInputRef}
                  style={styles.phoneInput}
                  placeholder="7654 3210"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  maxLength={selectedCountry.length + Math.floor(selectedCountry.length / 4)}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
              </View>

              <View style={styles.infoSection}>
                <View style={[styles.infoRow, { backgroundColor: '#FFB80020', padding: 12, borderRadius: 8, marginBottom: 8 }]}>
                  <Text style={{ fontSize: 20 }}>🔧</Text>
                  <Text style={[styles.infoText, { color: COLORS.accent.gold, fontWeight: '600' }]}>MODO DESARROLLO: Código de prueba = 123456</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.infoText}>Tus datos están seguros y encriptados</Text>
                </View>
              </View>

              {keyboardVisible && <View style={{ height: 20 }} />}

              <Button
                title="Continuar"
                onPress={handleContinue}
                disabled={!isPhoneValid()}
                loading={loading}
                fullWidth
              />



              {keyboardVisible && <View style={{ height: 40 }} />}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        <Modal
          visible={showCountryPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCountryPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Selecciona tu país</Text>
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.countriesList}>
                    {COUNTRIES.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={[
                          styles.countryItem,
                          selectedCountry.code === country.code && styles.countryItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedCountry(country);
                          setPhoneNumber('');
                          setShowCountryPicker(false);
                          setTimeout(() => phoneInputRef.current?.focus(), 100);
                        }}
                      >
                        <Text style={styles.countryFlag}>{country.flag}</Text>
                        <Text style={styles.countryName}>{country.name}</Text>
                        <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                        {selectedCountry.code === country.code && (
                          <Text style={styles.selectedCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  backButton: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  heroSection: { alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.xxl },
  emojiContainer: { flexDirection: 'row', marginBottom: SPACING.md },
  emoji: { fontSize: 60, marginHorizontal: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  countrySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.xs, minWidth: 120 },
  flag: { fontSize: 24 },
  dialCode: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
  chevron: { fontSize: 10, color: COLORS.text.tertiary },
  phoneInput: { flex: 1, height: 56, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
  infoSection: { marginBottom: SPACING.xl, gap: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkmark: { fontSize: 16, color: COLORS.success },
  infoText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg, gap: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.bg.tertiary },
  dividerText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.bg.secondary, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  closeButton: { fontSize: 24, color: COLORS.text.tertiary, width: 30, height: 30, textAlign: 'center' },
  countriesList: { paddingHorizontal: SPACING.md },
  countryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, marginVertical: SPACING.xs, gap: SPACING.md },
  countryItemSelected: { backgroundColor: COLORS.bg.tertiary },
  countryFlag: { fontSize: 28 },
  countryName: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
  countryDialCode: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary },
  selectedCheck: { fontSize: 20, color: COLORS.accent.gold },
  noteText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary, textAlign: 'center', marginTop: SPACING.md, fontStyle: 'italic' },
});
