import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createProduct as createProductApi } from "../service/admin.api";

// 1. Async Thunk for Product Creation (JSON / Base64 Payload)
export const createProductThunk = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      // API Call sending pure JSON Payload (with Base64 Images)
      const response = await createProductApi(productData);
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
  name: "createProduct",
  initialState,
  reducers: {
    // Reset state after success or notification display
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
        
        // Add newly created product to the top of list
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