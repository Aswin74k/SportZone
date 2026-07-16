import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

//  REQUEST INTERCEPTOR
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//  RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.error;
    console.log(status, m);
    

    const originalRequest = error.config;
    if (status === 403 && message === "Your account has been suspended.") {
      localStorage.clear();

      toast.error(message);

      window.dispatchEvent(new Event("logout"));

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        localStorage.clear();
        window.dispatchEvent(new Event("logout"));
        toast.error("Session expired, please login");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);
        localStorage.setItem("token", newAccess); // backward compatibility

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return API(originalRequest);

      } catch (err) {
        localStorage.clear();
        window.dispatchEvent(new Event("logout"));
        toast.error("Session expired, please login");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    if (status === 400) {
      toast.error("Invalid request");
    } else if (!error.response) {
      toast.error("Server not reachable");
    }

    return Promise.reject(error);
  }
);

export default API;