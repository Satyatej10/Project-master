import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const addOtherCost = createAsyncThunk('otherCosts/addOtherCost', async ({ userId, description, amount }, { rejectWithValue }) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'otherCosts'), { description, amount });
    return { id: docRef.id, description, amount };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateOtherCost = createAsyncThunk('otherCosts/updateOtherCost', async ({ userId, id, description, amount }, { rejectWithValue }) => {
  try {
    const costRef = doc(db, 'users', userId, 'otherCosts', id);
    await updateDoc(costRef, { description, amount });
    return { id, description, amount };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteOtherCost = createAsyncThunk('otherCosts/deleteOtherCost', async ({ userId, id }, { rejectWithValue }) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'otherCosts', id));
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchOtherCosts = createAsyncThunk('otherCosts/fetchOtherCosts', async (userId, { dispatch }) => {
  const costsRef = collection(db, 'users', userId, 'otherCosts');
  onSnapshot(costsRef, (snapshot) => {
    const otherCosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    dispatch(setOtherCosts(otherCosts));
  });
});

const otherCostsSlice = createSlice({
  name: 'otherCosts',
  initialState: { otherCosts: [], loading: false, error: null },
  reducers: {
    setOtherCosts(state, action) {
      state.otherCosts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOtherCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOtherCost.fulfilled, (state, action) => {
        state.otherCosts.push(action.payload);
        state.loading = false;
      })
      .addCase(addOtherCost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateOtherCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOtherCost.fulfilled, (state, action) => {
        const index = state.otherCosts.findIndex((cost) => cost.id === action.payload.id);
        state.otherCosts[index] = action.payload;
        state.loading = false;
      })
      .addCase(updateOtherCost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deleteOtherCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOtherCost.fulfilled, (state, action) => {
        state.otherCosts = state.otherCosts.filter((cost) => cost.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteOtherCost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchOtherCosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOtherCosts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchOtherCosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setOtherCosts } = otherCostsSlice.actions;
export default otherCostsSlice.reducer;