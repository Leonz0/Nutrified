import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SE } from './config.js';
import nutrisionFactsView from './views/nutritionFactsView.js';
//import addRecipeView from './views/addRecipeView.js';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    //nutrisionFactsView.renderSpinner();

    //0) update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1) Updating bookmarks
    bookmarksView.update(model.state.bookmarks);

    //2) Loading recipe
    await model.loadRecipe(id);

    await model.nutFactsGen();

    //X) Fill nutrision data from API to

    //3) Randering recipe
    //nutrisionFactsView.render(model.state);

    recipeView.render(model.state);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSelectedIng = async function (ingr, el) {
  try {
    if (ingr == null) return;
    model.updateHoveredIngNurt(ingr);
    recipeView.render(model.state);
    //if (ingr == null) return;
    //const ing = recipeView.selectIngHandler();
    //if (!ing) return;
    // Update the recipe servings (in state)
    //await model.updateHoveredIngNurt(ingr);

    // Update the recipe view
    //recipeView.render(model.state.recipe);
    //recipeView.update(model.state);
    //console.log(ingr);
    // indx = ingr;
    // console.log(indx);
    // const nutrCal = model
    //   .storedRecipeIds()
    //   .ingrIds[ingr].nutrition.nutrients.filter(
    //     el => el.name === 'Calories' && 'Protein'
    //   )[0].amount;

    // console.log([nutrCal]);

    // el.innerText = el.innerText != null ? nutrCal : '';

    //console.log(recipeView.selectIngHandler.prevEl);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    resultsView.render(model.getSearchResultsPage(1));

    //4) Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //3) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  !model.state.recipe.bookmarked
    ? model.addbookmark(model.state.recipe)
    : model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  recipeView.selectIngHandler(controlSelectedIng);
  //recipeView.showNutrFactsHandler(controlSelectedIng);
  //nutrisionFactsView.selectIngHandler(controlSelectedIng);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
//clearBookmarks();
// ['haschange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes));
//window.addEventListener('hashchange', showRecipe);

//showRecipe();
