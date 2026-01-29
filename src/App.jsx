import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventView from './pages/EventView';
import ResetPassword from './pages/ResetPassword';
import PublicEventViewWrapper from './components/PublicEventViewWrapper';

import { UploadProvider } from './context/UploadContext';
import UploadWidget from './components/UploadWidget';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  console.log("Memora - Secure Event Sharing");
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UploadProvider>
          <Router>
            <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary/30">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/events" element={<Dashboard />} />
                  <Route path="/events/new" element={<CreateEvent />} />
                  <Route path="/events/:id" element={<EventView />} />
                  <Route path="/events/:id/edit" element={<EditEvent />} />
                  <Route path="/e/:code" element={<PublicEventViewWrapper />} />
                </Routes>
              </main>
              <Footer />
              <UploadWidget />
            </div>
          </Router>
        </UploadProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
