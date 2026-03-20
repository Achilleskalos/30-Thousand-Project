const pool = require('../config/db');

const getOverview = async () => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'expert') AS total_experts,
      (SELECT COUNT(*) FROM expert_profiles WHERE status = 'approved') AS approved_experts,
      (SELECT COUNT(*) FROM expert_profiles WHERE status = 'pending') AS pending_experts,
      (SELECT COUNT(*) FROM solutions) AS total_solutions,
      (SELECT COUNT(*) FROM solutions WHERE status = 'submitted') AS pending_solutions,
      (SELECT COUNT(*) FROM projects) AS total_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'in_progress') AS active_projects
  `);
  return rows[0];
};

const getExpertsByStatus = async () => {
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM expert_profiles GROUP BY status ORDER BY count DESC
  `);
  return rows;
};

const getExpertsByDomain = async () => {
  const { rows } = await pool.query(`
    SELECT domain, COUNT(*) AS count FROM (
      SELECT unnest(domain_tags) AS domain FROM expert_profiles WHERE status = 'approved'
    ) t GROUP BY domain ORDER BY count DESC LIMIT 10
  `);
  return rows;
};

const getSolutionsByStatus = async () => {
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM solutions GROUP BY status ORDER BY count DESC
  `);
  return rows;
};

const getSolutionsByCategory = async () => {
  const { rows } = await pool.query(`
    SELECT COALESCE(category, '未分类') AS category, COUNT(*) AS count
    FROM solutions GROUP BY category ORDER BY count DESC LIMIT 10
  `);
  return rows;
};

const getProjectsByStatus = async () => {
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM projects GROUP BY status ORDER BY count DESC
  `);
  return rows;
};

const getMonthlyRegistrations = async () => {
  const { rows } = await pool.query(`
    SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM users WHERE role = 'expert'
      AND created_at >= NOW() - INTERVAL '6 months'
    GROUP BY month ORDER BY month ASC
  `);
  return rows;
};

module.exports = {
  getOverview,
  getExpertsByStatus,
  getExpertsByDomain,
  getSolutionsByStatus,
  getSolutionsByCategory,
  getProjectsByStatus,
  getMonthlyRegistrations,
};
