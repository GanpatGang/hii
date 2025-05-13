import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    recentMaterials: [],
    userCount: {
      total: 0,
      teachers: 0,
      students: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch materials statistics
      const materialsResponse = await axios.get('/api/materials');
      const materials = materialsResponse.data;
      
      // If admin, fetch user statistics
      let userStats = {};
      if (user.role === 'admin') {
        const usersResponse = await axios.get('/api/users');
        const users = usersResponse.data;
        userStats = {
          total: users.length,
          teachers: users.filter(u => u.role === 'teacher').length,
          students: users.filter(u => u.role === 'student').length
        };
      }

      setStats({
        totalMaterials: materials.length,
        recentMaterials: materials.slice(0, 5),
        userCount: userStats
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {user.fullName}!</h1>
      
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/materials" className="action-button">
              Browse Materials
            </Link>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link to="/materials" className="action-button">
                Upload Materials
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/users" className="action-button">
                Manage Users
              </Link>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="dashboard-card">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalMaterials}</span>
              <span className="stat-label">Total Materials</span>
            </div>
            {user.role === 'admin' && (
              <>
                <div className="stat-item">
                  <span className="stat-value">{stats.userCount.teachers}</span>
                  <span className="stat-label">Teachers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.userCount.students}</span>
                  <span className="stat-label">Students</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Materials */}
        <div className="dashboard-card full-width">
          <h2>Recent Materials</h2>
          <div className="materials-list">
            {stats.recentMaterials.map(material => (
              <div key={material._id} className="material-item">
                <div className="material-icon">
                  {material.type === 'folder' ? '📁' : '📄'}
                </div>
                <div className="material-info">
                  <h3>{material.title}</h3>
                  <p>
                    Uploaded by: {material.uploadedBy.fullName}
                    <br />
                    {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link 
                  to={`/materials?folder=${material._id}`}
                  className="view-button"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Role-specific Content */}
        {user.role === 'admin' && (
          <div className="dashboard-card">
            <h2>Admin Tools</h2>
            <div className="admin-tools">
              <Link to="/users" className="tool-button">
                User Management
              </Link>
              <Link to="/materials" className="tool-button">
                Content Management
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 