import http from '../../shared/http-common';

class CommentApiService {
    // Create a new comment
    async createComment(comment) {
        return http.post('/api/comment', comment);
    }

    // Get all comments
    async getComments() {
        return http.get('/api/comment');
    }

    // Get a comment by ID
    async getCommentById(id) {
        return http.get(`/api/comment/${id}`);
    }

    // Get comments by ticket ID
    async getCommentsByTicketId(ticketId) {
        return http.get(`/api/comment/ticket/${ticketId}`);
    }
}

export default new CommentApiService();