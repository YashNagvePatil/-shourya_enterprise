import axios from "axios";

const Agentapi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/*
  =============================================================================
  1. GET REQUEST: FETCH CART
  -----------------------------------------------------------------------------
  WHEN TO USE `params`:
  - Use `params` for read-only metadata (filtering, sorting, search, pagination).
  - Use `params` for cache-busting (e.g., `_t: Date.now()`) to force a fresh 
    live response from the server instead of browser cache.
  
  WHEN NOT TO USE `params`:
  - Never send sensitive credentials or large data objects via `params`.
  =============================================================================
*/
export const getCart = async () => {
  const response = await Agentapi.get("/agent/getCart", {
    params: { 
      _t: Date.now() // Prevents browser from returning stale cached data
    },
  });
  return response.data;
};

/*
  =============================================================================
  2. POST REQUEST: ADD / UPDATE CART ITEM
  -----------------------------------------------------------------------------
  WHEN TO USE `body` (Direct Data Object):
  - Always send payload data (e.g., productId, quantity) in the HTTP Body.
  - Body keeps data secure, structured, and capable of handling complex objects.

  WHEN NOT TO USE `params`:
  - Do NOT put main payload data inside `params`. Passing data in `params` for 
    POST requests appends it to the URL query string instead of `req.body`.
  =============================================================================
*/
export const addCart = async (cartData) => {
  // cartData = { productId: "12345", quantity: 1 }
  const response = await Agentapi.post("/agent/addCart", cartData); 
  return response.data;
};

/*
  =============================================================================
  3. DELETE REQUEST: REMOVE ITEM FROM CART
  -----------------------------------------------------------------------------
  WHEN TO USE PATH PARAMETERS (`/cart/:id`):
  - Use dynamic URL path parameters when deleting a specific single resource 
    whose unique ID is known.

  WHEN TO USE `params` OR `data` IN DELETE:
  - Only use `params` in DELETE if you need to pass additional filters 
    (e.g., `/cart?clearAll=true`).
  - Only use `data` option in DELETE if you need to pass a bulk array of IDs.
  =============================================================================
*/
export const removeProductFromCart = async (productId) => {
  // Uses Path Parameter dynamically inserted into the URL string
  const response = await Agentapi.delete(`/agent/${productId}`);
  return response.data;
};