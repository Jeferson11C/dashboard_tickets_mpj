// src/shared/interceptor.js
import http from '../shared/http-common';
import router from "../router/index.js";

// Function to check and refresh the token
async function checkAndRefreshToken() {
    try {
        const response = await fetch('http://localhost:3000/api/proxy/refresh-token', {
            method: 'POST',
            credentials: 'include', // Incluye cookies en la solicitud
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error ${response.status}: No se pudo refrescar el token`);
            return null;
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Error al parsear JSON:', jsonError);
            return null;
        }

        if (!data?.token) {
            console.error('El servidor no devolvió un token válido');
            return null;
        }

        // Guardar el nuevo token en localStorage
        localStorage.setItem('token', data.token);
        return data.token;

    } catch (error) {
        console.error('Error en checkAndRefreshToken:', error);
        return null;
    }
}

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

// Response interceptor to handle 401 errors (automatic token refresh)
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const newToken = await checkAndRefreshToken();
            if (newToken) {
                error.config.headers["Authorization"] = `Bearer ${newToken}`;
                return http(error.config);
            }
        }
        return Promise.reject(error);
    }
);

// Function to delete a cookie
function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/';
}

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
            deleteCookie('refreshToken'); // Delete the refreshToken cookie
            router.push({ name: "login" });
        } catch (error) {
            console.error("Error during logout:", error);
        }
    } else {
        console.log("No token found in localStorage");
    }
}

http.interceptors.response.use(
    response => response,
    error => {
        console.error('API call error:', error);
        return Promise.reject(error);
    }
);

// Function to cancel active requests (optional)
function cancelRequests() {
    const cancelTokenSource = axios.CancelToken.source();
    http.defaults.cancelToken = cancelTokenSource.token;
    cancelTokenSource.cancel("Cancelando todas las solicitudes activas.");
}

export { http as api, logout, cancelRequests };
