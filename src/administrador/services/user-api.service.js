import http from '../../shared/http-common';

class UserApiService {
    // Obtener todos los usuarios
    async fetchUsers() {
        return http.get('/api/user');
    }

    // Obtener un usuario por ID
    async fetchUserById(id) {
        return http.get(`/api/user/${id}`);
    }

    // Crear un nuevo usuario
    async createUser(user) {
        return http.post('/api/user', user);
    }

    // Actualizar un usuario por ID
    async updateUser(user) {
        return http.put(`/api/user/${user.id}`, user);
    }

    // Eliminar un usuario por ID
    async deleteUser(id) {
        return http.delete(`/api/user/${id}`);
    }

    // Obtener usuarios por área
    async fetchUsersByArea(area) {
        return http.get(`/api/user/area/${area}`);
    }

    // Obtener usuarios por rol
    async fetchUsersByRole(role) {
        return http.get(`/api/user/role/${role}`);
    }

    async getAreas() {
        return http.get('/api/area');
    }
}

export default new UserApiService();