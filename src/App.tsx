
import { Heart, Activity, Users, Brain, Search, Sun } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCard from './components/FeatureCard';
import CommunityForum from './components/communityforum';
import  DiseasesMap  from './components/diseasesmapping'
import HealthSummary from './components/healthsummary'

function HomePage() {
  return (
    <>
      <Hero />
      
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Comprehensive Healthcare Solutions
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Community Forum"
            description="Connect with others, share experiences, and learn from a supportive health community."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-blue-600" />}
            title="AI Symptom Checker"
            description="Get instant insights about your symptoms with our advanced AI analysis system."
          />
          <FeatureCard
            icon={<Search className="w-8 h-8 text-blue-600" />}
            title="Disease Awareness"
            description="Access comprehensive information about various medical conditions and treatments."
          />
        </div>
      </section>

      {/* Health Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Heart className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-4xl font-bold">1M+</h3>
              <p className="mt-2">Users Helped</p>
            </div>
            <div>
              <Activity className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="mt-2">AI Support</p>
            </div>
            <div>
              <Users className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-4xl font-bold">50k+</h3>
              <p className="mt-2">Community Members</p>
            </div>
            <div>
              <Sun className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-4xl font-bold">98%</h3>
              <p className="mt-2">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/community" element={<CommunityForum />} />
          <Route path="/diseases" element={<DiseasesMap />} />
          <Route path="/healthsummary" element={<HealthSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;