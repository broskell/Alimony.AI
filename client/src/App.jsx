import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Results from './pages/Results';
import LawyerDirectory from './pages/LawyerDirectory';
import LawyerProfile from './pages/LawyerProfile';
import MyCases from './pages/MyCases';
import CaseDetail from './pages/CaseDetail';
import DocumentDraft from './pages/DocumentDraft';
import LegalLibrary from './pages/LegalLibrary';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { token, fetchMe } = useAuthStore();
  useEffect(() => { if (token) fetchMe(); }, [token, fetchMe]);
  return children;
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    initTheme();
    if (token) useAuthStore.getState().fetchMe();
  }, [initTheme, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppShell withSidebar />}>
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/lawyers" element={<LawyerDirectory />} />
          <Route path="/lawyers/:id" element={<LawyerProfile />} />
          <Route path="/library" element={<LegalLibrary />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/results" element={<Results />} />
          <Route path="/cases" element={<MyCases />} />
          <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
          <Route path="/documents" element={<DocumentDraft />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
