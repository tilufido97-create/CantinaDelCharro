import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const OrderCard = ({ order, onPress }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered':
        return { label: 'Entregado', color: COLORS.semantic.success, icon: 'checkmark-circle' };
      case 'cancelled':
        return { label: 'Cancelado', color: COLORS.semantic.error, icon: 'close-circle' };
      case 'delivering':
        return { label: 'En camino', color: COLORS.semantic.info, icon: 'bicycle' };
      case 'preparing':
        return { label: 'Preparando', color: COLORS.semantic.warning, icon: 'time' };
      default:
        return { label: 'Pendiente', color: COLORS.text.tertiary, icon: 'hourglass' };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.itemsPreview}>
        {order.items.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {item.quantity}x {item.name}
            </Text>
          </View>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{order.items.length - 2} productos más
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: Bs. {order.total.toFixed(2)}</Text>
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.accent.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 13,
    color: COLORS.text.tertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsPreview: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.background.tertiary,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  itemRow: {
    marginBottom: SPACING.xs,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  moreItems: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.gold,
  },
});

export default OrderCard;
