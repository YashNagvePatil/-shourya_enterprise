import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setProductsStart,
  setProductsSuccess,
  setProductsFailure,
  setDetailsStart,
  setDetailsSuccess,
  setDetailsFailure,
  clearDetails as clearDetailsAction,
  clearErrors as clearErrorsAction,
} from "../state/getProduct.slice";
import { getProductData, getProductDetails } from "../service/getProduct.api";

export const useGetProduct = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const {
    products,
    totalProducts,
    totalPages,
    currentPage,
    isProductsLoading,
    productsError,
    selectedProduct,
    relatedProducts,
    isDetailsLoading,
    detailsError,
  } = useSelector((state) => state.getProducts);

  // Fetch Products List Logic
  const fetchProducts = useCallback(
    async (queryParams = {}) => {
      dispatch(setProductsStart());
      try {
        // Axios interceptor handles unwrapping: response is direct backend JSON payload
        const response = await getProductData(queryParams);
        
        if (response.success) {
          dispatch(setProductsSuccess(response));
        } else {
          dispatch(
            setProductsFailure(response.message || "Failed to fetch products")
          );
        }
      } catch (err) {
        // Clean error message directly from standardized interceptor
        dispatch(setProductsFailure(err.message || "Server Error"));
      }
    },
    [dispatch]
  );

  // Fetch Product Details Logic
  const fetchDetails = useCallback(
    async (id, queryParams = {}) => {
      dispatch(setDetailsStart());
      try {
        const response = await getProductDetails(id, queryParams);
        
        if (response.success) {
          dispatch(setDetailsSuccess(response.data || response));
        } else {
          dispatch(
            setDetailsFailure(
              response.message || "Failed to fetch product details"
            )
          );
        }
      } catch (err) {
        // Clean error message directly from standardized interceptor
        dispatch(setDetailsFailure(err.message || "Server Error"));
      }
    },
    [dispatch]
  );

  // Helper Actions
  const resetDetails = useCallback(() => {
    dispatch(clearDetailsAction());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearErrorsAction());
  }, [dispatch]);

  return {
    // Redux State
    products,
    totalProducts,
    totalPages,
    currentPage,
    isProductsLoading,
    productsError,
    selectedProduct,
    relatedProducts,
    isDetailsLoading,
    detailsError,

    // Actions
    fetchProducts,
    fetchDetails,
    resetDetails,
    clearErrors,
  };
};

/**
 * Helper function for safe image rendering
 */
export const getImageUrl = (
  img,
  fallback = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"
) => {
  if (!img) return fallback;
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.url || img.secure_url || fallback;
  return fallback;
};