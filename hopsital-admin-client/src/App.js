import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import MainPage from './pages/MainPage';
import PricePage from './pages/PricePage';
import StoryPage from './pages/StoryPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/price" element={<PricePage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/support" element={<CustomerSupportPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App; 