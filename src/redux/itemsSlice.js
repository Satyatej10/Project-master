import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Thunk to add an item to Firebase (no Redux state update)
export const addItem = createAsyncThunk('items/addItem', async ({ userId, name, cost }, { rejectWithValue }) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'items'), {
      name,
      cost,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, name, cost, createdAt: new Date().toISOString() }; // Return for toast notification
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Thunk to fetch items using onSnapshot (not createAsyncThunk)
export const fetchItems = (userId) => (dispatch) => {
  const itemsRef = collection(db, 'users', userId, 'items');
  const unsubscribe = onSnapshot(
    itemsRef,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch(setItems(items));
    },
    (error) => {
      console.error('Error fetching items:', error);
      dispatch(setItems([])); // Clear items on error
    }
  );
  return unsubscribe; // Return for cleanup
};

// Thunks for update and delete (unchanged)
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

const itemsSlice = createSlice({
  name: 'items',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state) => {
        state.loading = false; // No state.items update
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
      });
  },
});

export const { setItems } = itemsSlice.actions;
export default itemsSlice.reducer;