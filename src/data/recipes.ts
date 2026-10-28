import type { Recipe, RecipeIngredient } from '../core/types';

// PlatoListo's own recipes. They power the presets and the offline fallback,
// so the demo never stores third-party recipe content.

const ing = (...keys: string[]): RecipeIngredient[] => keys.map((key) => ({ key }));

export const RECIPES: Recipe[] = [
  {
    id: 'egg-fried-rice',
    title: { en: 'Egg fried rice with spinach', es: 'Arroz frito con huevo y espinacas' },
    minutes: 15,
    servings: 2,
    tags: ['asian'],
    art: 'egg-fried-rice',
    ingredients: ing('cooked rice', 'egg', 'spinach', 'onion', 'cherry tomato', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Chop the onion and halve the cherry tomatoes.',
        'Heat a little oil in a large pan and fry the onion for 3 minutes.',
        'Add the cold cooked rice and stir-fry over high heat for 4 minutes.',
        'Push the rice aside, crack in 2 or 3 eggs and scramble them, then mix everything together.',
        'Stir in the spinach and tomatoes until the leaves wilt. Season with salt and pepper.',
      ],
      es: [
        'Pica la cebolla y corta los tomates cherry por la mitad.',
        'Calienta un poco de aceite en una sartén grande y sofríe la cebolla 3 minutos.',
        'Añade el arroz cocido frío y saltéalo a fuego fuerte 4 minutos.',
        'Aparta el arroz, casca 2 o 3 huevos y revuélvelos; luego mézclalo todo.',
        'Incorpora las espinacas y los tomates hasta que las hojas se ablanden. Salpimienta.',
      ],
    },
  },
  {
    id: 'lemon-chicken-rice',
    title: { en: 'Lemon chicken rice', es: 'Arroz con pollo al limón' },
    minutes: 30,
    servings: 2,
    tags: ['chicken'],
    art: 'lemon-chicken-rice',
    ingredients: ing('chicken thigh', 'parsley', 'cooked rice', 'lemon', 'onion', 'spinach', 'greek yogurt', 'salt', 'pepper', 'oil'),
    steps: {
      en: [
        'Season the chicken with lemon zest, salt and pepper. Brown it in a hot pan for 6 minutes per side.',
        'Take the chicken out. Fry the chopped onion in the same pan for 4 minutes.',
        'Add the cooked rice and the juice of half a lemon, and stir until hot.',
        'Fold in the spinach and let it wilt for 1 minute.',
        'Mix the Greek yogurt with a pinch of salt and a squeeze of lemon.',
        'Slice the chicken over the rice, add a spoonful of yogurt sauce and sprinkle with chopped parsley.',
      ],
      es: [
        'Sazona el pollo con ralladura de limón, sal y pimienta. Dóralo en una sartén bien caliente 6 minutos por cada lado.',
        'Saca el pollo. En la misma sartén, sofríe la cebolla picada 4 minutos.',
        'Añade el arroz cocido y el zumo de medio limón, y remueve hasta que esté caliente.',
        'Incorpora las espinacas y deja que se ablanden 1 minuto.',
        'Mezcla el yogur griego con una pizca de sal y un chorrito de limón.',
        'Corta el pollo en tiras sobre el arroz, añade una cucharada de salsa de yogur y espolvorea perejil picado.',
      ],
    },
  },
  {
    id: 'shakshuka-manchego',
    title: { en: 'Shakshuka with manchego', es: 'Shakshuka con manchego' },
    minutes: 25,
    servings: 2,
    tags: ['spicy'],
    art: 'shakshuka',
    ingredients: ing('cherry tomato', 'egg', 'onion', 'spinach', 'manchego', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Fry the chopped onion in a little oil for 5 minutes.',
        'Add the cherry tomatoes, crush them with a spoon and simmer for 8 minutes. Season with salt, pepper and a pinch of chilli if you like.',
        'Stir in the spinach.',
        'Make 4 small hollows and crack an egg into each. Cover and cook for 5 to 6 minutes.',
        'Grate the manchego on top and serve straight from the pan.',
      ],
      es: [
        'Sofríe la cebolla picada con un poco de aceite durante 5 minutos.',
        'Añade los tomates cherry, aplástalos con una cuchara y deja que se cocinen 8 minutos. Salpimienta y, si te gusta, añade una pizca de guindilla.',
        'Incorpora las espinacas.',
        'Haz 4 huecos y casca un huevo en cada uno. Tapa y cocina 5 o 6 minutos.',
        'Ralla el manchego por encima y sirve en la misma sartén.',
      ],
    },
  },
  {
    id: 'spanish-tortilla',
    title: { en: 'Spanish tortilla', es: 'Tortilla de patatas' },
    minutes: 40,
    servings: 4,
    tags: ['spanish'],
    art: 'tortilla',
    ingredients: ing('potato', 'egg', 'onion', 'oil', 'salt'),
    steps: {
      en: [
        'Peel and thinly slice 4 potatoes and 1 onion.',
        'Cook them slowly in plenty of oil over low heat for 20 minutes, until soft. Drain well.',
        'Beat 6 eggs with salt and mix in the potatoes and onion. Let it rest for 5 minutes.',
        'Pour into a hot non-stick pan with a little oil and cook for 4 minutes.',
        'Flip it with a plate and cook the other side for 3 minutes.',
      ],
      es: [
        'Pela y corta en láminas finas 4 patatas y 1 cebolla.',
        'Confítalas a fuego lento en abundante aceite durante 20 minutos, hasta que estén tiernas. Escúrrelas bien.',
        'Bate 6 huevos con sal y mézclalos con las patatas y la cebolla. Deja reposar 5 minutos.',
        'Vierte la mezcla en una sartén antiadherente caliente con un poco de aceite y cuaja 4 minutos.',
        'Dale la vuelta con un plato y cocina el otro lado 3 minutos.',
      ],
    },
  },
  {
    id: 'chicken-pepper-bowl',
    title: { en: 'Chicken and pepper rice bowl', es: 'Bol de arroz con pollo y pimientos' },
    minutes: 25,
    servings: 2,
    tags: ['chicken', 'spicy'],
    plate: {
      base: '#F1E8D4',
      toppings: [
        { kind: 'chunk', color: '#C98F5A', count: 3 },
        { kind: 'blob', color: '#FFFBF5', count: 1 },
        { kind: 'strip', color: '#D2553A', count: 5 },
        { kind: 'strip', color: '#E0A03A', count: 3 },
        { kind: 'grain', color: '#FBF6EA', count: 12 },
      ],
    },
    ingredients: ing('chicken thigh', 'bell pepper', 'onion', 'cooked rice', 'lemon', 'greek yogurt', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Cut the chicken into strips and season with salt, pepper and a pinch of chilli.',
        'Fry the chicken for 6 minutes, then add the sliced pepper and onion for 5 more.',
        'Warm the cooked rice.',
        'Serve the chicken over the rice with a spoonful of yogurt and a squeeze of lemon.',
      ],
      es: [
        'Corta el pollo en tiras y sazónalo con sal, pimienta y una pizca de guindilla.',
        'Saltea el pollo 6 minutos y añade el pimiento y la cebolla en tiras 5 minutos más.',
        'Calienta el arroz cocido.',
        'Sirve el pollo sobre el arroz con una cucharada de yogur y un chorrito de limón.',
      ],
    },
  },
  {
    id: 'spinach-cheese-omelette',
    title: { en: 'Spinach and cheese omelette', es: 'Tortilla francesa de espinacas y queso' },
    minutes: 10,
    servings: 1,
    tags: [],
    plate: {
      base: '#F2D16B',
      toppings: [
        { kind: 'leaf', color: '#6E8B3D', count: 6 },
        { kind: 'cube', color: '#FBF6EC', count: 5 },
      ],
    },
    ingredients: ing('egg', 'spinach', 'cheese', 'milk', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Wilt a handful of spinach in a pan with a little oil, then set it aside.',
        'Beat 2 eggs with a splash of milk, salt and pepper.',
        'Pour the eggs into the pan and cook over medium heat for 2 minutes.',
        'Add the spinach and grated cheese, fold in half and cook for 1 more minute.',
      ],
      es: [
        'Saltea un puñado de espinacas en una sartén con un poco de aceite y resérvalas.',
        'Bate 2 huevos con un chorrito de leche, sal y pimienta.',
        'Vierte los huevos en la sartén y cocina a fuego medio 2 minutos.',
        'Añade las espinacas y el queso rallado, dobla la tortilla por la mitad y cocina 1 minuto más.',
      ],
    },
  },
  {
    id: 'chickpeas-spinach',
    title: { en: 'Chickpeas with spinach', es: 'Espinacas con garbanzos' },
    minutes: 25,
    servings: 2,
    tags: ['spanish'],
    plate: {
      base: '#8C7A3E',
      toppings: [
        { kind: 'pea', color: '#E3B873', count: 13 },
        { kind: 'leaf', color: '#5E7A35', count: 7 },
        { kind: 'wedge', color: '#F2C94C', count: 1 },
      ],
    },
    ingredients: ing('chickpea', 'spinach', 'garlic', 'onion', 'lemon', 'oil', 'salt', 'pepper', 'water'),
    steps: {
      en: [
        'Fry the sliced garlic and chopped onion in olive oil for 4 minutes.',
        'Add the spinach and cook until it wilts.',
        'Add the drained chickpeas and a splash of water. Simmer for 10 minutes.',
        'Season with salt, pepper and a squeeze of lemon before serving.',
      ],
      es: [
        'Sofríe el ajo laminado y la cebolla picada en aceite de oliva durante 4 minutos.',
        'Añade las espinacas y cocina hasta que se ablanden.',
        'Incorpora los garbanzos escurridos y un chorrito de agua. Cocina a fuego suave 10 minutos.',
        'Salpimienta y añade un chorrito de limón antes de servir.',
      ],
    },
  },
  {
    id: 'lemon-yogurt-pasta',
    title: { en: 'Creamy lemon yogurt pasta', es: 'Pasta cremosa con yogur y limón' },
    minutes: 20,
    servings: 2,
    tags: ['pasta'],
    plate: {
      base: '#F5EEDC',
      toppings: [
        { kind: 'tube', color: '#E9B949', count: 10 },
        { kind: 'leaf', color: '#6E8B3D', count: 5 },
        { kind: 'wedge', color: '#F2C94C', count: 1 },
      ],
    },
    ingredients: ing('pasta', 'greek yogurt', 'lemon', 'garlic', 'spinach', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Cook 200 g of pasta in salted boiling water.',
        'Gently fry a chopped garlic clove in olive oil for 1 minute and add the spinach until it wilts.',
        'Mix the Greek yogurt with lemon zest, lemon juice, salt and pepper.',
        'Drain the pasta, keeping a little of the water, and stir everything together off the heat.',
      ],
      es: [
        'Cuece 200 g de pasta en agua hirviendo con sal.',
        'Dora suavemente un diente de ajo picado en aceite de oliva 1 minuto y añade las espinacas hasta que se ablanden.',
        'Mezcla el yogur griego con ralladura y zumo de limón, sal y pimienta.',
        'Escurre la pasta, guardando un poco de agua, y mézclalo todo fuera del fuego.',
      ],
    },
  },
  {
    id: 'veggie-fried-rice',
    title: { en: 'Veggie fried rice', es: 'Arroz frito con verduras' },
    minutes: 15,
    servings: 2,
    tags: ['asian'],
    plate: {
      base: '#F1E3C2',
      toppings: [
        { kind: 'dot', color: '#F2C94C', count: 6 },
        { kind: 'dot', color: '#7C9A4E', count: 6 },
        { kind: 'cube', color: '#E07B39', count: 5 },
        { kind: 'grain', color: '#FBF6EA', count: 10 },
      ],
    },
    ingredients: ing('cooked rice', 'frozen vegetable', 'egg', 'onion', 'soy sauce', 'oil'),
    steps: {
      en: [
        'Fry the chopped onion in a very hot wok or pan for 2 minutes.',
        'Add the frozen vegetables and cook for 4 minutes.',
        'Add the cooked rice and stir-fry for 3 minutes.',
        'Push it aside, scramble 2 eggs, then mix everything with a splash of soy sauce.',
      ],
      es: [
        'Saltea la cebolla picada en un wok o una sartén bien caliente 2 minutos.',
        'Añade las verduras congeladas y cocina 4 minutos.',
        'Incorpora el arroz cocido y saltéalo 3 minutos.',
        'Apártalo a un lado, revuelve 2 huevos y mézclalo todo con un chorrito de salsa de soja.',
      ],
    },
  },
  {
    id: 'arroz-con-leche',
    title: { en: 'Spanish rice pudding', es: 'Arroz con leche' },
    minutes: 40,
    servings: 4,
    tags: ['spanish'],
    plate: {
      base: '#FBF3DE',
      toppings: [
        { kind: 'grain', color: '#FFFFFF', count: 18 },
        { kind: 'dot', color: '#B07A48', count: 7 },
        { kind: 'strip', color: '#F2C94C', count: 1 },
      ],
    },
    ingredients: ing('rice', 'milk', 'lemon', 'sugar', 'cinnamon'),
    steps: {
      en: [
        'Put 1 litre of milk in a pot with a strip of lemon peel and a cinnamon stick. Bring it to a gentle simmer.',
        'Add 100 g of rice and cook over low heat for 30 minutes, stirring often.',
        'Stir in 80 g of sugar and cook for 5 more minutes.',
        'Remove the peel and cinnamon, dust with ground cinnamon and serve warm or cold.',
      ],
      es: [
        'Pon 1 litro de leche en un cazo con una tira de piel de limón y una rama de canela. Llévalo a ebullición suave.',
        'Añade 100 g de arroz y cocina a fuego lento 30 minutos, removiendo a menudo.',
        'Incorpora 80 g de azúcar y cocina 5 minutos más.',
        'Retira la piel y la canela, espolvorea canela molida y sirve templado o frío.',
      ],
    },
  },
  {
    id: 'chickpea-tuna-salad',
    title: { en: 'Chickpea and tuna salad', es: 'Ensalada de garbanzos y atún' },
    minutes: 10,
    servings: 2,
    tags: [],
    plate: {
      base: '#E5E8D5',
      toppings: [
        { kind: 'pea', color: '#E3B873', count: 11 },
        { kind: 'dot', color: '#D2553A', count: 6 },
        { kind: 'flake', color: '#D9B28C', count: 6 },
        { kind: 'leaf', color: '#6E8B3D', count: 5 },
      ],
    },
    ingredients: ing('chickpea', 'tuna', 'cherry tomato', 'onion', 'parsley', 'lemon', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Rinse and drain the chickpeas.',
        'Halve the cherry tomatoes and finely chop the onion and parsley.',
        'Mix everything with the drained tuna.',
        'Dress with lemon juice, olive oil, salt and pepper.',
      ],
      es: [
        'Enjuaga y escurre los garbanzos.',
        'Corta los tomates cherry por la mitad y pica fina la cebolla y el perejil.',
        'Mézclalo todo con el atún escurrido.',
        'Aliña con zumo de limón, aceite de oliva, sal y pimienta.',
      ],
    },
  },
  {
    id: 'lentil-salad',
    title: { en: 'Lentil salad', es: 'Ensalada de lentejas' },
    minutes: 15,
    servings: 2,
    tags: [],
    plate: {
      base: '#E5E8D5',
      toppings: [
        { kind: 'dot', color: '#7A5230', count: 18 },
        { kind: 'dot', color: '#D2553A', count: 5 },
        { kind: 'cube', color: '#F2C14E', count: 4 },
        { kind: 'leaf', color: '#6E8B3D', count: 4 },
      ],
    },
    ingredients: ing('lentil', 'bell pepper', 'onion', 'cherry tomato', 'lemon', 'parsley', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Cook the lentils (or use a jar of cooked lentils) and let them cool.',
        'Finely dice the pepper and onion, and halve the cherry tomatoes.',
        'Mix them with the lentils and chopped parsley.',
        'Dress with lemon juice, olive oil, salt and pepper.',
      ],
      es: [
        'Cuece las lentejas (o usa un bote de lentejas cocidas) y deja que se enfríen.',
        'Pica fino el pimiento y la cebolla, y corta los tomates cherry por la mitad.',
        'Mézclalo con las lentejas y el perejil picado.',
        'Aliña con zumo de limón, aceite de oliva, sal y pimienta.',
      ],
    },
  },
  {
    id: 'arroz-a-la-cubana',
    title: { en: 'Cuban-style rice with fried egg', es: 'Arroz a la cubana' },
    minutes: 20,
    servings: 2,
    tags: ['spanish'],
    plate: {
      base: '#FBF6EA',
      toppings: [
        { kind: 'egg', color: '#FBF6EC', count: 1 },
        { kind: 'blob', color: '#C8452F', count: 2 },
        { kind: 'grain', color: '#EFE6D2', count: 14 },
      ],
    },
    ingredients: ing('cooked rice', 'egg', 'canned tomato', 'garlic', 'oil', 'salt'),
    steps: {
      en: [
        'Fry a chopped garlic clove in oil, add the crushed tomatoes and simmer for 10 minutes. Season with salt.',
        'Warm the cooked rice in a pan or in the microwave.',
        'Fry 2 eggs in hot oil until the edges are crispy.',
        'Serve the rice with the tomato sauce and a fried egg on top.',
      ],
      es: [
        'Sofríe un diente de ajo picado, añade el tomate triturado y cocina a fuego suave 10 minutos. Sala.',
        'Calienta el arroz cocido en una sartén o en el microondas.',
        'Fríe 2 huevos en aceite bien caliente hasta que tengan puntilla.',
        'Sirve el arroz con la salsa de tomate y un huevo frito encima.',
      ],
    },
  },
  {
    id: 'potato-spinach-curry',
    title: { en: 'Potato and spinach curry', es: 'Curry de patata y espinacas' },
    minutes: 35,
    servings: 3,
    tags: ['asian', 'spicy'],
    plate: {
      base: '#E1A23A',
      toppings: [
        { kind: 'cube', color: '#F1D9A6', count: 9 },
        { kind: 'leaf', color: '#4F6B2E', count: 7 },
      ],
    },
    ingredients: ing('potato', 'spinach', 'onion', 'garlic', 'canned tomato', 'curry powder', 'oil', 'salt', 'water'),
    steps: {
      en: [
        'Fry the chopped onion and garlic in oil for 5 minutes.',
        'Stir in 2 teaspoons of curry powder for 30 seconds.',
        'Add 3 diced potatoes, the crushed tomatoes and a glass of water. Simmer for 20 minutes.',
        'Stir in the spinach until it wilts and season with salt.',
      ],
      es: [
        'Sofríe la cebolla y el ajo picados en aceite 5 minutos.',
        'Añade 2 cucharaditas de curry en polvo y remueve 30 segundos.',
        'Incorpora 3 patatas en dados, el tomate triturado y un vaso de agua. Cocina a fuego suave 20 minutos.',
        'Añade las espinacas hasta que se ablanden y sala al gusto.',
      ],
    },
  },
  {
    id: 'chicken-chickpea-stew',
    title: { en: 'Chicken and chickpea stew', es: 'Guiso de pollo con garbanzos' },
    minutes: 35,
    servings: 3,
    tags: ['chicken', 'spanish'],
    plate: {
      base: '#C8452F',
      toppings: [
        { kind: 'chunk', color: '#C98F5A', count: 3 },
        { kind: 'pea', color: '#E3B873', count: 9 },
        { kind: 'leaf', color: '#5E7A35', count: 5 },
      ],
    },
    ingredients: ing('chicken thigh', 'chickpea', 'onion', 'garlic', 'canned tomato', 'spinach', 'oil', 'salt', 'pepper', 'water'),
    steps: {
      en: [
        'Season the chicken and brown it in a pot with a little oil, 5 minutes per side.',
        'Add the chopped onion and garlic and cook for 4 minutes.',
        'Pour in the crushed tomatoes, the drained chickpeas and a glass of water. Simmer for 20 minutes.',
        'Stir in the spinach at the end and season to taste.',
      ],
      es: [
        'Salpimienta el pollo y dóralo en una olla con un poco de aceite, 5 minutos por cada lado.',
        'Añade la cebolla y el ajo picados y cocina 4 minutos.',
        'Vierte el tomate triturado, los garbanzos escurridos y un vaso de agua. Cocina a fuego suave 20 minutos.',
        'Añade las espinacas al final y rectifica de sal.',
      ],
    },
  },
  {
    id: 'tuna-tomato-pasta',
    title: { en: 'Pasta with tuna and tomato', es: 'Pasta con atún y tomate' },
    minutes: 20,
    servings: 2,
    tags: ['pasta'],
    plate: {
      base: '#D8603F',
      toppings: [
        { kind: 'tube', color: '#E9B949', count: 10 },
        { kind: 'flake', color: '#D9B28C', count: 6 },
        { kind: 'dot', color: '#6E8B3D', count: 4 },
      ],
    },
    ingredients: ing('pasta', 'tuna', 'canned tomato', 'onion', 'garlic', 'oil', 'salt'),
    steps: {
      en: [
        'Cook 200 g of pasta in salted boiling water.',
        'Meanwhile, fry the chopped onion and garlic in olive oil for 4 minutes.',
        'Add the crushed tomatoes and simmer for 8 minutes. Season.',
        'Stir in the drained tuna.',
        'Mix the sauce with the pasta and a splash of the cooking water.',
      ],
      es: [
        'Cuece 200 g de pasta en agua hirviendo con sal.',
        'Mientras tanto, sofríe la cebolla y el ajo picados en aceite de oliva 4 minutos.',
        'Añade el tomate triturado y cocina a fuego suave 8 minutos. Salpimienta.',
        'Incorpora el atún escurrido.',
        'Mezcla la salsa con la pasta y un chorrito del agua de cocción.',
      ],
    },
  },
  {
    id: 'spaghetti-bolognese',
    title: { en: 'Quick spaghetti bolognese', es: 'Espaguetis a la boloñesa exprés' },
    minutes: 30,
    servings: 3,
    tags: ['pasta'],
    plate: {
      base: '#F1E3C2',
      toppings: [
        { kind: 'noodle', color: '#E9B949', count: 12 },
        { kind: 'dot', color: '#9E4A35', count: 14 },
        { kind: 'dot', color: '#C8452F', count: 6 },
      ],
    },
    ingredients: ing('pasta', 'minced beef', 'canned tomato', 'onion', 'garlic', 'oil', 'salt', 'pepper'),
    steps: {
      en: [
        'Fry the chopped onion and garlic in a little oil for 4 minutes.',
        'Add the minced beef and brown it, breaking it up with a spoon.',
        'Pour in the crushed tomatoes, season and simmer for 15 minutes.',
        'Cook the spaghetti in salted water and serve it with the sauce.',
      ],
      es: [
        'Sofríe la cebolla y el ajo picados con un poco de aceite 4 minutos.',
        'Añade la carne picada y dórala, deshaciéndola con una cuchara.',
        'Vierte el tomate triturado, salpimienta y cocina a fuego suave 15 minutos.',
        'Cuece los espaguetis en agua con sal y sírvelos con la salsa.',
      ],
    },
  },
  {
    id: 'pasta-bake',
    title: { en: 'Mozzarella pasta bake', es: 'Pasta gratinada con mozzarella' },
    minutes: 35,
    servings: 3,
    tags: ['pasta'],
    plate: {
      base: '#C8452F',
      toppings: [
        { kind: 'blob', color: '#FFF6E0', count: 4 },
        { kind: 'tube', color: '#E9B949', count: 8 },
        { kind: 'dot', color: '#6E8B3D', count: 3 },
      ],
    },
    ingredients: ing('pasta', 'canned tomato', 'mozzarella', 'onion', 'garlic', 'oil', 'salt'),
    steps: {
      en: [
        'Heat the oven to 200 °C and cook the pasta for 2 minutes less than the packet says.',
        'Make a quick sauce: fry the onion and garlic, add the crushed tomatoes and simmer for 8 minutes.',
        'Mix the pasta with the sauce in an oven dish and cover it with mozzarella.',
        'Bake for 15 minutes, until golden and bubbling.',
      ],
      es: [
        'Precalienta el horno a 200 °C y cuece la pasta 2 minutos menos de lo que indica el paquete.',
        'Prepara una salsa rápida: sofríe la cebolla y el ajo, añade el tomate triturado y cocina 8 minutos.',
        'Mezcla la pasta con la salsa en una fuente y cúbrela con mozzarella.',
        'Hornea 15 minutos, hasta que esté dorada y burbujeante.',
      ],
    },
  },
  {
    id: 'lentils-chorizo',
    title: { en: 'Lentil stew with chorizo', es: 'Lentejas con chorizo' },
    minutes: 45,
    servings: 4,
    tags: ['spanish'],
    plate: {
      base: '#8A5A30',
      toppings: [
        { kind: 'slice', color: '#A8382A', count: 5 },
        { kind: 'cube', color: '#E3C9A0', count: 5 },
        { kind: 'dot', color: '#6E4423', count: 16 },
        { kind: 'strip', color: '#D2553A', count: 3 },
      ],
    },
    ingredients: ing('lentil', 'chorizo', 'onion', 'garlic', 'bell pepper', 'potato', 'oil', 'salt', 'water'),
    steps: {
      en: [
        'Chop the onion, garlic and pepper, and slice the chorizo.',
        'Fry the vegetables in a pot with a little oil for 5 minutes, then add the chorizo for 2 more.',
        'Add 300 g of lentils, 1 diced potato and water to cover by two fingers.',
        'Simmer for 35 minutes, until the lentils are tender. Season with salt.',
      ],
      es: [
        'Pica la cebolla, el ajo y el pimiento, y corta el chorizo en rodajas.',
        'Sofríe las verduras en una olla con un poco de aceite 5 minutos y añade el chorizo 2 minutos más.',
        'Agrega 300 g de lentejas, 1 patata en dados y agua hasta cubrir dos dedos.',
        'Cocina a fuego suave 35 minutos, hasta que las lentejas estén tiernas. Sala al gusto.',
      ],
    },
  },
  {
    id: 'potatoes-chorizo-egg',
    title: { en: 'Potatoes with chorizo and fried egg', es: 'Patatas con chorizo y huevo' },
    minutes: 25,
    servings: 2,
    tags: ['spanish', 'spicy'],
    plate: {
      base: '#EFE6D2',
      toppings: [
        { kind: 'egg', color: '#FBF6EC', count: 1 },
        { kind: 'slice', color: '#A8382A', count: 5 },
        { kind: 'cube', color: '#E3B873', count: 10 },
        { kind: 'strip', color: '#D2553A', count: 3 },
      ],
    },
    ingredients: ing('potato', 'chorizo', 'egg', 'onion', 'bell pepper', 'oil', 'salt'),
    steps: {
      en: [
        'Dice 3 potatoes and fry them in oil for 12 minutes, until golden.',
        'Add the sliced onion, pepper and chorizo and cook for 6 more minutes.',
        'Fry 2 eggs in a separate pan.',
        'Serve the eggs on top of the potatoes and break the yolks at the table.',
      ],
      es: [
        'Corta 3 patatas en dados y fríelas en aceite 12 minutos, hasta que estén doradas.',
        'Añade la cebolla, el pimiento y el chorizo en tiras y cocina 6 minutos más.',
        'Fríe 2 huevos en otra sartén.',
        'Sirve los huevos sobre las patatas y rompe las yemas en la mesa.',
      ],
    },
  },
  {
    id: 'stuffed-peppers',
    title: { en: 'Stuffed peppers with rice and tuna', es: 'Pimientos rellenos de arroz y atún' },
    minutes: 40,
    servings: 2,
    tags: [],
    plate: {
      base: '#EFE6D2',
      toppings: [
        { kind: 'pepper', color: '#D2553A', count: 2 },
        { kind: 'dot', color: '#F2C94C', count: 6 },
        { kind: 'leaf', color: '#6E8B3D', count: 3 },
      ],
    },
    ingredients: ing('bell pepper', 'cooked rice', 'tuna', 'canned tomato', 'onion', 'cheese', 'oil', 'salt'),
    steps: {
      en: [
        'Heat the oven to 190 °C. Halve 2 peppers and remove the seeds.',
        'Fry the chopped onion, add the crushed tomatoes and cook for 5 minutes.',
        'Mix the sauce with the cooked rice and the drained tuna, and fill the peppers.',
        'Top with grated cheese and bake for 25 minutes.',
      ],
      es: [
        'Precalienta el horno a 190 °C. Corta 2 pimientos por la mitad y quítales las semillas.',
        'Sofríe la cebolla picada, añade el tomate triturado y cocina 5 minutos.',
        'Mezcla la salsa con el arroz cocido y el atún escurrido, y rellena los pimientos.',
        'Cubre con queso rallado y hornea 25 minutos.',
      ],
    },
  },
  {
    id: 'pan-con-tomate',
    title: { en: 'Tomato toast with manchego', es: 'Pan con tomate y manchego' },
    minutes: 10,
    servings: 2,
    tags: ['spanish'],
    plate: {
      base: '#E3B873',
      toppings: [
        { kind: 'blob', color: '#D2553A', count: 3 },
        { kind: 'cube', color: '#F2C94C', count: 5 },
        { kind: 'dot', color: '#5E6B3A', count: 4 },
      ],
    },
    ingredients: ing('bread', 'tomato', 'garlic', 'manchego', 'oil', 'salt'),
    steps: {
      en: [
        'Toast thick slices of bread.',
        'Rub them with a cut garlic clove.',
        'Grate the tomato and spread it over the toast.',
        'Add olive oil, salt and thin slices of manchego.',
      ],
      es: [
        'Tuesta rebanadas gruesas de pan.',
        'Frótalas con un diente de ajo cortado.',
        'Ralla el tomate y extiéndelo sobre las tostadas.',
        'Añade aceite de oliva, sal y unas lonchas finas de manchego.',
      ],
    },
  },
  {
    id: 'gazpacho',
    title: { en: 'Gazpacho', es: 'Gazpacho' },
    minutes: 15,
    servings: 4,
    tags: ['spanish'],
    plate: {
      base: '#D8603F',
      toppings: [
        { kind: 'cube', color: '#E3B873', count: 6 },
        { kind: 'dot', color: '#7C9A4E', count: 6 },
      ],
    },
    ingredients: ing('tomato', 'cucumber', 'bell pepper', 'garlic', 'bread', 'oil', 'salt'),
    steps: {
      en: [
        'Roughly chop 1 kg of ripe tomatoes, half a cucumber, half a pepper and a small garlic clove.',
        'Blend with a slice of bread, a good splash of olive oil, salt and a little vinegar if you have some.',
        'Strain it if you like it smooth and chill it for at least an hour.',
      ],
      es: [
        'Trocea 1 kg de tomates maduros, medio pepino, medio pimiento y un diente de ajo pequeño.',
        'Tritúralo con una rebanada de pan, un buen chorro de aceite de oliva, sal y un poco de vinagre si tienes.',
        'Cuélalo si te gusta fino y enfríalo al menos una hora.',
      ],
    },
  },
];

const byId = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

export function recipeById(id: string): Recipe | undefined {
  return byId.get(id);
}
