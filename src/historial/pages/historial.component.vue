<script>
import TicketApiService from '../../public/services/ticket-api.service';
import CommentApiService from '../../public/services/comment-api.service';

export default {
  name: "historial",
  data() {
    return {
      ticketsByArea: {},
      error: null,
      userRole: localStorage.getItem('userRole') || '',
      userArea: localStorage.getItem('userArea') || ''
    };
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) {
        return '---';
      }
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', options);
    }
  },
  async created() {
    try {
      const response = await TicketApiService.getAll();
      const tickets = response.data;

      for (const ticket of tickets) {
        try {
          const commentsResponse = await CommentApiService.getCommentsByTicketId(ticket.id);
          ticket.comments = commentsResponse.data.length > 0 ? commentsResponse.data : [{
            coment: "aun no ha sido atendido",
          }];
          ticket.atendidoPor = commentsResponse.data.length > 0 ? commentsResponse.data[0].username : "";
          console.log(`Comments for ticket ${ticket.id}:`, ticket.comments);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            ticket.comments = [{coment: "aun no ha sido atendido"}];
          } else {
            console.error(`Error loading comments for ticket ${ticket.id}:`, error);
            ticket.comments = [{coment: "aun no ha sido atendido"}];
          }
        }
      }

      const filteredTickets = this.userRole === 'Administrador'
          ? tickets.filter(ticket => ticket.areaNombre.toLowerCase() !== 'general')
          : tickets.filter(ticket => ticket.areaNombre === this.userArea && ticket.areaNombre.toLowerCase() !== 'general');

      this.ticketsByArea = filteredTickets.reduce((acc, ticket) => {
        if (!acc[ticket.areaNombre]) {
          acc[ticket.areaNombre] = [];
        }
        acc[ticket.areaNombre].push(ticket);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error loading tickets:', error);
      this.error = 'Failed to load tickets. Please try again later.';
    }
  }
}
</script>

<template>
  <div>
    <h1>Historial de Tickets</h1>
    <div v-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="(tickets, area) in ticketsByArea" :key="area">
        <h2>{{ area }}</h2>
        <pv-data-table>
          <thead>
          <tr>
            <th>Número de Ticket</th>
            <th>Creado por</th>
            <th>Fecha de creacion</th>
            <th>Fecha de atencion</th>
            <th>Estado</th>
            <th>Comentarios</th>
            <th>Atendido por</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.numeroTicket }}</td>
            <td>{{ ticket.nombres }}</td>
            <td>{{ formatDateTime(ticket.fecha) }}</td>
            <td>{{ formatDateTime(ticket.updatedAt) }}</td>
            <td>{{ ticket.estado }}</td>
            <td>
              <ul>
                <li v-for="(comment, index) in ticket.comments" :key="index">
                  {{ comment.coment }}
                </li>
              </ul>
            </td>
            <td>{{ ticket.atendidoPor }}</td>
          </tr>
          </tbody>
        </pv-data-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>