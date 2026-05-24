import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import HeroVideo from './components/HeroVideo.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Deadlines from './pages/Deadlines.jsx';
import Documents from './pages/Documents.jsx';
import Digest from './pages/Digest.jsx';
import Discover from './pages/Discover.jsx';
import Compass from './pages/Compass.jsx';
import Library from './pages/Library.jsx';
import Labs from './pages/Labs.jsx';
import Openings from './pages/Openings.jsx';
import Match from './pages/Match.jsx';
import Tracker from './pages/Tracker.jsx';
import Letter from './pages/Letter.jsx';
import Outreach from './pages/Outreach.jsx';
import Profile from './pages/Profile.jsx';
import InterviewPrep from './pages/InterviewPrep.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <IntroSplash />
      <Navigation />

      {isHome && <HeroVideo />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/digest" element={<Digest />} />
          <Route path="/compass" element={<Compass />} />
          <Route path="/library" element={<Library />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/openings" element={<Openings />} />
          <Route path="/match" element={<Match />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/letter" element={<Letter />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interview" element={<InterviewPrep />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

