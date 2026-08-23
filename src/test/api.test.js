import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMetrics } from '../services/api.js';

describe('api', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('fetchMetrics resolves with by_status', async () => {
    const mockData = {
      total_tickets: 10,
      by_status: [{ status: 'abierto', count: 5 }],
      by_category: [],
      by_priority: [],
      by_agent: [],
      archived_tickets: 2,
      resolved_count: 3,
      avg_resolution_seconds: 3600,
      median_resolution_seconds: 3000,
      min_resolution_seconds: 100,
      max_resolution_seconds: 5000,
      overall_compliance_rate: 0.8,
      per_priority: [],
      per_category: [],
      daily: [],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchMetrics();
    expect(result.by_status).toEqual([{ status: 'abierto', count: 5 }]);
    expect(result.total_tickets).toBe(10);
  });
});
