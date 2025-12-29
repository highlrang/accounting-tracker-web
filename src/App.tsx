import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import SettlementPage from './pages/SettlementPage';
import StatisticsPage from './pages/StatisticsPage';
import './App.css';

function App() {
  return (
    <div className="container">
      <header className="app-header">
        <nav>
          <NavLink to="/" end>정산</NavLink>
          <NavLink to="/stats">통계</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SettlementPage />} />
          <Route path="/stats" element={<StatisticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
