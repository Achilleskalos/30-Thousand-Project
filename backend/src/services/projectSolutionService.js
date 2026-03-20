const pool = require('../config/db');

const getSolutionsForProject = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT ps.*, s.title, s.status AS solution_status, s.category, s.tags,
            ep.full_name AS expert_name, u.email AS expert_email
     FROM project_solutions ps
     JOIN solutions s ON s.id = ps.solution_id
     JOIN expert_profiles ep ON ep.id = s.expert_id
     JOIN users u ON u.id = ep.user_id
     WHERE ps.project_id = $1 ORDER BY ps.created_at DESC`,
    [projectId]
  );
  return rows;
};

const linkSolution = async (projectId, solutionId, userId, note) => {
  const { rows } = await pool.query(
    `INSERT INTO project_solutions (project_id, solution_id, linked_by, note)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (project_id, solution_id) DO UPDATE SET note = $4
     RETURNING *`,
    [projectId, solutionId, userId, note || null]
  );
  return rows[0];
};

const unlinkSolution = async (projectId, solutionId) => {
  await pool.query(
    'DELETE FROM project_solutions WHERE project_id = $1 AND solution_id = $2',
    [projectId, solutionId]
  );
};

const getProjectsForSolution = async (solutionId) => {
  const { rows } = await pool.query(
    `SELECT ps.*, p.title AS project_title, p.status AS project_status
     FROM project_solutions ps
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.solution_id = $1 ORDER BY ps.created_at DESC`,
    [solutionId]
  );
  return rows;
};

module.exports = { getSolutionsForProject, linkSolution, unlinkSolution, getProjectsForSolution };
