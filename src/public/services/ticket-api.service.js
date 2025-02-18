import http from '../../shared/http-common';

class TicketApiService {
    async getAreas() {
        return http.get('/api/area');
    }

    async createArea(area) {
        return http.post('/api/area', area);
    }

    async deleteArea(id) {
        return http.delete(`/api/area/${id}`);
    }




    ///////TICKETS////

    // Actualizar el estado de un ticket por ID
    updateStatus(id, status) {
        return http.put(`/api/ticket/${id}/status`, { estado: status });
    }

    async updateArea(id, newArea) {
        return http.put(`/api/ticket/${id}/area`, { newArea });
    }
    getAll() {
        return http.get('/api/ticket');
    }

    getById(id) {
        return http.get(`/api/ticket/${id}`);
    }
    // Obtener tickets por área
    getByArea(areaNombre) {
        return http.get(`/api/ticket/area/${areaNombre}`);
    }

}

export default new TicketApiService();