import View from './View.js';

//import icons from 'url:../../img/icons.svg';
//import { Fraction } from 'fractional';

class NutritionFactsView extends View {
  _parentElement = '';

  _errorMessage = 'We could not find that recipe. Please try another one!!';
  _message = '';

  ingTextEl = '';

  // selectIngHandler(
  //   handler,
  //   elToListen = '.recipe__description',
  //   elOfInterest = '.recipe__ingredient',
  //   textToExtract = 'div.recipe__quantity'
  // ) {
  //   console.log('yeeeeee');

  //   this._parentElement.addEventListener('mouseover', function (e) {
  //     e.target.closest(elToListen) != null
  //       ? (this.ingTextEl = e.target
  //           .closest(elOfInterest)
  //           .querySelector(elToListen).innerText)
  //       : '';
  //     //console.log(this.ingTextEl);
  //     const ingEl = document.querySelector('.ingridient');
  //     typeof this.ingTextEl != 'undefined'
  //       ? (ingEl.innerText = this.ingTextEl)
  //       : '';
  //     handler(this.ingTextEl);
  //   });
  // }

  _generateMarkup() {
    const lala = ` <div class="ingridient">abc</div>`;
    return lala;
  }

  //     return '
  //      <div class="recipe__nutrition">
  //             <h2 class="heading--2">Nutrition facts</h2>
  //             <div class="ingridient"></div>
  //         </div>`;
}

export default new NutritionFactsView();
