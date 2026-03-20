const statsService = require('../services/statsService');

const getOverview = async (req, res, next) => {
  try {
    const data = await statsService.getOverview();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCharts = async (req, res, next) => {
  try {
    const [expertsByStatus, expertsByDomain, solutionsByStatus, solutionsByCategory, projectsByStatus, monthlyRegistrations] = await Promise.all([
      statsService.getExpertsByStatus(),
      statsService.getExpertsByDomain(),
      statsService.getSolutionsByStatus(),
      statsService.getSolutionsByCategory(),
      statsService.getProjectsByStatus(),
      statsService.getMonthlyRegistrations(),
    ]);
    res.json({ success: true, data: { expertsByStatus, expertsByDomain, solutionsByStatus, solutionsByCategory, projectsByStatus, monthlyRegistrations } });
  } catch (err) { next(err); }
};

module.exports = { getOverview, getCharts };
