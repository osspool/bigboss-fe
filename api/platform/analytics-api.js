// @/api/platform/analytics-api.js
import { handleApiRequest } from "../api-handler";

/**
 * Analytics API - Dashboard overview
 * GET /api/v1/analytics/dashboard?period=30d
 */
class AnalyticsApi {
  /**
   * Fetch dashboard analytics data
   * @param {Object} options - Request options
   * @param {string} options.token - Auth token
   * @param {string} [options.period='30d'] - Period: '7d' or '30d'
   * @returns {Promise<Object>} Analytics data
   */
  async getDashboard({ token, period = '30d' } = {}) {
    const params = new URLSearchParams({ period });
    return handleApiRequest('GET', `/api/v1/analytics/dashboard?${params}`, {
      token,
      cache: 'no-store', // Always fetch fresh analytics data
    });
  }
}

// Create and export a singleton instance of the AnalyticsApi
export const analyticsApi = new AnalyticsApi();
