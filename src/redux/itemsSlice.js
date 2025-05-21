import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const addItem = createAsyncThunk('items/addItem', async ({ userId, name, cost }, { rejectWithValue }) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'items'), { name, cost });
    return { id: docRef.id, name, cost };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateItem = createAsyncThunk('items/updateItem', async ({ userId, id, name, cost }, { rejectWithValue }) => {
  try {
    const itemRef = doc(db, 'users', userId, 'items', id);
    await updateDoc(itemRef, { name, cost });
    return { id, name, cost };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteItem = createAsyncThunk('items/deleteItem', async ({ userId, id }, { rejectWithValue }) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'items', id));
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchItems = createAsyncThunk('items/fetchItems', async (userId, { dispatch }) => {
  const itemsRef = collection(db, 'users', userId, 'items');
  onSnapshot(itemsRef, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    dispatch(setItems(items));
  });
});

const itemsSlice = createSlice({
  name: 'items',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        state.items[index] = action.payload;
        state.loading = false;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setItems } = itemsSlice.actions;
export default itemsSlice.reducer;