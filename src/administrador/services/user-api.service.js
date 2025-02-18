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
    async updateUser(id, userData) {
        console.log('Updating user with ID:', id); // Verifica que el ID esté correcto
        return http.put(`/api/user/${id}`, userData);
    }

    // Eliminar un usuario por ID
    async deleteUser(id) {
        return http.delete(`/api/user/${id}`);
    }

    async updateUserStatus(id, estado) {
        return http.put(`/api/user/${id}/estado`, { estado });
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

    async getUserDataByDni(dni) {
        return http.post('/api/proxy/dni', { codigo: dni });
    }




}

export default new UserApiService();