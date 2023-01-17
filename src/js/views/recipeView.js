import View from './View.js';

import icons from 'url:../../img/icons.svg';
import { Fraction } from 'fractional';
import nutritionFactsView from './nutritionFactsView.js';

class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  //#data;
  _errorMessage = 'We could not find that recipe. Please try another one!';
  _message = '';
  _crntIngr = 0;

  addHandlerRender(handler) {
    for (const event of ['hashchange', 'load'])
      window.addEventListener(event, handler);

    // ['haschange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      +updateTo > 0 ? handler(+updateTo) : '';
    });
  }

  addHandlerBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  selectIngHandler(
    handler
    // elToListen = '.recipe__description',
    // elOfInterest = '.recipe__ingredient'
  ) {
    const prevEl = '';

    const indxOfIngrToHandle = indxOfIngr => {
      if (indxOfIngr == null || indxOfIngr === this.prevEl) return;
      return (this.prevEl = indxOfIngr);
    };

    this._parentElement.addEventListener('mouseover', function (e) {
      if (e.target.closest('.recipe__nutrition')) return;

      const nutrTotEl = document.querySelector('.totalNutrData');
      const nutrIngrEl = document.querySelector('.ingridient');
      const showOrHide = e.target.closest('li') ? 'block' : 'none';

      nutrTotEl != null
        ? (nutrTotEl.style.display = showOrHide === 'block' ? 'none' : 'block')
        : '';
      nutrIngrEl != null ? (nutrIngrEl.style.display = showOrHide) : '';

      const indx = indxOfIngrToHandle(
        e.target.closest('li')?.className.split(' ')[1]
      );

      handler(indx, nutrIngrEl);
    });
  }

  showNutrFactsHandler(handler, nutrFactsToShow = this._ingElm) {
    // this._ingEl = document.querySelector('.ingridient');

    // this._ingTextEl != null ? (this._ingEl.innerText = this._ingTextEl) : '';
    handler();
  }

  _generateMarkup() {
    // const nutriCur = this._data.recipe.nutrientCur
    //   ? this._data.recipe.nutrientCur
    //   : this._data.recipe.nutrientsSum;

    // console.log(this._data.recipe.nutrientCur);
    // console.log(this._data.recipe.nutrientsSum);

    return `
    <figure class="recipe__fig">
      <img src="${this._data.recipe.image}" alt="${
      this._data.recipe.title
    }" class="recipe__img" />
      <h1 class="recipe__title">
        <span>${this._data.recipe.title}</span>
      </h1>
    </figure>

    <div class="recipe__details">
      <div class="recipe__info">
        <svg class="recipe__info-icon">
         <use href="${icons}#icon-clock"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--minutes">${
          this._data.recipe.cookingTime
        }</span>
        <span class="recipe__info-text">minutes</span>
      </div>
      <div class="recipe__info">
        <svg class="recipe__info-icon">
          <use href="${icons}#icon-users"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--people">${
          this._data.recipe.servings
        }</span>
        <span class="recipe__info-text">servings</span>

        <div class="recipe__info-buttons">
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.recipe.servings - 1
          }">
            <svg>
              <use href="${icons}#icon-minus-circle"></use>
            </svg>
          </button>
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.recipe.servings + 1
          }">
            <svg>
              <use href="${icons}#icon-plus-circle"></use>
            </svg>
          </button>
        </div>
      </div>

      <div class="recipe__user-generated ${
        this._data.recipe.key ? '' : 'hidden'
      }">
          <svg>
           <use href="${icons}#icon-user"></use>
          </svg>
      </div>
      <button class="btn--round btn--bookmark">
      <svg class="">
        <use href="${icons}#icon-bookmark${
      this._data.recipe.bookmarked ? '-fill' : ''
    }"></use>
      </svg>
    </button>
      <button class="btn--round btn--bookmark">
        <svg class="">
          <use href="${icons}#icon-bookmark${
      this._data.recipe.bookmarked ? '-fill' : ''
    }"></use>
        </svg>
      </button>
    </div>

    <div class="recipe__ingredients">
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list">
      ${this._data.recipe.ingredients
        .map(this._generateMarkupIngredient)
        .join('')}
     </div>   
        
     <div class="recipe__nutrition">
  <div class="totalNutrData">
     <h5>${'Nutrients summary'}</h5>
     <ul class="ingredient__nutr-list">
      ${this._data.recipe.nutrientsSum.map(this._generateMarkupNutr).join('')}
   </div>
   <div class="ingridient" style="display: none;">
     <h5>${this._data.recipe.nutrientCur.description}</h5>
     <ul class="ingredient__nutr-list">
     ${this._data.recipe.nutrientCur.map(this._generateMarkupNutr).join('')}
   </div>
     </div> 

        <div class="recipe__directions">
        <h2 class="heading--2">How to cook it</h2>
        <p class="recipe__directions-text">
          This recipe was carefully designed and tested by
          <span class="recipe__publisher">${
            this._data.recipe.publisher
          }</span>. Please check out
          directions at their website.
        </p>
        <a
          class="btn--small recipe__btn"
          href="${this._data.recipe.sourceUrl}"
          target="_blank"
        >
          <span>Directions</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </a>
      </div>`;
  }

  _generateMarkupNutr(ing) {
    return `<li class="recipe__nutrient ">
    <div class="nutrients__sum">${ing.name}</div>
        <div class="nutrients__sum">${ing.amount}</div>
        <div class="nutrients__info">
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.percentOfDailyNeeds.toFixed(2)}%
        </div>
      </li>
      `;
  }

  _generateMarkupIngredient(ing, i) {
    return `<li class="recipe__ingredient ${i}">
        <svg class="recipe__icon">
          <use href="${icons}#icon-check"></use>
        </svg>
        <div class="recipe__quantity">${
          ing.quantity ? new Fraction(ing.quantity.toString()) : '' //new Fraction
        }</div>
        <div class="recipe__description">
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.description}
        </div>
      </li>
      `;
  }

  // _generateMarkupNutrisionFacts() {
  //   return nutrisionFactsView.render(model.recipe);
  // }
}

export default new RecipeView();
