import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Activities from './components/Activities';
import Leaderboard from './components/Leaderboard';
import Teams from './components/Teams';
import Users from './components/Users';
import Workouts from './components/Workouts';

const features = [
  { to: '/users',      icon: '👤', title: 'Users',       desc: 'View all registered members of the OctoFit community.' },
  { to: '/teams',      icon: '🤝', title: 'Teams',       desc: 'Browse teams and see who is training together.' },
  { to: '/activities', icon: '🏃', title: 'Activities',  desc: 'Log and review fitness activities for every user.' },
  { to: '/leaderboard',icon: '🏆', title: 'Leaderboard', desc: 'See who tops the fitness rankings this season.' },
  { to: '/workouts',   icon: '💪', title: 'Workouts',    desc: 'Explore personalised workout plans and routines.' },
];

function Home() {
  return (
    <>
      <div className="octofit-hero text-center">
        <img
          src={process.env.PUBLIC_URL + '/octofitapp-small.png'}
          alt="OctoFit"
          height="80"
          className="mb-3"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1>Welcome to OctoFit Tracker!</h1>
        <p className="lead mb-4">
          Track your fitness activities, join teams, and compete on the leaderboard.
        </p>
        <NavLink to="/activities" className="btn btn-success btn-lg me-2">Get Started</NavLink>
        <NavLink to="/leaderboard" className="btn btn-outline-light btn-lg">View Leaderboard</NavLink>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
        {features.map((f) => (
          <div className="col" key={f.to}>
            <NavLink to={f.to} className="text-decoration-none d-block h-100">
              <div className="card octofit-feature-card h-100" style={{ cursor: 'pointer' }}>
                <div className="card-header">{f.icon} {f.title}</div>
                <div className="card-body">
                  <p className="card-text text-muted">{f.desc}</p>
                </div>
                <div className="card-footer bg-transparent border-0">
                  <span className="btn btn-sm btn-success w-100">Open {f.title}</span>
                </div>
              </div>
            </NavLink>
          </div>
        ))}
      </div>
    </>
  );
}

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg octofit-navbar">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            <img
              src={process.env.PUBLIC_URL + '/octofitapp-small.png'}
              alt="OctoFit Tracker"
              height="36"
              className="me-2"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            OctoFit Tracker
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-1">
              {features.map((f) => (
                <li className="nav-item" key={f.to}>
                  <NavLink className="nav-link" to={f.to}>{f.icon} {f.title}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/users"      element={<Users />} />
          <Route path="/teams"      element={<Teams />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/workouts"   element={<Workouts />} />
        </Routes>
      </div>

      <footer className="text-center text-muted py-4 mt-5 border-top">
        <small>OctoFit Tracker &copy; {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}

export default App;
