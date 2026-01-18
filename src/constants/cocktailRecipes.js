export const COCKTAILS = [
  {
    id: 'mojito',
    name: 'Mojito',
    difficulty: 'medium',
    hints: ['Refrescante', 'Menta', 'Cubano'],
    ingredients: ['ron', 'limon', 'menta', 'azucar', 'soda'],
  },
  {
    id: 'pina_colada',
    name: 'Piña Colada',
    difficulty: 'easy',
    hints: ['Tropical', 'Cremoso', 'Dulce'],
    ingredients: ['ron', 'pina', 'coco', 'hielo'],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    difficulty: 'medium',
    hints: ['Mexicano', 'Ácido', 'Sal'],
    ingredients: ['tequila', 'limon', 'triple_sec', 'sal'],
  },
  {
    id: 'daiquiri',
    name: 'Daiquiri',
    difficulty: 'easy',
    hints: ['Simple', 'Ácido', 'Clásico'],
    ingredients: ['ron', 'limon', 'azucar', 'hielo'],
  },
  {
    id: 'caipirinha',
    name: 'Caipirinha',
    difficulty: 'easy',
    hints: ['Brasileño', 'Limón', 'Fuerte'],
    ingredients: ['cachaca', 'limon', 'azucar'],
  },
];

export const INGREDIENTS = [
  { id: 'ron', name: 'Ron', emoji: '🥃' },
  { id: 'tequila', name: 'Tequila', emoji: '🍹' },
  { id: 'vodka', name: 'Vodka', emoji: '🍸' },
  { id: 'cachaca', name: 'Cachaça', emoji: '🥃' },
  { id: 'limon', name: 'Limón', emoji: '🍋' },
  { id: 'menta', name: 'Menta', emoji: '🌿' },
  { id: 'azucar', name: 'Azúcar', emoji: '🧂' },
  { id: 'soda', name: 'Soda', emoji: '💧' },
  { id: 'pina', name: 'Piña', emoji: '🍍' },
  { id: 'coco', name: 'Coco', emoji: '🥥' },
  { id: 'hielo', name: 'Hielo', emoji: '🧊' },
  { id: 'triple_sec', name: 'Triple Sec', emoji: '🍊' },
  { id: 'sal', name: 'Sal', emoji: '🧂' },
];

export const evaluateCocktail = (selectedIds, targetRecipe) => {
  const correct = selectedIds.filter(id => targetRecipe.ingredients.includes(id)).length;
  const similarity = (correct / targetRecipe.ingredients.length) * 100;
  return Math.round(similarity);
};
