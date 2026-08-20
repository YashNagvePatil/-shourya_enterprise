import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/home", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export const getProductData = async (queryParams = {}) => {
  const response = await api.get("/", {
    params: {
      ...queryParams,
      _t: Date.now(), // Params key ke andar rakhne se URL banta hai
    },
  });
  return response.data;
};

export const getProductDetails = async (id, queryParams = {}) => {
  const response = await api.get(`/${id}`, {
    params: {
      ...queryParams,
      _t: Date.now(),
    },
  });
  return response.data;
};