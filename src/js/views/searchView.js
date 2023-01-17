import View from './View';

class SearchView extends View {
  _parentElement = document.querySelector('.search');

  _clear() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  getQuery() {
    //return this._parentElement.querySelector('.search__field').value;
    const query = this._parentElement.querySelector('.search__field').value;
    this._clear();
    return query;
  }

  // _clearInput() {
  //   this._parentEl.querySelector('.search__field').value = '';
  // }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      return handler();
    });
    //this._clear();
  }
}

export default new SearchView();
