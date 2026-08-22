import axios from "axios";

const paymentApi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


export const createPayment = async (orderId) =>{
    const response = await  paymentApi.post("/payment",{orderId})
    return response.data
}