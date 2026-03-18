import {
  MdDashboard, MdPeople, MdMonitor, MdModelTraining, 
  MdCreditCard, MdAnalytics, MdHistory, MdList,
} from 'react-icons/md';
import { ROLES } from './roles';

export const adminMenu = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: MdDashboard,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: 'User Management',
    icon: MdPeople,
    roles: [ROLES.ADMIN, ROLES.MANAGER], // Manager can also view
    children: [
      {
        label: 'All Users',
        path: '/admin/users',
        icon: MdList,
        roles: [ROLES.ADMIN, ROLES.MANAGER],
      },
    ],
  },
  {
    label: 'kyc Queue',
    path: '/admin/kyc-queue',
    icon: MdAnalytics, 
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: 'Security Logs',
    path: '/admin/logs',
    icon: MdHistory, 
    roles: [ROLES.ADMIN], // Only Admin
  },
];