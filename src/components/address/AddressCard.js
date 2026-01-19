import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const AddressCard = ({ address, onPress, onEdit, onDelete, onSetDefault }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, address.isDefault && styles.containerDefault]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name={address.type === 'home' ? 'home' : address.type === 'work' ? 'briefcase' : 'location'} 
            size={20} 
            color={address.isDefault ? COLORS.accent.gold : COLORS.text.secondary} 
          />
          <Text style={styles.label}>{address.label || 'Dirección'}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Principal</Text>
          </View>
        )}
      </View>

      <Text style={styles.street}>{address.street}</Text>
      <Text style={styles.details}>
        {address.zone}, {address.city}
      </Text>
      {address.reference && (
        <Text style={styles.reference}>Ref: {address.reference}</Text>
      )}

      <View style={styles.actions}>
        {!address.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onSetDefault(address.id)}
          >
            <Ionicons name="star-outline" size={18} color={COLORS.accent.gold} />
            <Text style={styles.actionText}>Predeterminado</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onEdit(address)}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.semantic.info} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onDelete(address.id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.semantic.error} />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
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
  containerDefault: {
    borderColor: COLORS.accent.gold,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  defaultBadge: {
    backgroundColor: COLORS.accent.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 100,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent.gold,
  },
  street: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  details: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  reference: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});

export default AddressCard;
