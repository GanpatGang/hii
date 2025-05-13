import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'student'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', newUser);
      setNewUser({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'student'
      });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await axios.patch(`/api/users/${user._id}`, {
        active: !user.active
      });
      fetchUsers();
    } catch (error) {
      setError('Failed to update user status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management">
      <h1>User Management</h1>

      {/* Add New User Form */}
      <div className="user-form-card">
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={newUser.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="users-list-card">
        <h2>Users List</h2>
        <div className="users-grid">
          <div className="user-row header">
            <div>Name</div>
            <div>Username</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {users.map(user => (
            <div key={user._id} className="user-row">
              <div>{user.fullName}</div>
              <div>{user.username}</div>
              <div>{user.email}</div>
              <div className={`role-badge ${user.role}`}>
                {user.role}
              </div>
              <div>
                <button
                  onClick={() => handleToggleActive(user)}
                  className={`status-button ${user.active ? 'active' : 'inactive'}`}
                >
                  {user.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="actions">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserManagement; 