import http from '../shared/http-common';
import router from "../router/index.js";

// Interceptor to attach the token to each request
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors (automatic logout)
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            logout(); // Call the logout function on 401 error
        }
        return Promise.reject(error);
    }
);

// Logout function to clear data and redirect
async function logout() {
    console.log("Cerrando sesión...");
    const token = localStorage.getItem("token");
    if (token) {
        try {
            await http.post("/api/user/sign-out", {}, { // Use the correct backend URL
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            console.log("Session closed successfully.");
            localStorage.clear(); // Clear all user data
            http.defaults.headers["Authorization"] = null; // Clear authorization in Axios
            router.push({ name: "login" });
        } catch (error) {
            console.error("Error during logout:", error);
        }
    } else {
        console.log("No token found in localStorage");
    }
}

// Function to cancel active requests (optional)
function cancelRequests() {
    const cancelTokenSource = axios.CancelToken.source();
    http.defaults.cancelToken = cancelTokenSource.token;
    cancelTokenSource.cancel("Cancelando todas las solicitudes activas.");
}

export { http as api, logout, cancelRequests };