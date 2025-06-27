import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './redux/store';
import useScrollToTop from './hooks/useScrollToTop';
import MainPage from "./pages/main/MainPage";
import HospitalListPage from "./pages/hospital/HospitalListPage";
import HospitalDetailPage from "./pages/hospital/HospitalDetailPage";
import PharmaciesList from "./pages/hospital/PharmaciesList";
import Footer from './components/common/Footer';
import AdSense from './components/ui/AdSense';
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AdminRoute from "./components/AdminRoute";
import EmergencyGuidePage from './pages/guides/EmergencyGuidePage';
import NightCareGuidePage from './pages/guides/NightCareGuidePage';
import WeekendCareGuidePage from './pages/guides/WeekendCareGuidePage';
import EmergencyCarePage from './pages/guides/EmergencyCarePage';
import { useAuth } from './contexts/AuthContext';
import DashboardPage from './pages/admin/DashboardPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import RegisterPage from './pages/auth/RegisterPage';
import CommunityPage from './pages/community/CommunityPage';
import TermsAgreement from './components/auth/TermsAgreement';
import NavigationBar from './components/common/NavigationBar';
import CreateBoardPage from './pages/community/CreateBoardPage';
import BoardDetail from './pages/community/BoardDetail';
import NaverCallback from './components/auth/NaverCallback';
import KakaoCallback from './components/auth/KakaoCallback';
import GoogleCallback from './components/auth/GoogleCallback';
import ProfilePage from './pages/profile/ProfilePage';
import DoctorApprovalRequestPage from './pages/profile/DoctorApprovalRequestPage';
import EditBoardPage from './pages/community/EditBoardPage';
import CategoryTypeManagementPage from './pages/admin/CategoryTypeManagementPage';
import NursingHospitalList from './components/nursing/NursingHospitalList';
import NursingHospitalDetailPage from "./pages/nursing/NursingHospitalDetailPage";
import NursingHospitalReviewPage from "./pages/nursing/NursingHospitalReviewPage";
import AboutPage from './components/AboutPage';
import HealthCenterList from './components/health/HealthCenterList';
import AnnouncementBanner from './components/ui/AnnouncementBanner';
import AnnouncementManagementPage from './pages/admin/AnnouncementManagementPage';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import NewsPage from './components/news/NewsPage';
import MapPage from './components/map/MapPage';
import NewsManagement from './pages/admin/NewsManagement';
import NewsForm from './pages/admin/NewsForm';
import CategoryManagement from './pages/admin/CategoryManagement';
import ChannelApprovalPage from './pages/admin/ChannelApprovalPage';
import DoctorApprovalPage from './pages/admin/DoctorApprovalPage';
import NewsDetailList from './components/news/NewsDetailList';
import NewsEdit from './components/news/NewsEdit';
import BusStationViewer from './pages/BusStationViewer';
//import BigChatModal from './components/chat/BigChatModal';
//import Jarvis from './components/chat/jarvis';

const AppContent = () => {
  const { isLoggedIn, userRole, handleLogout } = useAuth();
  useScrollToTop();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementProvider>
        <AnnouncementBanner />
        <NavigationBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={
            <>
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<MainPage isLoggedIn={isLoggedIn} userRole={userRole} />} />
                  <Route path="/hospitals" element={<HospitalListPage />} />
                  <Route path="/hospital/details/:id" element={<HospitalDetailPage />} />
                  <Route path="/pharmacies" element={<PharmaciesList />} />
                  <Route path="/nursing-hospitals" element={<NursingHospitalList />} />
                  <Route path="/nursing-hospitals/:id" element={<NursingHospitalDetailPage />} />
                  <Route path="/nursing-hospitals/:id/reviews" element={<NursingHospitalReviewPage />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
                  <Route path="/admin/categories" element={<AdminRoute><CategoryManagementPage /></AdminRoute>} />
                  <Route path="/admin/category-types" element={<AdminRoute><CategoryTypeManagementPage /></AdminRoute>} />
                  <Route path="/admin/announcements" element={<AdminRoute><AnnouncementManagementPage /></AdminRoute>} />
                  <Route path="/admin/news" element={<AdminRoute><NewsManagement /></AdminRoute>} />
                  <Route path="/admin/news/create" element={<AdminRoute><NewsForm /></AdminRoute>} />
                  <Route path="/admin/news/edit/:id" element={<AdminRoute><NewsForm /></AdminRoute>} />
                  <Route path="/admin/news/categories" element={<CategoryManagement />} />
                  <Route path="/admin/channels/approval" element={<ChannelApprovalPage />} />
                  <Route path="/admin/doctor-approval" element={<AdminRoute><DoctorApprovalPage /></AdminRoute>} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/guides/emergency" element={<EmergencyGuidePage />} />
                  <Route path="/guides/night-care" element={<NightCareGuidePage />} />
                  <Route path="/guides/weekend-care" element={<WeekendCareGuidePage />} />
                  <Route path="/guides/emergency-care" element={<EmergencyCarePage />} />
                  <Route path="/terms" element={<TermsAgreement />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/category/:categoryId" element={<CommunityPage />} />
                  <Route path="/community/create" element={<CreateBoardPage />} />
                  <Route path="/community/create/:categoryId" element={<CreateBoardPage />} />
                  <Route path="/community/boards/:id" element={<BoardDetail />} />
                  <Route path="/community/boards/edit/:id" element={<EditBoardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/doctor-approval" element={<DoctorApprovalRequestPage />} />
                  <Route path="/auth/naver/callback" element={<NaverCallback />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/health-centers" element={<HealthCenterList />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:id" element={<NewsDetailList />} />
                  <Route path="/news/edit/:id" element={<NewsEdit />} />
                  <Route path="/bus-station-viewer" element={<BusStationViewer />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
            </>
          } />
        </Routes>
      </AnnouncementProvider>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AnnouncementProvider>
          <AppContent />
        </AnnouncementProvider>
      </Router>
    </Provider>
  );
};

export default App;
