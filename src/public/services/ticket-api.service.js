import http from '../../shared/http-common';

class TicketApiService {
    // Obtener todos los tickets
    getAll() {
        return http.get('/tickets');
    }

    // Obtener un ticket por ID
    getById(id) {
        return http.get(`/tickets/${id}`);
    }

    // Obtener un ticket por número de ticket
    getByNumeroTicket(numeroTicket) {
        return http.get(`/tickets`, { params: { numeroTicket } });
    }

    // Crear un nuevo ticket
    create(data) {
        return http.post('/tickets', data);
    }

    // Actualizar un ticket por ID
    update(id, data) {
        return http.put(`/tickets/${id}`, data);
    }
}

export default new TicketApiService();