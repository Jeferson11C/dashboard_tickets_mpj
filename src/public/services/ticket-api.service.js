import http from '../../shared/http-common';

class TicketApiService {
    // Obtener todos los tickets
    async getAreas() {
        return http.get('/api/area');
    }

    async createArea(area) {
        return http.post('/api/area', area);
    }

    getAll() {
        return http.get('/api/ticket');
    }

    // Obtener un ticket por ID
    getById(id) {
        return http.get(`/api/ticket/${id}`);
    }

    // Obtener tickets por área
    getByArea(areaNombre) {
        return http.get(`/api/ticket/area/${areaNombre}`);
    }

    // Crear un nuevo ticket
    create(data) {
        return http.post('/api/ticket', data);
    }

    // Actualizar el estado de un ticket por ID
    updateStatus(id, status) {
        return http.put(`/api/ticket/${id}/status`, { estado: status });
    }
}

export default new TicketApiService();