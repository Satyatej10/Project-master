const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  localStorage.setItem('items', JSON.stringify(state.items.items));
  localStorage.setItem('otherCosts', JSON.stringify(state.otherCosts.otherCosts));
  localStorage.setItem('filters', JSON.stringify(state.filters));
  return result;
};

export default localStorageMiddleware;