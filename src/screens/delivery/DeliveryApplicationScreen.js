import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';

const REQUIRED_DOCUMENTS = [
  { id: 'ci', name: 'Carnet de Identidad', icon: 'card', description: 'CI vigente, ambos lados' },
  { id: 'license', name: 'Licencia de Conducir', icon: 'car', description: 'Categoría moto vigente' },
  { id: 'ruat', name: 'RUAT del Vehículo', icon: 'document-text', description: 'Registro del vehículo' },
  { id: 'soat', name: 'SOAT', icon: 'shield-checkmark', description: 'Seguro vigente' },
  { id: 'rejap', name: 'REJAP', icon: 'document', description: 'Certificado REJAP' },
  { id: 'cenvi', name: 'CENVI', icon: 'document', description: 'Certificado CENVI' },
  { id: 'antecedentes', name: 'Antecedentes Policiales', icon: 'finger-print', description: 'Certificado vigente' }
];

export default function DeliveryApplicationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [personalData, setPersonalData] = useState({ fullName: '', ci: '', phone: '', address: '', vehicleType: 'moto' });
  const [documents, setDocuments] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleImagePick = async (documentType, side) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });
      if (!result.canceled) {
        setDocuments(prev => ({ ...prev, [`${documentType}_${side}`]: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const handleCameraCapture = async (documentType, side) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });
      if (!result.canceled) {
        setDocuments(prev => ({ ...prev, [`${documentType}_${side}`]: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const validateStep1 = () => {
    const { fullName, ci, phone, address } = personalData;
    if (!fullName.trim()) { Alert.alert('Error', 'El nombre completo es requerido'); return false; }
    if (!ci.trim() || ci.length < 6) { Alert.alert('Error', 'Ingresa un CI válido'); return false; }
    if (!phone.trim() || phone.length < 8) { Alert.alert('Error', 'Ingresa un teléfono válido'); return false; }
    if (!address.trim()) { Alert.alert('Error', 'La dirección es requerida'); return false; }
    return true;
  };

  const validateStep2 = () => {
    const requiredDocs = ['ci_front', 'ci_back', 'license_front', 'license_back', 'ruat_front', 'ruat_back', 'soat_front', 'soat_back', 'rejap_front', 'rejap_back', 'cenvi_front', 'cenvi_back', 'antecedentes_front', 'antecedentes_back'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);
    if (missingDocs.length > 0) {
      Alert.alert('Documentos incompletos', `Faltan ${missingDocs.length} documentos por cargar.`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      Alert.alert('Error', 'Debes aceptar los términos y la política de privacidad');
      return;
    }
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : {};
      const application = {
        id: `app-${Date.now()}`,
        userId: user.id,
        status: 'pending',
        personalData,
        documents,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const existingApps = await AsyncStorage.getItem('delivery_applications');
      const apps = existingApps ? JSON.parse(existingApps) : [];
      apps.push(application);
      await AsyncStorage.setItem('delivery_applications', JSON.stringify(apps));
      await AsyncStorage.setItem('user_delivery_application', JSON.stringify(application));
      setLoading(false);
      Alert.alert('¡Solicitud Enviada! 🎉', 'Tu solicitud ha sido recibida. Nuestro equipo la revisará en las próximas 24-48 horas.\n\nTe notificaremos por WhatsApp cuando tengamos una respuesta.', [{ text: 'Entendido', onPress: () => navigation.goBack() }]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta de nuevo.');
    }
  };

  const ProgressBar = () => {
    const progress = (currentStep / 3) * 100;
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Paso {currentStep} de 3</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  const Step1PersonalInfo = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Información Personal</Text>
      <Text style={styles.stepSubtitle}>Completa tus datos para iniciar el proceso</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} value={personalData.fullName} onChangeText={(text) => setPersonalData(prev => ({ ...prev, fullName: text }))} placeholder="Ej: Juan Carlos Pérez López" placeholderTextColor={COLORS.textTertiary} />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Carnet de Identidad *</Text>
        <TextInput style={styles.input} value={personalData.ci} onChangeText={(text) => setPersonalData(prev => ({ ...prev, ci: text }))} placeholder="Ej: 1234567 LP" placeholderTextColor={COLORS.textTertiary} />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono / WhatsApp *</Text>
        <TextInput style={styles.input} value={personalData.phone} onChangeText={(text) => setPersonalData(prev => ({ ...prev, phone: text }))} placeholder="Ej: 77123456" placeholderTextColor={COLORS.textTertiary} keyboardType="phone-pad" />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Dirección *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={personalData.address} onChangeText={(text) => setPersonalData(prev => ({ ...prev, address: text }))} placeholder="Calle, número, zona" placeholderTextColor={COLORS.textTertiary} multiline numberOfLines={3} />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo de vehículo *</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity style={[styles.radioButton, personalData.vehicleType === 'moto' && styles.radioButtonActive]} onPress={() => setPersonalData(prev => ({ ...prev, vehicleType: 'moto' }))}>
            <Ionicons name="bicycle" size={32} color={personalData.vehicleType === 'moto' ? COLORS.accentGold : COLORS.textTertiary} />
            <Text style={[styles.radioText, personalData.vehicleType === 'moto' && styles.radioTextActive]}>Moto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.radioButton, personalData.vehicleType === 'auto' && styles.radioButtonActive]} onPress={() => setPersonalData(prev => ({ ...prev, vehicleType: 'auto' }))}>
            <Ionicons name="car" size={32} color={personalData.vehicleType === 'auto' ? COLORS.accentGold : COLORS.textTertiary} />
            <Text style={[styles.radioText, personalData.vehicleType === 'auto' && styles.radioTextActive]}>Auto</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Siguiente</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.bgPrimary} />
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const DocumentUploadCard = ({ doc, documentType }) => {
    const frontKey = `${documentType}_front`;
    const backKey = `${documentType}_back`;
    const frontImage = documents[frontKey];
    const backImage = documents[backKey];
    const isComplete = frontImage && backImage;
    
    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <Ionicons name={doc.icon} size={24} color={isComplete ? COLORS.success : COLORS.textPrimary} />
          <View style={styles.documentTitleContainer}>
            <Text style={styles.documentName}>{doc.name}</Text>
            <Text style={styles.documentDescription}>{doc.description}</Text>
          </View>
          {isComplete && <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />}
        </View>
        
        <View style={styles.documentSides}>
          {['front', 'back'].map(side => {
            const key = `${documentType}_${side}`;
            const image = documents[key];
            return (
              <View key={side} style={styles.sideContainer}>
                <Text style={styles.sideLabel}>{side === 'front' ? 'Anverso' : 'Reverso'}</Text>
                {image ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setDocuments(prev => ({ ...prev, [key]: null }))}>
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadOptions}>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleCameraCapture(documentType, side)}>
                      <Ionicons name="camera" size={28} color={COLORS.accentGold} />
                      <Text style={styles.uploadText}>Cámara</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePick(documentType, side)}>
                      <Ionicons name="images" size={28} color={COLORS.accentGold} />
                      <Text style={styles.uploadText}>Galería</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const Step2Documents = () => {
    const uploadedCount = Object.values(documents).filter(Boolean).length;
    const totalRequired = 14;
    
    return (
      <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>Documentos Requeridos</Text>
        <Text style={styles.stepSubtitle}>Sube fotos claras de ambos lados de cada documento</Text>
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{uploadedCount} de {totalRequired} documentos cargados</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(uploadedCount / totalRequired) * 100}%` }]} />
          </View>
        </View>
        
        {REQUIRED_DOCUMENTS.map((doc) => (
          <DocumentUploadCard key={doc.id} doc={doc} documentType={doc.id} />
        ))}
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(1)}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.bgPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const Step3Confirmation = () => {
    const uploadedCount = Object.values(documents).filter(Boolean).length;
    
    return (
      <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>Confirmación</Text>
        <Text style={styles.stepSubtitle}>Revisa tu información antes de enviar</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="person" size={24} color={COLORS.accentGold} />
            <Text style={styles.summaryTitle}>Información Personal</Text>
            <TouchableOpacity onPress={() => setCurrentStep(1)}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryItem}>Nombre: {personalData.fullName}</Text>
            <Text style={styles.summaryItem}>CI: {personalData.ci}</Text>
            <Text style={styles.summaryItem}>Teléfono: {personalData.phone}</Text>
            <Text style={styles.summaryItem}>Vehículo: {personalData.vehicleType === 'moto' ? 'Moto' : 'Auto'}</Text>
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="documents" size={24} color={COLORS.accentGold} />
            <Text style={styles.summaryTitle}>Documentos</Text>
            <TouchableOpacity onPress={() => setCurrentStep(2)}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.docsCheck}>
              <Ionicons name={uploadedCount === 14 ? "checkmark-circle" : "warning"} size={20} color={uploadedCount === 14 ? COLORS.success : COLORS.warning} />
              <Text style={styles.summaryItem}>{uploadedCount} de 14 documentos cargados</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.termsSection}>
          <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptedTerms(!acceptedTerms)}>
            <Ionicons name={acceptedTerms ? "checkbox" : "square-outline"} size={24} color={acceptedTerms ? COLORS.accentGold : COLORS.textTertiary} />
            <Text style={styles.checkboxText}>Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}>
            <Ionicons name={acceptedPrivacy ? "checkbox" : "square-outline"} size={24} color={acceptedPrivacy ? COLORS.accentGold : COLORS.textTertiary} />
            <Text style={styles.checkboxText}>Acepto la <Text style={styles.linkText}>Política de Privacidad</Text></Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(2)}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitButton, (!acceptedTerms || !acceptedPrivacy || uploadedCount < 14) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={!acceptedTerms || !acceptedPrivacy || uploadedCount < 14 || loading}>
            {loading ? <ActivityIndicator color={COLORS.bgPrimary} /> : (
              <>
                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                <Ionicons name="send" size={20} color={COLORS.bgPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aplicar como Delivery</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ProgressBar />
      
      {currentStep === 1 && <Step1PersonalInfo />}
      {currentStep === 2 && <Step2Documents />}
      {currentStep === 3 && <Step3Confirmation />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  progressContainer: { padding: 20, backgroundColor: COLORS.bgSecondary, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  progressLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  progressBarContainer: { height: 8, backgroundColor: COLORS.bgTertiary, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.accentGold },
  progressPercentage: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'right' },
  stepContainer: { flex: 1, padding: 20 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  textArea: { height: 100, textAlignVertical: 'top' },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: COLORS.bgTertiary },
  radioButtonActive: { borderColor: COLORS.accentGold, backgroundColor: COLORS.accentGold + '10' },
  radioText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  radioTextActive: { color: COLORS.accentGold, fontWeight: '600' },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentGold, borderRadius: 12, padding: 16, gap: 8, marginTop: 20 },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary },
  progressInfo: { marginBottom: 24 },
  progressText: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success },
  documentCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  documentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  documentTitleContainer: { flex: 1, marginLeft: 12 },
  documentName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  documentDescription: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  documentSides: { flexDirection: 'row', gap: 12 },
  sideContainer: { flex: 1 },
  sideLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  uploadOptions: { flexDirection: 'row', gap: 8 },
  uploadButton: { flex: 1, backgroundColor: COLORS.bgTertiary, borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accentGold, borderStyle: 'dashed' },
  uploadText: { fontSize: 11, color: COLORS.accentGold, marginTop: 4 },
  imagePreview: { position: 'relative', borderRadius: 8, overflow: 'hidden' },
  previewImage: { width: '100%', height: 120, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: 4, right: 4 },
  navigationButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, gap: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  backButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  submitButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentGold, borderRadius: 12, padding: 16, gap: 8 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary },
  summaryCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 12 },
  editText: { fontSize: 14, color: COLORS.accentGold, fontWeight: '600' },
  summaryContent: { paddingLeft: 36 },
  summaryItem: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  docsCheck: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  termsSection: { marginTop: 24, marginBottom: 20 },
  checkbox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  checkboxText: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  linkText: { color: COLORS.accentGold, fontWeight: '600' }
});
