import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCart,
  setLoading,
  setError,
  clearCartState,
} from "../state/cart.slice";
import {
  getCart as apiGetCart,
  addCart as apiAddCart,
  removeProductFromCart as apiRemoveCart,
} from "../service/cart.api"; // Apne path ke hisab se adjust karein

export const useCart = () => {
  const dispatch = useDispatch();
  const { cart, isLoading, error } = useSelector((state) => state.cart);

  // 1. Fetch Cart Data
  const fetchCart = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiGetCart();
      if (data.success) {
        dispatch(setCart(data.cart));
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch cart items";
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  // 2. Add / Update Item in Cart
  const addToCart = async (productId, quantity = 1) => {
    dispatch(setLoading(true));
    try {
      const data = await apiAddCart({ productId, quantity });
      if (data.success) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add product to cart";
      dispatch(setError(errorMessage));
      throw err;
    }
  };

  // 3. Remove Item from Cart
  const removeFromCart = async (productId) => {
    dispatch(setLoading(true));
    try {
      const data = await apiRemoveCart(productId);
      if (data.success) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove product from cart";
      dispatch(setError(errorMessage));
      throw err;
    }
  };

  // 4. Reset Local Cart State
  const resetCart = () => {
    dispatch(clearCartState());
  };

  return {
    cart,
    isLoading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    resetCart,
  };
};