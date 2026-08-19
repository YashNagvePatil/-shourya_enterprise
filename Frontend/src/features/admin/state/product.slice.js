import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createProduct as createProductApi } from "../service/admin.api"; // Adjust path as needed

// 1. Async Thunk for Product Creation
export const createProductThunk = createAsyncThunk(
  "product/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      // API Call sending FormData (multipart/form-data)
      const response = await createProductApi(formData);
      return response; // Expected: { success, message, meta, data }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create product";
      return rejectWithValue(errorMessage);
    }
  }
);

// 2. Initial State
const initialState = {
  products: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  message: "",
};

// 3. Slice Definition
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Reset state after success or displaying notification
    resetProductState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending State
      .addCase(createProductThunk.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.error = null;
        state.message = "";
      })
      // Fulfilled State
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload?.message || "Product created successfully!";
        
        // Add new product to state array if returned
        if (action.payload?.data) {
          state.products.unshift(action.payload.data);
        }
      })
      // Rejected State
      .addCase(createProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;