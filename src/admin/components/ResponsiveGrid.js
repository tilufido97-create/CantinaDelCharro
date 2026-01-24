import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

export default function ResponsiveGrid({ children, minCardWidth = 300, gap = 16 }) {
  const responsive = useResponsive();
  
  const columns = Math.floor((responsive.width - (responsive.isDesktop ? 250 : 0) - 40) / (minCardWidth + gap)) || 1;
  const cardWidth = `${100 / columns}%`;

  return (
    <View style={[styles.grid, { gap }]}>
      {React.Children.map(children, (child, index) => (
        <View style={[styles.gridItem, { width: cardWidth, paddingHorizontal: gap / 2 }]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    marginBottom: 16,
  },
});
