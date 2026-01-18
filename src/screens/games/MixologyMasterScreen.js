import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { COLORS, SPACING } from '../../constants/theme';
import { COCKTAILS, INGREDIENTS, evaluateCocktail } from '../../constants/cocktailRecipes';

export default function MixologyMasterScreen({ navigation }) {
  const [targetRecipe] = useState(COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shakeProgress, setShakeProgress] = useState(0);

  useEffect(() => {
    const subscription = Accelerometer.addListener(data => {
      const movement = Math.abs(data.x) + Math.abs(data.y);
      if (movement > 2 && selectedIngredients.length > 0) {
        setShakeProgress(prev => Math.min(prev + 5, 100));
      }
    });

    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [selectedIngredients]);

  useEffect(() => {
    if (shakeProgress >= 100) {
      const similarity = evaluateCocktail(selectedIngredients, targetRecipe);
      let points = similarity === 100 ? 200 : similarity >= 80 ? 150 : similarity >= 60 ? 100 : 50;
      let message = similarity === 100 ? `¡Perfecto! ${targetRecipe.name}` : 'Buen intento';
      
      Alert.alert('🍹 Resultado', `${message}\nSimilitud: ${similarity}%\n+${points} pts`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [shakeProgress]);

  const toggleIngredient = (id) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(prev => prev.filter(i => i !== id));
    } else if (selectedIngredients.length < 7) {
      setSelectedIngredients(prev => [...prev, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍹 Mixology Master</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.hintsCard}>
          <Text style={styles.hintsTitle}>Pistas:</Text>
          {targetRecipe.hints.map((hint, i) => (
            <Text key={i} style={styles.hint}>• {hint}</Text>
          ))}
        </View>

        <View style={styles.shakerContainer}>
          <Text style={styles.shakerEmoji}>🥤</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${shakeProgress}%` }]} />
          </View>
          <Text style={styles.shakeText}>
            {shakeProgress < 100 ? '📱 Agita el teléfono' : '✅ Listo!'}
          </Text>
        </View>

        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Agregados:</Text>
          {selectedIngredients.length === 0 ? (
            <Text style={styles.emptyText}>Ninguno</Text>
          ) : (
            selectedIngredients.map(id => {
              const ing = INGREDIENTS.find(i => i.id === id);
              return <Text key={id} style={styles.selectedItem}>{ing.emoji} {ing.name}</Text>;
            })
          )}
        </View>

        <ScrollView style={styles.ingredientsScroll} contentContainerStyle={styles.ingredientsGrid}>
          {INGREDIENTS.map(ingredient => (
            <TouchableOpacity
              key={ingredient.id}
              style={[styles.ingredientCard, selectedIngredients.includes(ingredient.id) && styles.ingredientSelected]}
              onPress={() => toggleIngredient(ingredient.id)}
            >
              <Text style={styles.ingredientEmoji}>{ingredient.emoji}</Text>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { flex: 1, padding: SPACING.lg },
  hintsCard: { backgroundColor: COLORS.bg.secondary, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg },
  hintsTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.accent.gold, marginBottom: SPACING.sm },
  hint: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
  shakerContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  shakerEmoji: { fontSize: 80, marginBottom: SPACING.md },
  progressBar: { width: '100%', height: 20, backgroundColor: COLORS.bg.tertiary, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent.gold },
  shakeText: { fontSize: 16, color: COLORS.text.secondary, marginTop: SPACING.sm },
  selectedContainer: { backgroundColor: COLORS.bg.secondary, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg },
  selectedTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.text.tertiary, fontStyle: 'italic' },
  selectedItem: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
  ingredientsScroll: { flex: 1 },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  ingredientCard: { width: '30%', aspectRatio: 1, backgroundColor: COLORS.bg.secondary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  ingredientSelected: { borderColor: COLORS.accent.gold },
  ingredientEmoji: { fontSize: 32, marginBottom: SPACING.xs },
  ingredientName: { fontSize: 12, color: COLORS.text.primary, textAlign: 'center' },
});
