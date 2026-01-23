import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import GoalCard from '../components/GoalCard';
import { getCurrentAdmin } from '../utils/adminAuth';
import { DEFAULT_GOALS, calculateGoalProgress } from '../utils/financialAnalytics';
import { formatCurrency } from '../utils/financialCalculator';

const FinancialGoalsScreen = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState({
    diaria: { activa: true, monto: DEFAULT_GOALS.diaria },
    semanal: { activa: true, monto: DEFAULT_GOALS.semanal },
    mensual: { activa: true, monto: DEFAULT_GOALS.mensual }
  });
  const [currentProgress, setCurrentProgress] = useState({
    diaria: { actual: 0, porcentaje: 0, alcanzada: false },
    semanal: { actual: 0, porcentaje: 0, alcanzada: false },
    mensual: { actual: 0, porcentaje: 0, alcanzada: false }
  });
  const [transactions, setTransactions] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [tempGoalValue, setTempGoalValue] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    loadGoals();
    loadTransactions();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await AsyncStorage.getItem('financial_goals');
      if (data) {
        setGoals(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem('financial_transactions');
      const txns = data ? JSON.parse(data) : [];
      setTransactions(txns);
      calculateAllProgress(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const calculateAllProgress = (txns) => {
    const progress = {
      diaria: calculateGoalProgress(txns, goals.diaria.monto, 'today'),
      semanal: calculateGoalProgress(txns, goals.semanal.monto, 'week'),
      mensual: calculateGoalProgress(txns, goals.mensual.monto, 'month')
    };
    setCurrentProgress(progress);
  };

  const handleEditGoal = (period) => {
    setEditingGoal(period);
    setTempGoalValue(goals[period].monto.toString());
    setIsEditModalVisible(true);
  };

  const handleSaveGoal = async () => {
    const value = parseFloat(tempGoalValue);
    if (!value || value <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0');
      return;
    }

    try {
      const updatedGoals = {
        ...goals,
        [editingGoal]: { ...goals[editingGoal], monto: value }
      };
      await AsyncStorage.setItem('financial_goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
      setIsEditModalVisible(false);
      calculateAllProgress(transactions);
      Alert.alert('Éxito', 'Meta actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la meta');
    }
  };

  const handleToggleGoal = async (period) => {
    try {
      const updatedGoals = {
        ...goals,
        [period]: { ...goals[period], activa: !goals[period].activa }
      };
      await AsyncStorage.setItem('financial_goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la meta');
    }
  };

  const achievedCount = Object.values(currentProgress).filter(p => p.alcanzada).length;

  if (!user) return null;

  return (
    <AdminLayout title="Metas Financieras" user={user} showBackButton>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Metas Financieras</Text>
          <Text style={styles.headerSubtitle}>Establece y monitorea tus objetivos</Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => Alert.alert('Metas Financieras', 'Configura metas diarias, semanales y mensuales. El sistema calculará automáticamente tu progreso basado en tus ingresos y gastos.')}
        >
          <Ionicons name="information-circle" size={24} color={COLORS.accentGold} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#FFB800', '#FF9500']} style={styles.summaryCard}>
          <Ionicons name="trophy" size={32} color="#FFF" />
          <Text style={styles.summaryTitle}>Metas Alcanzadas Hoy</Text>
          <Text style={styles.summaryValue}>{achievedCount}/3</Text>
          <View style={styles.summaryProgress}>
            <View style={[styles.summaryProgressFill, { width: `${(achievedCount / 3) * 100}%` }]} />
          </View>
        </LinearGradient>

        <GoalCard
          title="Meta Diaria"
          period="diaria"
          goal={goals.diaria.monto}
          current={currentProgress.diaria.actual}
          percentage={currentProgress.diaria.porcentaje}
          achieved={currentProgress.diaria.alcanzada}
          active={goals.diaria.activa}
          onEdit={() => handleEditGoal('diaria')}
          onToggle={() => handleToggleGoal('diaria')}
        />

        <GoalCard
          title="Meta Semanal"
          period="semanal"
          goal={goals.semanal.monto}
          current={currentProgress.semanal.actual}
          percentage={currentProgress.semanal.porcentaje}
          achieved={currentProgress.semanal.alcanzada}
          active={goals.semanal.activa}
          onEdit={() => handleEditGoal('semanal')}
          onToggle={() => handleToggleGoal('semanal')}
        />

        <GoalCard
          title="Meta Mensual"
          period="mensual"
          goal={goals.mensual.monto}
          current={currentProgress.mensual.actual}
          percentage={currentProgress.mensual.porcentaje}
          achieved={currentProgress.mensual.alcanzada}
          active={goals.mensual.activa}
          onEdit={() => handleEditGoal('mensual')}
          onToggle={() => handleToggleGoal('mensual')}
        />

        <View style={styles.tipsCard}>
          <Ionicons name="bulb" size={24} color={COLORS.accentGold} />
          <Text style={styles.tipsText}>💡 Consejo: Ajusta tus metas mensualmente según tu desempeño</Text>
        </View>
      </ScrollView>

      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Meta {editingGoal === 'diaria' ? 'Diaria' : editingGoal === 'semanal' ? 'Semanal' : 'Mensual'}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currency}>Bs</Text>
              <TextInput
                style={styles.input}
                value={tempGoalValue}
                onChangeText={setTempGoalValue}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  infoButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center' },
  summaryTitle: { fontSize: 16, color: '#FFF', marginTop: 12, opacity: 0.9 },
  summaryValue: { fontSize: 48, fontWeight: '700', color: '#FFF', marginVertical: 8 },
  summaryProgress: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  summaryProgressFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
  tipsCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bgSecondary, padding: 16, borderRadius: 16, marginTop: 8 },
  tipsText: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.bgSecondary, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 24, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24 },
  currency: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginRight: 12 },
  input: { flex: 1, fontSize: 24, fontWeight: '600', color: COLORS.textPrimary, paddingVertical: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  saveButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.accentGold, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});

export default FinancialGoalsScreen;
