import type { Lang } from './types';

export type IngredientTag =
  | 'gluten'
  | 'lactose'
  | 'nuts'
  | 'eggs'
  | 'shellfish'
  | 'soy'
  | 'fish'
  | 'meat'
  | 'pork'
  | 'alcohol'
  | 'animal'
  | 'pantry';

export interface CatalogEntry {
  /** Canonical key: lowercase English, singular. */
  key: string;
  en: string;
  es: string;
  /** A more generic ingredient this one can stand in for (cherry tomato → tomato). */
  parent?: string;
  tags?: IngredientTag[];
  /** Other English and Spanish names that mean the same thing. */
  aliases?: string[];
}

const DAIRY: IngredientTag[] = ['lactose', 'animal'];
const MEAT: IngredientTag[] = ['meat', 'animal'];
const PORK: IngredientTag[] = ['meat', 'pork', 'animal'];

export const CATALOG: CatalogEntry[] = [
  // Pantry staples: assumed present, never counted as missing.
  { key: 'salt', en: 'Salt', es: 'Sal', tags: ['pantry'], aliases: ['sea salt', 'kosher salt', 'table salt', 'sal fina', 'sal gruesa'] },
  {
    key: 'pepper',
    en: 'Pepper',
    es: 'Pimienta',
    tags: ['pantry'],
    aliases: ['black pepper', 'ground pepper', 'ground black pepper', 'white pepper', 'pimienta negra'],
  },
  {
    key: 'oil',
    en: 'Oil',
    es: 'Aceite',
    tags: ['pantry'],
    aliases: [
      'olive oil',
      'extra virgin olive oil',
      'vegetable oil',
      'sunflower oil',
      'cooking oil',
      'canola oil',
      'aceite de oliva',
      'aceite de oliva virgen extra',
      'aceite de girasol',
    ],
  },
  { key: 'water', en: 'Water', es: 'Agua', tags: ['pantry'], aliases: ['cold water', 'hot water', 'boiling water'] },

  // Dairy and eggs
  {
    key: 'egg',
    en: 'Eggs',
    es: 'Huevos',
    tags: ['eggs', 'animal'],
    aliases: ['free-range eggs', 'free range eggs', 'large eggs', 'egg yolk', 'egg yolks', 'egg white', 'egg whites', 'huevo', 'huevos camperos'],
  },
  {
    key: 'milk',
    en: 'Milk',
    es: 'Leche',
    tags: DAIRY,
    aliases: ['whole milk', 'semi-skimmed milk', 'skimmed milk', 'skim milk', 'leche entera', 'leche semidesnatada', 'leche desnatada'],
  },
  { key: 'yogurt', en: 'Yogurt', es: 'Yogur', tags: DAIRY, aliases: ['yoghurt', 'plain yogurt', 'natural yogurt', 'yogures', 'yogur natural'] },
  { key: 'greek yogurt', en: 'Greek yogurt', es: 'Yogur griego', parent: 'yogurt', tags: DAIRY, aliases: ['greek yoghurt', 'greek-style yogurt'] },
  {
    key: 'cheese',
    en: 'Cheese',
    es: 'Queso',
    tags: DAIRY,
    aliases: ['grated cheese', 'shredded cheese', 'cheddar', 'cheddar cheese', 'queso rallado', 'queso en lonchas'],
  },
  { key: 'manchego', en: 'Manchego cheese', es: 'Queso manchego', parent: 'cheese', tags: DAIRY, aliases: ['manchego cheese'] },
  {
    key: 'mozzarella',
    en: 'Mozzarella',
    es: 'Mozzarella',
    parent: 'cheese',
    tags: DAIRY,
    aliases: ['mozzarella cheese', 'grated mozzarella', 'shredded mozzarella', 'fresh mozzarella', 'mozzarella rallada'],
  },
  {
    key: 'parmesan',
    en: 'Parmesan',
    es: 'Parmesano',
    parent: 'cheese',
    tags: DAIRY,
    aliases: ['parmesan cheese', 'parmigiano reggiano', 'grated parmesan', 'queso parmesano'],
  },
  { key: 'feta', en: 'Feta', es: 'Queso feta', parent: 'cheese', tags: DAIRY, aliases: ['feta cheese'] },
  { key: 'butter', en: 'Butter', es: 'Mantequilla', tags: DAIRY, aliases: ['unsalted butter', 'salted butter'] },
  {
    key: 'cream',
    en: 'Cream',
    es: 'Nata',
    tags: DAIRY,
    aliases: ['heavy cream', 'double cream', 'single cream', 'whipping cream', 'cooking cream', 'nata para cocinar', 'nata liquida'],
  },

  // Vegetables, fruit and herbs
  { key: 'tomato', en: 'Tomatoes', es: 'Tomates', aliases: ['ripe tomatoes', 'roma tomatoes', 'plum tomatoes', 'tomate', 'tomates maduros'] },
  {
    key: 'cherry tomato',
    en: 'Cherry tomatoes',
    es: 'Tomates cherry',
    parent: 'tomato',
    aliases: ['grape tomatoes', 'tomate cherry'],
  },
  {
    key: 'canned tomato',
    en: 'Crushed tomatoes',
    es: 'Tomate triturado',
    parent: 'tomato',
    aliases: [
      'canned tomatoes',
      'tinned tomatoes',
      'diced tomatoes',
      'chopped tomatoes',
      'canned diced tomatoes',
      'can of tomatoes',
      'tin of tomatoes',
      'tomato sauce',
      'tomato passata',
      'passata',
      'tomato puree',
      'tomate frito',
      'tomate en lata',
      'salsa de tomate',
    ],
  },
  { key: 'spinach', en: 'Spinach', es: 'Espinacas', aliases: ['baby spinach', 'fresh spinach', 'spinach leaves', 'espinaca', 'espinacas baby'] },
  { key: 'lemon', en: 'Lemon', es: 'Limón', aliases: ['lemons', 'lemon juice', 'lemon zest', 'limones', 'zumo de limon'] },
  { key: 'lime', en: 'Lime', es: 'Lima', aliases: ['limes', 'lime juice', 'limas'] },
  {
    key: 'onion',
    en: 'Onion',
    es: 'Cebolla',
    aliases: ['onions', 'yellow onion', 'white onion', 'brown onion', 'red onion', 'sweet onion', 'cebollas', 'cebolla morada'],
  },
  {
    key: 'green onion',
    en: 'Spring onions',
    es: 'Cebolletas',
    parent: 'onion',
    aliases: ['spring onion', 'scallion', 'scallions', 'green onions', 'cebolleta'],
  },
  { key: 'garlic', en: 'Garlic', es: 'Ajo', aliases: ['garlic cloves', 'garlic clove', 'cloves of garlic', 'ajos', 'diente de ajo', 'dientes de ajo'] },
  { key: 'potato', en: 'Potatoes', es: 'Patatas', aliases: ['baking potatoes', 'new potatoes', 'patata', 'papas'] },
  {
    key: 'bell pepper',
    en: 'Peppers',
    es: 'Pimientos',
    aliases: [
      'bell peppers',
      'peppers',
      'red pepper',
      'red peppers',
      'green pepper',
      'yellow pepper',
      'red bell pepper',
      'green bell pepper',
      'yellow bell pepper',
      'capsicum',
      'pimiento',
      'pimiento rojo',
      'pimiento verde',
      'pimientos tricolor',
    ],
  },
  { key: 'zucchini', en: 'Courgettes', es: 'Calabacines', aliases: ['courgette', 'zucchinis', 'calabacin'] },
  { key: 'parsley', en: 'Parsley', es: 'Perejil', aliases: ['fresh parsley', 'flat-leaf parsley', 'parsley leaves', 'perejil fresco'] },
  { key: 'cucumber', en: 'Cucumber', es: 'Pepino', aliases: ['cucumbers', 'pepinos'] },
  { key: 'carrot', en: 'Carrots', es: 'Zanahorias', aliases: ['zanahoria'] },
  { key: 'mushroom', en: 'Mushrooms', es: 'Champiñones', aliases: ['button mushrooms', 'champinon', 'setas'] },
  {
    key: 'frozen vegetable',
    en: 'Frozen vegetables',
    es: 'Verduras congeladas',
    aliases: ['frozen mixed vegetables', 'mixed vegetables', 'frozen veg', 'menestra', 'menestra de verduras'],
  },
  { key: 'avocado', en: 'Avocado', es: 'Aguacate', aliases: ['avocados', 'aguacates'] },
  { key: 'lettuce', en: 'Lettuce', es: 'Lechuga', aliases: ['iceberg lettuce', 'romaine lettuce'] },
  { key: 'broccoli', en: 'Broccoli', es: 'Brócoli', aliases: ['brocoli'] },
  { key: 'eggplant', en: 'Aubergine', es: 'Berenjena', aliases: ['aubergine', 'aubergines', 'eggplants', 'berenjenas'] },
  { key: 'pea', en: 'Peas', es: 'Guisantes', aliases: ['frozen peas', 'green peas', 'guisante'] },
  { key: 'corn', en: 'Sweetcorn', es: 'Maíz', aliases: ['sweetcorn', 'sweet corn', 'corn kernels'] },
  { key: 'banana', en: 'Bananas', es: 'Plátanos', aliases: ['platano'] },
  { key: 'apple', en: 'Apples', es: 'Manzanas', aliases: ['manzana'] },
  { key: 'basil', en: 'Basil', es: 'Albahaca', aliases: ['fresh basil', 'basil leaves'] },
  { key: 'cilantro', en: 'Coriander', es: 'Cilantro', aliases: ['coriander', 'fresh coriander'] },
  { key: 'mint', en: 'Mint', es: 'Hierbabuena', aliases: ['fresh mint', 'mint leaves', 'menta'] },
  { key: 'ginger', en: 'Ginger', es: 'Jengibre', aliases: ['fresh ginger', 'ginger root'] },
  {
    key: 'chili',
    en: 'Chilli',
    es: 'Guindilla',
    aliases: ['chilli', 'chili pepper', 'chilli pepper', 'red chili', 'chili flakes', 'chilli flakes', 'red pepper flakes', 'cayena'],
  },

  // Meat and fish
  { key: 'chicken', en: 'Chicken', es: 'Pollo', tags: MEAT, aliases: ['whole chicken', 'chicken pieces'] },
  {
    key: 'chicken thigh',
    en: 'Chicken thighs',
    es: 'Contramuslos de pollo',
    parent: 'chicken',
    tags: MEAT,
    aliases: ['boneless chicken thighs', 'chicken thigh fillets', 'contramuslo', 'contramuslos'],
  },
  {
    key: 'chicken breast',
    en: 'Chicken breast',
    es: 'Pechuga de pollo',
    parent: 'chicken',
    tags: MEAT,
    aliases: ['boneless chicken breast', 'chicken fillets', 'pechuga', 'pechugas de pollo'],
  },
  { key: 'minced meat', en: 'Minced meat', es: 'Carne picada', tags: MEAT, aliases: ['ground meat', 'mince'] },
  {
    key: 'minced beef',
    en: 'Minced beef',
    es: 'Carne picada de vacuno',
    parent: 'minced meat',
    tags: MEAT,
    aliases: ['ground beef', 'beef mince', 'lean ground beef', 'carne picada de ternera'],
  },
  { key: 'chorizo', en: 'Chorizo', es: 'Chorizo', tags: PORK, aliases: ['chorizo sausage', 'spanish chorizo'] },
  { key: 'ham', en: 'Ham', es: 'Jamón', tags: PORK, aliases: ['serrano ham', 'cooked ham', 'jamon serrano', 'jamon york'] },
  { key: 'bacon', en: 'Bacon', es: 'Beicon', tags: PORK, aliases: ['bacon strips', 'pancetta', 'panceta'] },
  { key: 'sausage', en: 'Sausages', es: 'Salchichas', tags: PORK, aliases: ['salchicha'] },
  { key: 'pork', en: 'Pork', es: 'Cerdo', tags: PORK, aliases: ['pork loin', 'pork chops', 'lomo de cerdo'] },
  { key: 'beef', en: 'Beef', es: 'Ternera', tags: MEAT, aliases: ['beef steak', 'steak', 'filete de ternera'] },
  {
    key: 'tuna',
    en: 'Tuna',
    es: 'Atún',
    tags: ['fish', 'animal'],
    aliases: ['canned tuna', 'tinned tuna', 'tuna in olive oil', 'tuna in oil', 'atun en aceite', 'atun en aceite de oliva', 'atun en lata', 'bonito'],
  },
  { key: 'salmon', en: 'Salmon', es: 'Salmón', tags: ['fish', 'animal'], aliases: ['salmon fillet', 'salmon fillets'] },
  { key: 'shrimp', en: 'Prawns', es: 'Gambas', tags: ['shellfish', 'animal'], aliases: ['prawns', 'prawn', 'shrimps', 'gamba', 'langostinos'] },

  // Grains, legumes and bread
  {
    key: 'rice',
    en: 'Rice',
    es: 'Arroz',
    aliases: ['white rice', 'long grain rice', 'long-grain rice', 'round-grain rice', 'short grain rice', 'basmati rice', 'arroz redondo', 'arroz bomba', 'arroz largo'],
  },
  {
    key: 'cooked rice',
    en: 'Cooked rice',
    es: 'Arroz cocido',
    parent: 'rice',
    aliases: ['leftover rice', 'steamed rice', 'arroz cocinado', 'arroz sobrante'],
  },
  {
    key: 'pasta',
    en: 'Pasta',
    es: 'Pasta',
    tags: ['gluten'],
    aliases: [
      'spaghetti',
      'penne',
      'macaroni',
      'fusilli',
      'rigatoni',
      'linguine',
      'tagliatelle',
      'farfalle',
      'spaghetti pasta',
      'penne pasta',
      'short pasta',
      'espaguetis',
      'macarrones',
      'tallarines',
      'pasta corta',
    ],
  },
  { key: 'noodle', en: 'Noodles', es: 'Fideos', tags: ['gluten'], aliases: ['egg noodles', 'ramen noodles', 'fideos chinos'] },
  {
    key: 'chickpea',
    en: 'Chickpeas',
    es: 'Garbanzos',
    aliases: ['garbanzo', 'garbanzo beans', 'canned chickpeas', 'cooked chickpeas'],
  },
  {
    key: 'lentil',
    en: 'Lentils',
    es: 'Lentejas',
    aliases: ['brown lentils', 'green lentils', 'red lentils', 'cooked lentils', 'lentejas pardinas'],
  },
  {
    key: 'bean',
    en: 'Beans',
    es: 'Alubias',
    aliases: ['white beans', 'kidney beans', 'black beans', 'cannellini beans', 'judias blancas'],
  },
  {
    key: 'bread',
    en: 'Bread',
    es: 'Pan',
    tags: ['gluten'],
    aliases: ['sliced bread', 'baguette', 'rustic bread', 'rustic baguette', 'bread slices', 'crusty bread', 'toast', 'barra de pan', 'pan de molde', 'barra rustica'],
  },
  { key: 'flour', en: 'Flour', es: 'Harina', tags: ['gluten'], aliases: ['plain flour', 'all-purpose flour', 'wheat flour', 'harina de trigo'] },
  { key: 'oat', en: 'Oats', es: 'Copos de avena', tags: ['gluten'], aliases: ['rolled oats', 'oatmeal', 'avena'] },

  // Sauces, spices and the rest
  { key: 'soy sauce', en: 'Soy sauce', es: 'Salsa de soja', tags: ['soy', 'gluten'], aliases: ['soya sauce', 'light soy sauce'] },
  { key: 'tofu', en: 'Tofu', es: 'Tofu', tags: ['soy'], aliases: ['firm tofu'] },
  { key: 'sugar', en: 'Sugar', es: 'Azúcar', aliases: ['white sugar', 'brown sugar', 'caster sugar', 'azucar moreno'] },
  { key: 'honey', en: 'Honey', es: 'Miel', tags: ['animal'] },
  {
    key: 'cinnamon',
    en: 'Cinnamon',
    es: 'Canela',
    aliases: ['ground cinnamon', 'cinnamon stick', 'cinnamon sticks', 'canela en rama', 'canela molida'],
  },
  { key: 'paprika', en: 'Paprika', es: 'Pimentón', aliases: ['smoked paprika', 'sweet paprika', 'pimenton dulce', 'pimenton de la vera'] },
  { key: 'cumin', en: 'Cumin', es: 'Comino', aliases: ['ground cumin', 'cumin seeds'] },
  { key: 'curry powder', en: 'Curry powder', es: 'Curry en polvo', aliases: ['curry'] },
  { key: 'oregano', en: 'Oregano', es: 'Orégano', aliases: ['dried oregano'] },
  { key: 'vinegar', en: 'Vinegar', es: 'Vinagre', aliases: ['white wine vinegar', 'sherry vinegar', 'vinagre de jerez'] },
  {
    key: 'stock',
    en: 'Stock',
    es: 'Caldo',
    aliases: ['chicken stock', 'vegetable stock', 'broth', 'chicken broth', 'vegetable broth', 'caldo de pollo', 'caldo de verduras'],
  },
  { key: 'coconut milk', en: 'Coconut milk', es: 'Leche de coco' },
  { key: 'peanut', en: 'Peanuts', es: 'Cacahuetes', tags: ['nuts'], aliases: ['cacahuete'] },
  { key: 'peanut butter', en: 'Peanut butter', es: 'Crema de cacahuete', tags: ['nuts'] },
  { key: 'almond', en: 'Almonds', es: 'Almendras', tags: ['nuts'], aliases: ['almendra'] },
  { key: 'walnut', en: 'Walnuts', es: 'Nueces', tags: ['nuts'], aliases: ['nuez'] },
  { key: 'wine', en: 'Wine', es: 'Vino', tags: ['alcohol'], aliases: ['white wine', 'red wine', 'dry white wine', 'vino blanco', 'vino tinto'] },
  { key: 'beer', en: 'Beer', es: 'Cerveza', tags: ['alcohol', 'gluten'] },
  { key: 'mayonnaise', en: 'Mayonnaise', es: 'Mayonesa', tags: ['eggs', 'animal'], aliases: ['mayo'] },
];

const byKey = new Map(CATALOG.map((entry) => [entry.key, entry]));

export function catalogEntry(key: string): CatalogEntry | undefined {
  return byKey.get(key);
}

export function parentOf(key: string): string | undefined {
  return byKey.get(key)?.parent;
}

export function tagsOf(key: string): IngredientTag[] {
  return byKey.get(key)?.tags ?? [];
}

export function isPantry(key: string): boolean {
  return tagsOf(key).includes('pantry');
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Display name for an ingredient key in the given language. */
export function ingredientName(key: string, lang: Lang): string {
  const entry = byKey.get(key);
  return entry ? entry[lang] : capitalize(key);
}
