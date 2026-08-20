import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Products List State
  products: [],
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  isProductsLoading: false,
  productsError: null,

  // Product Details & Related Products State
  selectedProduct: null,
  relatedProducts: [],
  isDetailsLoading: false,
  detailsError: null,
};

const getProductSlice = createSlice({
  name: "getProducts",
  initialState,
  reducers: {
    // Products List Reducers
    setProductsStart: (state) => {
      state.isProductsLoading = true;
      state.productsError = null;
    },
    setProductsSuccess: (state, action) => {
      state.isProductsLoading = false;
      state.products = action.payload.data;
      state.totalProducts = action.payload.totalProducts;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    },
    setProductsFailure: (state, action) => {
      state.isProductsLoading = false;
      state.productsError = action.payload;
    },

    // Product Details Reducers
    setDetailsStart: (state) => {
      state.isDetailsLoading = true;
      state.detailsError = null;
    },
    setDetailsSuccess: (state, action) => {
      state.isDetailsLoading = false;
      state.selectedProduct = action.payload.product;
      state.relatedProducts = action.payload.relatedProducts;
    },
    setDetailsFailure: (state, action) => {
      state.isDetailsLoading = false;
      state.detailsError = action.payload;
    },

    // Reset Reducers
    clearDetails: (state) => {
      state.selectedProduct = null;
      state.relatedProducts = [];
      state.isDetailsLoading = false;
      state.detailsError = null;
    },
    clearErrors: (state) => {
      state.productsError = null;
      state.detailsError = null;
    },
  },
});

export const {
  setProductsStart,
  setProductsSuccess,
  setProductsFailure,
  setDetailsStart,
  setDetailsSuccess,
  setDetailsFailure,
  clearDetails,
  clearErrors,
} = getProductSlice.actions;

export default getProductSlice.reducer;