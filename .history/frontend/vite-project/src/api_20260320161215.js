import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// 🔥 REQUEST INTERCEPTOR (ADD TOKEN)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// 🔥 RESPONSE INTERCEPTOR (HANDLE ERRORS)
API.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔥 AUTO LOGOUT ON TOKEN EXPIRE
    if (error.response?.status === 401) {
      console.log("Session expired 🔐");

      localStorage.removeItem("token");

      // trigger logout event
      window.dispatchEvent(new Event("logout"));

      // redirect to home
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);


export default API;