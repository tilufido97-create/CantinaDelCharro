import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';

const PeakHoursChart = ({ hoursData }) => {
  if (!hoursData || hoursData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No hay datos de horarios</Text>
      </View>
    );
  }

  const maxPedidos = Math.max(...hoursData.map(h => h.pedidos));
  const promedio = hoursData.reduce((sum, h) => sum + h.pedidos, 0) / hoursData.length;
  const horasPico = hoursData.filter(h => h.esPico).map(h => h.hora);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartArea}>
          {hoursData.map((hour) => (
            <HourBar 
              key={hour.hora}
              hour={hour}
              maxPedidos={maxPedidos}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFB800' }]} />
          <Text style={styles.legendText}>Horario pico</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8E8E93' }]} />
          <Text style={styles.legendText}>Horario normal</Text>
        </View>
      </View>

      <View style={styles.insights}>
        <Text style={styles.insightText}>
          Horarios pico: {horasPico.length > 0 ? horasPico.map(h => `${h}:00`).join(', ') : 'N/A'}
        </Text>
        <Text style={styles.insightText}>
          Promedio: {promedio.toFixed(1)} pedidos/hora
        </Text>
      </View>
    </View>
  );
};

const HourBar = ({ hour, maxPedidos }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: hour.pedidos,
      duration: 600,
      delay: hour.hora * 20,
      useNativeDriver: false
    }).start();
  }, [hour.pedidos]);

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, maxPedidos],
    outputRange: [0, 150]
  });

  return (
    <View style={styles.barContainer}>
      <Animated.View 
        style={[
          styles.bar,
          {
            height: animatedHeight,
            backgroundColor: hour.esPico ? '#FFB800' : '#8E8E93'
          }
        ]} 
      />
      <Text style={styles.hourLabel}>{hour.hora}h</Text>
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
    padding: 20
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: 30,
    height: 180
  },
  barContainer: {
    alignItems: 'center',
    width: 24
  },
  bar: {
    width: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  hourLabel: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 8
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
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
  },
  insights: {
    marginTop: 16,
    gap: 8
  },
  insightText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center'
  }
});

export default PeakHoursChart;
