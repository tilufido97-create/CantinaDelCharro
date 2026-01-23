import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TopProductsChart = ({ products, showRevenue = true }) => {
  if (!products || products.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No hay productos para mostrar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.map((product, index) => (
        <ProductBar 
          key={product.id} 
          product={product} 
          showRevenue={showRevenue}
          delay={index * 100}
        />
      ))}
    </View>
  );
};

const ProductBar = ({ product, showRevenue, delay }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: product.porcentaje,
      duration: 800,
      delay,
      useNativeDriver: false
    }).start();
  }, [product.porcentaje]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.nombre}
        </Text>
        <Text style={styles.productCategory}>{product.categoria}</Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View style={{ width: animatedWidth }}>
            <LinearGradient
              colors={['#FFB800', '#FF9500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {showRevenue ? `Bs ${product.ingresos.toFixed(0)}` : `${product.cantidadVendida} un.`}
        </Text>
        <Text style={styles.percentage}>{product.porcentaje.toFixed(1)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  noData: {
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  productInfo: {
    width: 120
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  productCategory: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2
  },
  barContainer: {
    flex: 1
  },
  barBackground: {
    height: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    overflow: 'hidden'
  },
  barFill: {
    height: 12,
    borderRadius: 6
  },
  valueContainer: {
    width: 100,
    alignItems: 'flex-end'
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  percentage: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2
  }
});

export default TopProductsChart;
