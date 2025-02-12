// src/utils/dateUtils.js
export function formatDateTime(dateString) {
    if (!dateString) {
        return '---';
    }
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', options);
}