import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getAdmins, addAdmin, removeAdmin, getCurrentAdmin } from '../utils/adminAuth';
import { ROLES, getRoleName } from '../utils/permissions';
import AdminLayout from '../components/AdminLayout';

export default function AdminsManagementScreen({ route }) {
  const user = route.params?.user;
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', role: 'ADMIN' });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const list = await getAdmins();
    setAdmins(list);
  };

  const handleAdd = async () => {
    if (!newAdmin.email || !newAdmin.name) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    const current = await getCurrentAdmin();
    await addAdmin(newAdmin.email, newAdmin.name, newAdmin.role, current.email);
    setShowAddModal(false);
    setNewAdmin({ email: '', name: '', role: 'ADMIN' });
    loadAdmins();
  };

  const handleRemove = async (email) => {
    Alert.alert('Eliminar Admin', '¿Confirmas eliminar este administrador?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const current = await getCurrentAdmin();
        const result = await removeAdmin(email, current.email);
        if (result.success) {
          loadAdmins();
        } else {
          Alert.alert('Error', result.error);
        }
      }}
    ]);
  };

  return (
    <AdminLayout title="Gestión de Administradores" user={user}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Administradores</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color={COLORS.background.primary} />
            <Text style={styles.addButtonText}>Nuevo Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.superAdminCard}>
          <Text style={styles.superAdminBadge}>SUPER ADMIN</Text>
          <Text style={styles.superAdminName}>Nicolás Pinto</Text>
          <Text style={styles.superAdminEmail}>nicolaspc97@gmail.com</Text>
        </View>

        {admins.map(admin => (
          <View key={admin.id} style={styles.adminCard}>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>{admin.name}</Text>
              <Text style={styles.adminEmail}>{admin.email}</Text>
              <Text style={styles.adminRole}>{getRoleName(admin.role)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(admin.email)}>
              <Ionicons name="trash-outline" size={24} color={COLORS.semantic.error} />
            </TouchableOpacity>
          </View>
        ))}

        {showAddModal && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nuevo Administrador</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.text.tertiary}
                value={newAdmin.email}
                onChangeText={(text) => setNewAdmin({...newAdmin, email: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={COLORS.text.tertiary}
                value={newAdmin.name}
                onChangeText={(text) => setNewAdmin({...newAdmin, name: text})}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                  <Text style={styles.saveButtonText}>Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text.primary },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent.gold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, cursor: 'pointer' },
  addButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.background.primary, marginLeft: SPACING.sm },
  superAdminCard: { backgroundColor: COLORS.accent.gold, padding: 20, borderRadius: 12, marginBottom: SPACING.lg },
  superAdminBadge: { fontSize: 12, fontWeight: '700', color: COLORS.background.primary },
  superAdminName: { fontSize: 20, fontWeight: '700', color: COLORS.background.primary, marginTop: SPACING.sm },
  superAdminEmail: { fontSize: 14, color: COLORS.background.primary, opacity: 0.8, marginTop: 4 },
  adminCard: { backgroundColor: COLORS.background.secondary, padding: 20, borderRadius: 12, marginBottom: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary },
  adminEmail: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
  adminRole: { fontSize: 12, color: COLORS.text.tertiary, marginTop: 4 },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.background.secondary, padding: 32, borderRadius: 16, width: '90%', maxWidth: 500 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.lg },
  input: { backgroundColor: COLORS.background.tertiary, padding: 16, borderRadius: 12, color: COLORS.text.primary, marginBottom: SPACING.md },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: SPACING.md },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.background.tertiary, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.text.secondary },
  saveButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.accent.gold, alignItems: 'center' },
  saveButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.background.primary }
});
