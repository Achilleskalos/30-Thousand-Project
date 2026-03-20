import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AppLayout from '../components/common/AppLayout';
import AuthGuard from '../components/common/AuthGuard';
import DashboardPage from '../pages/admin/DashboardPage';
import ExpertListPage from '../pages/admin/ExpertListPage';
import ExpertDetailPage from '../pages/admin/ExpertDetailPage';
import SolutionListPage from '../pages/admin/SolutionListPage';
import SolutionDetailPage from '../pages/admin/SolutionDetailPage';
import ProjectListPage from '../pages/admin/ProjectListPage';
import ProjectDetailPage from '../pages/admin/ProjectDetailPage';
import ProjectFormPage from '../pages/admin/ProjectFormPage';
import StatisticsPage from '../pages/admin/StatisticsPage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import OrganizationPage from '../pages/admin/OrganizationPage';
import DictionaryPage from '../pages/admin/DictionaryPage';
import SystemConfigPage from '../pages/admin/SystemConfigPage';
import ProfilePage from '../pages/expert/ProfilePage';
import MySolutionsPage from '../pages/expert/MySolutionsPage';
import SolutionFormPage from '../pages/expert/SolutionFormPage';
import SolutionViewPage from '../pages/expert/SolutionViewPage';
import MyProjectsPage from '../pages/expert/MyProjectsPage';
import ProjectViewPage from '../pages/expert/ProjectViewPage';
import MessagesPage from '../pages/shared/MessagesPage';
import ComingSoon from '../pages/ComingSoon';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/', element: <Navigate to="/login" replace /> },
  {
    path: '/admin',
    element: <AuthGuard roles={['admin']}><AppLayout /></AuthGuard>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'experts', element: <ExpertListPage /> },
      { path: 'experts/:id', element: <ExpertDetailPage /> },
      { path: 'solutions', element: <SolutionListPage /> },
      { path: 'solutions/:id', element: <SolutionDetailPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/new', element: <ProjectFormPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'audit-logs', element: <AuditLogPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'organizations', element: <OrganizationPage /> },
      { path: 'dictionaries', element: <DictionaryPage /> },
      { path: 'config', element: <SystemConfigPage /> },
    ],
  },
  {
    path: '/expert',
    element: <AuthGuard roles={['expert']}><AppLayout /></AuthGuard>,
    children: [
      { path: 'profile', element: <ProfilePage /> },
      { path: 'solutions', element: <MySolutionsPage /> },
      { path: 'solutions/new', element: <SolutionFormPage /> },
      { path: 'solutions/:id', element: <SolutionViewPage /> },
      { path: 'solutions/:id/edit', element: <SolutionFormPage /> },
      { path: 'projects', element: <MyProjectsPage /> },
      { path: 'projects/:id', element: <ProjectViewPage /> },
      { path: 'messages', element: <MessagesPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
