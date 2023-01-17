import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY, API_NUTR_URL, KEY_NUTR } from './config';
//import { AJAX, AJAX } from './helpers';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  ingNutFacts: [],
  testNutr: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
    ingForCalc: recipe.ingForCalc,
    ingNutFacts: [],
    nutFacts: [],
  };
};

// prettier-ignore
const wordsToRemove = [
  'Softened', 'and', 'thinkly', 'chopped', 'grated', 'crumbled', 'good', 'sliced', 'into', 'halved', 'for',
  'sprinkling', 'cubes', 'more', 'shredded', 'extra', 'thinning', 'prepared', 'weight', 'we', 'used', 'minced',
  'or', 'to', 'taste', 'pitted', 'peel', 'removed', 'soft', 'of', 'sieved', 'torn', 'thinly', 'ahead', 'shaved',
  'if', 'needed', 'al dente', 'Reserved', 'leftover', 'handfuls', 'and/or', 'tiny', 'trees', 'anything', 'cooking',
  'fine', 'grain', 'slices', 'small', 'breads', 'large', 'short', 'fusilli', 'rotini', 'inch', 'pieces', 'cut',
  'drizzle', 'of', 'any', 'variety', 'recipe', 'above', 'fresh', 'medium', 'florets', 'refrigerated', 'warmed', 'little',
  'liquid', 'crushed', 'splashing'

];

export function removeFromString(words, str) {
  str.indexOf(' or ') != -1 ? (str = str.slice(str.indexOf(' or '))) : '';
  str.indexOf(' in ') != -1 ? (str = str.slice(0, str.indexOf(' in '))) : '';
  str.indexOf('/') != -1 ? (str = str.slice(0, str.indexOf('/'))) : '';

  return words.reduce(
    (result, word) =>
      result
        .replaceAll(new RegExp('\\b' + word + '\\b', 'gi'), '')
        .trim()
        .replaceAll(/ +(?= )/g, '')
        .replaceAll(/[0-9]/g, '')
        .replace('-', ''),
    str
  );
}

