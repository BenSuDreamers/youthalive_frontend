import axios from 'axios';

const API_BASE_URL = 'https://youthalive-backend-873403ae276a.herokuapp.com/api';

// Add to the export interface
export interface ExportService {
  exportTickets: (eventId: string) => Promise<void>;
}

// Add to the service object
export const exportService = {
  exportTickets: async (eventId: string): Promise<void> => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}/export/tickets/${eventId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-${eventId}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting tickets:', error);
      throw error;
    }
  }
};
