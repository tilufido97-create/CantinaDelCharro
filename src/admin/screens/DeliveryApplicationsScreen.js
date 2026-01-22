import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';

const APPLICATION_STATUS = {
  pending: { label: 'Pendiente', color: COLORS.warning, icon: 'time' },
  approved: { label: 'Aprobada', color: COLORS.success, icon: 'checkmark-circle' },
  rejected: { label: 'Rechazada', color: COLORS.error, icon: 'close-circle' }
};

const DOCS = ['ci', 'license', 'ruat', 'soat', 'rejap', 'cenvi', 'antecedentes'];
const DOC_NAMES = { ci: 'CI', license: 'Licencia', ruat: 'RUAT', soat: 'SOAT', rejap: 'REJAP', cenvi: 'CENVI', antecedentes: 'Antecedentes' };

export default function DeliveryApplicationsScreen() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const generateCode = () => `DLV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('delivery_applications');
      let apps = data ? JSON.parse(data) : [];
      apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApplications(apps);
      setFilteredApplications(apps);
      setStats({
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    loadApplications();
  }, []);

  useEffect(() => {
    let filtered = [...applications];
    if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);
    setFilteredApplications(filtered);
  }, [statusFilter, applications]);

  const approve = async (app) => {
    Alert.alert('Aprobar', `¿Aprobar a ${app.personalData.fullName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar', onPress: async () => {
          try {
            const code = generateCode();
            const updated = applications.map(a => a.id === app.id ? { ...a, status: 'approved', deliveryCode: code, approvedAt: new Date().toISOString() } : a);
            await AsyncStorage.setItem('delivery_applications', JSON.stringify(updated));
            const active = await AsyncStorage.getItem('active_deliveries');
            const deliveries = active ? JSON.parse(active) : [];
            deliveries.push({ id: `d-${Date.now()}`, code, name: app.personalData.fullName, phone: app.personalData.phone, ci: app.personalData.ci, vehicleType: app.personalData.vehicleType, status: 'active', available: true, completedToday: 0, createdAt: new Date().toISOString() });
            await AsyncStorage.setItem('active_deliveries', JSON.stringify(deliveries));
            setApplications(updated);
            setShowDetailModal(false);
            Alert.alert('Aprobado', `Código: ${code}`);
          } catch (error) {
            Alert.alert('Error', 'No se pudo aprobar');
          }
        }
      }
    ]);
  };

  const reject = async () => {
    if (!rejectionReason.trim()) { Alert.alert('Error', 'Ingresa un motivo'); return; }
    try {
      const updated = applications.map(a => a.id === selectedApplication.id ? { ...a, status: 'rejected', rejectionReason, rejectedAt: new Date().toISOString() } : a);
      await AsyncStorage.setItem('delivery_applications', JSON.stringify(updated));
      setApplications(updated);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      Alert.alert('Rechazado', 'Solicitud rechazada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo rechazar');
    }
  };

  if (!user) return null;

  return (
    <AdminLayout title="Solicitudes Delivery" user={user}>
      <View style={styles.statsBar}>
        {Object.entries(stats).map(([key, val]) => (
          <View key={key} style={styles.statCard}>
            <Text style={[styles.statValue, key === 'approved' && { color: COLORS.success }, key === 'rejected' && { color: COLORS.error }]}>{val}</Text>
            <Text style={styles.statLabel}>{key === 'pending' ? 'Pendientes' : key === 'approved' ? 'Aprobadas' : 'Rechazadas'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <TouchableOpacity style={[styles.filterBtn, statusFilter === 'all' && styles.filterActive]} onPress={() => setStatusFilter('all')}>
            <Text style={styles.filterText}>Todas</Text>
          </TouchableOpacity>
          {Object.keys(APPLICATION_STATUS).map(key => (
            <TouchableOpacity key={key} style={[styles.filterBtn, statusFilter === key && styles.filterActive]} onPress={() => setStatusFilter(key)}>
              <Text style={styles.filterText}>{APPLICATION_STATUS[key].label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadApplications}>
          <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} /> : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 80 }]}>ID</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>CI</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Vehículo</Text>
            <Text style={[styles.headerCell, { width: 140 }]}>Estado</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>Ver</Text>
          </View>
          {filteredApplications.map(app => {
            const status = APPLICATION_STATUS[app.status];
            return (
              <View key={app.id} style={styles.row}>
                <Text style={[styles.cell, { width: 80 }]}>#{app.id.slice(-3)}</Text>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text style={styles.name}>{app.personalData.fullName}</Text>
                  <Text style={styles.date}>{new Date(app.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.cell, { width: 120 }]}>{app.personalData.ci}</Text>
                <View style={[styles.cell, { width: 100, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Ionicons name={app.personalData.vehicleType === 'moto' ? 'bicycle' : 'car'} size={18} color={COLORS.textPrimary} />
                  <Text>{app.personalData.vehicleType === 'moto' ? 'Moto' : 'Auto'}</Text>
                </View>
                <View style={[styles.statusBadge, { width: 140, backgroundColor: status.color + '20' }]}>
                  <Ionicons name={status.icon} size={16} color={status.color} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
                <TouchableOpacity style={[styles.cell, { width: 80 }]} onPress={() => { setSelectedApplication(app); setShowDetailModal(true); }}>
                  <Ionicons name="eye" size={20} color={COLORS.info} />
                </TouchableOpacity>
              </View>
            );
          })}
          {filteredApplications.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="bicycle-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay solicitudes</Text>
            </View>
          )}
        </View>
      )}

      {selectedApplication && (
        <Modal visible={showDetailModal} animationType="slide" transparent onRequestClose={() => setShowDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>#{selectedApplication.id.slice(-3)} - {selectedApplication.personalData.fullName}</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Información Personal</Text>
                  <Text style={styles.info}>Nombre: {selectedApplication.personalData.fullName}</Text>
                  <Text style={styles.info}>CI: {selectedApplication.personalData.ci}</Text>
                  <Text style={styles.info}>Teléfono: {selectedApplication.personalData.phone}</Text>
                  <Text style={styles.info}>Dirección: {selectedApplication.personalData.address}</Text>
                  <Text style={styles.info}>Vehículo: {selectedApplication.personalData.vehicleType === 'moto' ? 'Moto' : 'Auto'}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Documentos</Text>
                  {DOCS.map(doc => (
                    <View key={doc} style={styles.docCard}>
                      <Text style={styles.docName}>{DOC_NAMES[doc]}</Text>
                      <View style={styles.docImages}>
                        <Image source={{ uri: selectedApplication.documents[`${doc}_front`] }} style={styles.docImg} />
                        <Image source={{ uri: selectedApplication.documents[`${doc}_back`] }} style={styles.docImg} />
                      </View>
                    </View>
                  ))}
                </View>
                {selectedApplication.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => approve(selectedApplication)}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.textPrimary} />
                      <Text style={styles.approveTxt}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowRejectModal(true)}>
                      <Ionicons name="close-circle" size={24} color={COLORS.textPrimary} />
                      <Text style={styles.rejectTxt}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedApplication.status === 'approved' && (
                  <View style={styles.approved}>
                    <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                    <Text style={styles.approvedTxt}>Aprobado</Text>
                    <Text style={styles.code}>{selectedApplication.deliveryCode}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={showRejectModal} animationType="fade" transparent onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rechazar Solicitud</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Motivo:</Text>
            <TextInput style={styles.textarea} value={rejectionReason} onChangeText={setRejectionReason} placeholder="Explica el motivo..." placeholderTextColor={COLORS.textTertiary} multiline numberOfLines={4} />
            <TouchableOpacity style={styles.confirmBtn} onPress={reject}>
              <Text style={styles.confirmTxt}>Confirmar Rechazo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  statsBar: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: COLORS.bgSecondary, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.bgTertiary, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  statLabel: { fontSize: 13, color: COLORS.textSecondary },
  toolbar: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.bgSecondary, marginRight: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  filterActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  filterText: { fontSize: 13, color: COLORS.textPrimary },
  refreshBtn: { padding: 12, backgroundColor: COLORS.bgSecondary, borderRadius: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  table: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: COLORS.bgTertiary },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  cell: { fontSize: 13, color: COLORS.textPrimary },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textTertiary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.bgPrimary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 900, maxHeight: '90%' },
  rejectModal: { backgroundColor: COLORS.bgPrimary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 500 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  section: { marginBottom: 24, backgroundColor: COLORS.bgSecondary, padding: 20, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  info: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8 },
  docCard: { backgroundColor: COLORS.bgTertiary, padding: 16, borderRadius: 12, marginBottom: 12 },
  docName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  docImages: { flexDirection: 'row', gap: 12 },
  docImg: { flex: 1, height: 150, borderRadius: 8, backgroundColor: COLORS.bgPrimary },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success, borderRadius: 12, padding: 16, gap: 8 },
  approveTxt: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.error, borderRadius: 12, padding: 16, gap: 8 },
  rejectTxt: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  approved: { alignItems: 'center', padding: 40, backgroundColor: COLORS.success + '10', borderRadius: 12 },
  approvedTxt: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  code: { fontSize: 24, fontWeight: '700', color: COLORS.accentGold, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  textarea: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary, height: 120, textAlignVertical: 'top', marginBottom: 16 },
  confirmBtn: { backgroundColor: COLORS.error, borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmTxt: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }
});
