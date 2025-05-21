import { createSlice } from '@reduxjs/toolkit';

const filterSlice = createSlice({
  name: 'filters',
  initialState: { costThreshold: 0 },
  reducers: {
    setCostThreshold: (state, action) => {
      state.costThreshold = action.payload;
    },
    resetCostThreshold: (state) => {
      state.costThreshold = 0;
    },
  },
});

export const { setCostThreshold, resetCostThreshold } = filterSlice.actions;
export default filterSlice.reducer;