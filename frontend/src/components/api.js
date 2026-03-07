import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4000/api"
});
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default API;