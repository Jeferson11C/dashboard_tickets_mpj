import http from '../../shared/http-common';

class LoginApiService {
    static async fetchUsers() {
        return http.get('/api/user');
    }
}

export default LoginApiService;