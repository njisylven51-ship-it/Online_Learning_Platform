import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/feedback/LoadingState';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { RoleGuard } from './guards/RoleGuard';

const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const StudentLayout = lazy(() => import('../layouts/StudentLayout'));
const TeacherLayout = lazy(() => import('../layouts/TeacherLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

const CourseCatalog = lazy(() => import('../features/courses/pages/CourseCatalog'));
const CourseDetails = lazy(() => import('../features/courses/pages/CourseDetails'));
const CertificateVerify = lazy(
  () => import('../features/certificates/pages/CertificateVerify'),
);
const HomePage = lazy(() => import('../features/courses/pages/HomePage'));

const Login = lazy(() => import('../features/auth/pages/Login'));
const Register = lazy(() => import('../features/auth/pages/Register'));
const TeacherRegister = lazy(() => import('../features/auth/pages/TeacherRegister'));
const ForgotPassword = lazy(() => import('../features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../features/auth/pages/ResetPassword'));
const ChangePassword = lazy(() => import('../features/auth/pages/ChangePassword'));

const StudentDashboard = lazy(
  () => import('../features/student/pages/StudentDashboard'),
);
const StudentMyLearning = lazy(
  () => import('../features/student/pages/StudentMyLearning'),
);
const StudentProgress = lazy(
  () => import('../features/student/pages/StudentProgress'),
);
const StudentProfile = lazy(
  () => import('../features/student/pages/StudentProfile'),
);
const Classroom = lazy(() => import('../features/classroom/pages/Classroom'));
const PaymentCheckout = lazy(
  () => import('../features/payments/pages/PaymentCheckout'),
);
const PaymentHistoryPage = lazy(
  () => import('../features/payments/pages/PaymentHistory'),
);
const CertificatesPage = lazy(
  () => import('../features/certificates/pages/CertificatesPage'),
);

const TeacherHome = lazy(
  () => import('../features/dashboard/teacher/pages/TeacherHome'),
);
const MyCourses = lazy(() => import('../features/teacher/pages/MyCourses'));
const CreateCourse = lazy(() => import('../features/teacher/pages/CreateCourse'));
const TeacherAssignments = lazy(
  () => import('../features/teacher/pages/TeacherAssignments'),
);
const TeacherProfile = lazy(
  () => import('../features/teacher/pages/TeacherProfile'),
);

const AdminHome = lazy(
  () => import('../features/dashboard/admin/pages/AdminHome'),
);
const AdminUsers = lazy(() => import('../features/admin/pages/AdminUsers'));
const AdminInstructors = lazy(
  () => import('../features/admin/pages/AdminInstructors'),
);
const AdminCourses = lazy(() => import('../features/admin/pages/AdminCourses'));
const AdminCategories = lazy(
  () => import('../features/admin/pages/AdminCategories'),
);
const AdminMore = lazy(() => import('../features/admin/pages/AdminMore'));
const AdminProfile = lazy(() => import('../features/admin/pages/AdminProfile'));

function Fallback() {
  return <LoadingState message="Loading…" />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="certificates/verify/:code" element={<CertificateVerify />} />
        </Route>

        {/* Guest only */}
        <Route element={<GuestGuard />}>
          <Route element={<PublicLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register/teacher" element={<TeacherRegister />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Any authenticated user */}
        <Route element={<AuthGuard />}>
          <Route element={<PublicLayout />}>
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allow={['student']} />}>
            <Route path="student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              {/* ADDED: In-built course browsing for students */}
              <Route path="courses" element={<CourseCatalog />} />
              <Route path="courses/:courseId" element={<CourseDetails />} />
              {/* ------------------------------------------- */}
              <Route path="my-learning" element={<StudentMyLearning />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="classroom/:courseId" element={<Classroom />} />
              <Route path="payments/checkout/:courseId" element={<PaymentCheckout />} />
              <Route path="payments" element={<PaymentHistoryPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Teacher */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allow={['teacher', 'administrator']} />}>
            <Route path="teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherHome />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="profile" element={<TeacherProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allow={['administrator']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="more" element={<AdminMore />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}