import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const emojiMap = {
  'wine': '🍸',
  'rocket': '🚚',
  'sparkles': '🎉',
  'beer': '🍺',
  'cocktail': '🍹',
  'whiskey': '🥃',
  'champagne': '🍾',
};

const CategoryChip = ({ icon, label, active, onPress }) => {
  if (active) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <LinearGradient
          colors={['#FFB800', '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chipActive}
        >
          <Text style={styles.emojiActive}>{emojiMap[icon] || '🍸'}</Text>
          <Text style={styles.labelActive}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.chipInactive}>
      <Text style={styles.emojiInactive}>{emojiMap[icon] || '🍸'}</Text>
      <Text style={styles.labelInactive}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipActive: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chipInactive: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
  },
  emojiActive: {
    fontSize: 32,
    marginBottom: 8,
  },
  emojiInactive: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  labelActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  labelInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
});

export default CategoryChip;
