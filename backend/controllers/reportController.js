// Report Controller
// Handles dashboard reports and metrics
// Returns dummy/mock data for testing without requiring MongoDB connection

/**
 * Get dashboard metrics
 * GET /api/reports/metrics
 * Returns hardcoded dummy data for dashboard cards
 * Protected route - requires authentication
 */
export const getMetrics = async (req, res) => {
  try {
    // Return hardcoded dummy data for dashboard metrics
    // This simulates a successful database aggregation query
    const metrics = {
      open: 25,
      inProgress: 12,
      closed: 45,
      urgent: 8,
    };

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching metrics',
      error: error.message,
    });
  }
};

/**
 * Get monthly trends
 * GET /api/reports/trends
 * Returns hardcoded dummy data for monthly complaint trends
 * Protected route - requires authentication
 */
export const getTrends = async (req, res) => {
  try {
    // Return hardcoded dummy data for monthly trends
    // This simulates a successful database aggregation query
    const trends = [
      { month: 1, year: 2024, count: 15 },
      { month: 2, year: 2024, count: 23 },
      { month: 3, year: 2024, count: 18 },
      { month: 4, year: 2024, count: 31 },
      { month: 5, year: 2024, count: 27 },
      { month: 6, year: 2024, count: 35 },
      { month: 7, year: 2024, count: 42 },
      { month: 8, year: 2024, count: 38 },
      { month: 9, year: 2024, count: 29 },
      { month: 10, year: 2024, count: 33 },
      { month: 11, year: 2024, count: 41 },
      { month: 12, year: 2024, count: 28 },
    ];

    res.status(200).json({
      success: true,
      data: {
        trends,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trends',
      error: error.message,
    });
  }
};



