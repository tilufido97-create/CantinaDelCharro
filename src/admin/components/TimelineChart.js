import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TimelineChart = ({ data, showIngresos = true, showProfit = true, height = 250 }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No hay datos disponibles</Text>
      </View>
    );
  }

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.ingresos || 0, d.profit || 0, d.gastos || 0))
  );

  const normalize = (value) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * (height - 60);
  };

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartArea}>
          {data.map((item, index) => {
            const ingresosHeight = normalize(item.ingresos);
            const profitHeight = normalize(item.profit);

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barsWrapper}>
                  {showIngresos && (
                    <View 
                      style={[
                        styles.bar,
                        styles.ingresosBar,
                        { height: ingresosHeight }
                      ]} 
                    />
                  )}
                  {showProfit && (
                    <View 
                      style={[
                        styles.bar,
                        styles.profitBar,
                        { height: profitHeight }
                      ]} 
                    />
                  )}
                </View>
                <Text style={styles.label}>{item.fechaLabel}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {showIngresos && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFB800' }]} />
            <Text style={styles.legendText}>Ingresos</Text>
          </View>
        )}
        {showProfit && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Profit</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20
  },
  noData: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingBottom: 30
  },
  barContainer: {
    alignItems: 'center',
    width: 40
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 180
  },
  bar: {
    width: 16,
    borderRadius: 4
  },
  ingresosBar: {
    backgroundColor: '#FFB800'
  },
  profitBar: {
    backgroundColor: '#34C759'
  },
  label: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 8,
    transform: [{ rotate: '-45deg' }]
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12
  }
});

export default TimelineChart;
