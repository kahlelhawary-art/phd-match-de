import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import Discover from './pages/Discover.jsx';
import Compass from './pages/Compass.jsx';
import Library from './pages/Library.jsx';
import Labs from './pages/Labs.jsx';
import Match from './pages/Match.jsx';
import Tracker from './pages/Tracker.jsx';
import Letter from './pages/Letter.jsx';
import Outreach from './pages/Outreach.jsx';
import Profile from './pages/Profile.jsx';
import InterviewPrep from './pages/InterviewPrep.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/compass" element={<Compass />} />
          <Route path="/library" element={<Library />} />
          <Route path="/labs" element={<Labs />} />
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

