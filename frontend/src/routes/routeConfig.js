import { lazy } from "react";

/* --- PUBLIC PAGES --- */
const HomePage = lazy(() => import("../pages/public/HomePage"));
const LoginPage = lazy(() => import("../pages/public/LoginPage"));
const SignupPage = lazy(() => import("../pages/public/SignupPage"));
const VerifyEmailPage = lazy(() => import("../pages/public/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("../pages/public/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/public/ResetPasswordPage"));

/* --- USER / KYC PAGES --- */
const UserDashboard = lazy(() => import("../pages/user/UserDashboard")); // Page 2: Application List
const KYCApplicationForm = lazy(() => import("../pages/user/KYCApplicationForm")); // Page 1: Form
const VideoKYCSession = lazy(() => import("../pages/user/VideoKYCSession")); // Page 3: Live Video
const ProfilePage = lazy(() => import("../pages/user/ProfilePage"));

/* --- ADMIN PAGES --- */
const DashboardPage = lazy(() => import("../pages/admin/dashboard"));
const UsersAdminPage = lazy(() => import("../pages/admin/users/index"));
const AuditLogs = lazy(() => import("../pages/admin/audit-logs/index"));
const KYCQueue = lazy(() => import("../pages/admin/KYCQueue"));
const AdminKYCReview = lazy(() => import("../pages/admin/dashboard/AdminKYCReview"));


/* --- ERRORS --- */
const NotFound404 = lazy(() => import("../pages/errors/NotFound404"));
const Unauthorized = lazy(() => import("../pages/errors/Unauthorized"));

const routes = [
  /* --- PUBLIC ROUTES --- */
  { path: "/", component: HomePage, layout: "main" },
  { path: "/login", component: LoginPage, layout: "public", guestOnly: true },
  { path: "/register", component: SignupPage, layout: "public", guestOnly: true },
  { path: "/verify-email", component: VerifyEmailPage, layout: "public" },
  { path: "/forgot-password", component: ForgotPasswordPage, layout: "public" },
  { path: "/reset-password", component: ResetPasswordPage, layout: "public" },

  /* --- PROTECTED USER ROUTES (KYC FLOW) --- */
  // Page 2: Applications List (Dashboard)
  { path: "/dashboard", component: UserDashboard, layout: "main", protected: true },

  // Page 1: KYC Application Form
  { path: "/kyc-application", component: KYCApplicationForm, layout: "main", protected: true },

  // Page 3: Live Video KYC Session
  { path: "/live-session/:id", component: VideoKYCSession, layout: "main", protected: true },

  { path: "/profile", component: ProfilePage, layout: "main", protected: true },

  /* --- ADMIN ROUTES --- */
  {
    path: "/admin",
    component: DashboardPage,
    layout: "admin",
    protected: true,
    permission: "VIEW_ADMIN_DASHBOARD"
  },
  {
    path: "/admin/kyc-review/:id",
    component: AdminKYCReview,
    layout: "admin",
    protected: true,
    permission: "VIEW_ADMIN_KYC_REVIEW"
  },
  {
    path: "/admin/users",
    component: UsersAdminPage,
    layout: "admin",
    protected: true,
    permission: "VIEW_ADMIN_USERS"
  },
  {
    path: "/admin/kyc-queue",
    component: KYCQueue,
    layout: "admin",
    protected: true,
    permission: "VIEW_ADMIN_KYC_QUEUE"
  },
  {
    path: "/admin/logs",
    component: AuditLogs,
    layout: "admin",
    protected: true,
    permission: "VIEW_ADMIN_LOGS"
  },

  /* --- ERROR ROUTES --- */
  { path: "/unauthorized", component: Unauthorized },
  { path: "*", component: NotFound404 },
];

export default routes;