export const loadRecipe = async function (id) {
  try {
    console.log(state);
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    //console.log(data);
    state.recipe = createRecipeObject(data);
    //console.log(...state.recipe.ingredients);

    const ingr = state.recipe.ingredients;
    console.log(ingr);
    const description = state.recipe.ingredients.map(el => el.description);
    console.log(description);

    const resa = description.map(el => {
      //el.indexOf('/') === -1 ? el.slice(el.indexOf('/')) : console.log('no /');
      return removeFromString(wordsToRemove, el);
    });
    //console.log(resa);
    state.recipe.ingForCalc = resa;
    console.log(state.recipe.ingredients);
    console.log(state.recipe.ingForCalc);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 'model'`);
    throw err;
  }
};

export const loadNutrData = async function (ingId, amount, unit) {
  try {
    const data = await AJAX(
      `${API_NUTR_URL}${ingId}/information?apiKey=${KEY_NUTR}&amount=${amount}&unit=${unit}`
    );

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loadIngrSearchId = async function (searchIng) {
  try {
    const res = await AJAX(
      `${API_NUTR_URL}search?apiKey=${KEY_NUTR}&query=${searchIng}`
    );

    //const data = await loadIngrSearchRes1(searchIng);

    return res.results[0];
  } catch (err) {
    console.error(`${err} 'model'`);
    throw err;
  }
};

export const storedRecipeIds = (
  curRecipeId = state.recipe.id,
  storedIds = state.ingNutFacts
) => storedIds.filter(el => el.recipeId === curRecipeId)[0];

// export const filterNutrFromRecipe = (
//   nutrToFilter,
//   ingr = storedRecipeIds().ingrIds //ingr
// ) =>
//   ingr.map(
//     ing =>
//       ing.nutrition.nutrients //.filter(el => el.name === nutrToFilter)[0].amount
//         .filter(el => nutrToFilter.indexOf(el.name) != -1) //[0].amount
//   );
// //.map(el => [el].amount.reduce((tot, el) => tot + el, 0));

const filterNutrFromRecipe = (
  nutrientsToFilterArr,
  objArr = storedRecipeIds().ingrIds
) => {
  return nutrientsToFilterArr && nutrientsToFilterArr.length > 0
    ? objArr.map(el =>
        el.nutrition.nutrients.filter(
          el => nutrientsToFilterArr.indexOf(el.name) !== -1
        )
      )
    : objArr;
};

// Summing up nutrients. Usage: input array of objects pre-filterd for selected nutrients or
//  provide raw aray of ingridients and array of nutrients to filter
const summedNutriFacts = (
  nutrientsToFilterArr,
  objArr = storedRecipeIds().ingrIds
) => {
  const selectedNutrientsPerIngr =
    nutrientsToFilterArr && nutrientsToFilterArr.length > 0
      ? filterNutrFromRecipe(nutrientsToFilterArr, objArr)
      : objArr;

  // Create new object from one element of input object to later sum all elements.
  const finalObj = JSON.parse(JSON.stringify(selectedNutrientsPerIngr[0]));
  // All properties to be summed up are zerod
  finalObj.map(prop => {
    prop.amount = 0;
    prop.percentOfDailyNeeds = 0;
  });
  // Map over array of array of objects -  each array of objects of selected nutrients per Ingridient
  selectedNutrientsPerIngr.map(selectedNutrientsArr =>
    // Map over array of objects - each object contains selected nutrients to sum
    selectedNutrientsArr.map((nutrient, i) => {
      finalObj[i].amount += nutrient.amount;
      finalObj[i].percentOfDailyNeeds += nutrient.percentOfDailyNeeds;
    })
  );

  return finalObj;
};

const testo = [
  {
    name: 'Calories',
    amount: 75.48,
    unit: 'kcal',
    percentOfDailyNeeds: 3.7699999999999996,
  },
  {
    name: 'Sodium',
    amount: 265.04,
    unit: 'mg',
    percentOfDailyNeeds: 11.519999999999998,
  },
  {
    name: 'Protein',
    amount: 0.53,
    unit: 'g',
    percentOfDailyNeeds: 1.0500000000000003,
  },
];

export const nutFactsGen = async function () {
  try {
    const arrx = ['Calories', 'Sodium', 'Protein'];
    //const selected = ()
    console.log(storedRecipeIds());
    console.log(filterNutrFromRecipe(arrx));
    // const curRecipeNutrTot = (storedRecipeIds().curRecipeNutrTot = {
    //   Calories: filterNutrFromRecipe('Calories'),
    // });

    // const curRecipeNutrTot = (storedRecipeIds().curRecipeNutrTot = {
    //   Calories: filterNutrFromRecipe(arrx.filter(el => el === 'Calories')),
    // });

    const curRecipeNutrTot = (storedRecipeIds().curRecipeNutrTot =
      filterNutrFromRecipe(arrx)); //.map(el => el.reduce));
    console.log(curRecipeNutrTot);

    storedRecipeIds().selectedNutrients = testo;

    state.recipe.nutrientsSum = summedNutriFacts([
      'Calories',
      'Sodium',
      'Protein',
    ]);

    state.recipe.nutrients = filterNutrFromRecipe([
      'Calories',
      'Sodium',
      'Protein',
    ]);

    state.recipe.nutrientCur = JSON.parse(
      JSON.stringify(state.recipe.nutrientsSum)
    );

    console.log(testo);

    //console.log(filterNutrFromRecipe(arrx.filter(el => el === 'Calories'))); //curRecipeNutrTot.Calories.reduce((tot, el) => tot + el));
    // const curRecipeNutrTot = (storedRecipeIds().curRecipeNutrTot = (({
    //   Calories,
    //   Protein,
    // }) => ({
    //   Calories,
    //   Protein,
    // }))(...filterNutrFromRecipe(arrx)));

    if (!storedRecipeIds()) {
      console.log('Mapping IDs to ingr ');

      let ingr = await Promise.all(
        state.recipe.ingForCalc.map(ing => loadIngrSearchId(ing))
      );
      let ingNutFactsObj = { recipeId: state.recipe.id, ingrIds };
      state.ingNutFacts.push(ingNutFactsObj); //concat
      persist('ingNutFacts', state.ingNutFacts);

      let nutr = await Promise.all(
        state.recipe.ingredients.map((el, i) => {
          console.log('Getting nutr data');

          el.description.indexOf('to taste') != -1
            ? ((el.quantity = 1), (el.unit = 'pinch'))
            : '';

          el.unit === '' ? (el.unit = 1) : '';
          el.quantity === '' ? (el.quantity = 1) : '';

          const ingrAfterInitUndefIds =
            //Get nutr facts of the last stored recipe
            state.ingNutFacts.slice(-1)[0].ingrIds[i] == null ///////// .at()
              ? (state.ingNutFacts.slice(-1)[0].ingrIds[i] = { id: 2047 })
              : state.ingNutFacts.slice(-1)[0].ingrIds[i];
          return loadNutrData(ingrAfterInitUndefIds.id, el.quantity, el.unit);
        })
      );

      state.ingNutFacts.slice(-1)[0].ingrIds = nutr;
      persist('ingNutFacts', state.ingNutFacts);
    }
    console.log(state.ingNutFacts);
  } catch (err) {
    console.error(err);
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    console.error(`${err} model`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  for (const ing of state.recipe.ingredients) {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  }

  //   state.recipe.ingredients.forEach(ing => {
  //     ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  //   });

  state.recipe.servings = newServings;
};

export const updateHoveredIngNurt = function (indx) {
  state.recipe.nutrientCur = JSON.parse(
    JSON.stringify(state.recipe.nutrients[indx])
  );
  state.recipe.nutrientCur.description = JSON.parse(
    JSON.stringify(state.recipe.ingredients[indx].description)
  );
};

const persist = function (property, statePath) {
  localStorage.setItem(property, JSON.stringify(statePath));
};

export const addbookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persist('bookmarks', state.bookmarks);
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persist('bookmarks');
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  storage ? (state.bookmarks = JSON.parse(storage)) : '';

  const storageNutIng = localStorage.getItem('ingNutFacts');
  storageNutIng ? (state.ingNutFacts = JSON.parse(storageNutIng)) : '';

  const storageTestNutr = localStorage.getItem('testNutr');
  storageTestNutr ? (state.testNutr = JSON.parse(storageTestNutr)) : '';
  //nutFactsGen();
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        //const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error('Wrong ingredient format! Please use correct format');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addbookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
