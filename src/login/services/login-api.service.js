import http from '../../shared/http-common';

class LoginApiService {
    static async signIn(dni, password) {
        const response = await http.post('/api/user/sign-in', { dni, password });
        const token = response.data.token;
        localStorage.setItem('token', token); // Store the token
        return response;
    }
}

export default LoginApiService;