import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Materials.css';

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMaterials();
  }, [location]);

  const fetchMaterials = async () => {
    try {
      const folderId = new URLSearchParams(location.search).get('folder');
      const response = await axios.get(`/api/materials?parentFolder=${folderId || ''}`);
      setMaterials(response.data);
      setCurrentFolder(folderId);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch materials');
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      await axios.post('/api/materials/folders', {
        title: folderName,
        parentFolder: currentFolder
      });
      fetchMaterials();
    } catch (error) {
      setError('Failed to create folder');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('parentFolder', currentFolder);

    try {
      await axios.post('/api/materials/files', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setUploadProgress(0);
      fetchMaterials();
    } catch (error) {
      setError('Failed to upload file');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/api/materials/${id}`);
      fetchMaterials();
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  const navigateToFolder = (folderId) => {
    navigate(`/materials?folder=${folderId}`);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="materials-container">
      <div className="materials-header">
        <h1>Educational Materials</h1>
        {currentFolder && (
          <button onClick={navigateBack} className="back-button">
            ← Back
          </button>
        )}
      </div>

      {(user.role === 'teacher' || user.role === 'admin') && (
        <div className="materials-actions">
          <button onClick={handleCreateFolder} className="action-button">
            Create Folder
          </button>
          <label className="file-upload-button">
            Upload File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="upload-progress">
          <div 
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="materials-grid">
        {materials.map((material) => (
          <div key={material._id} className="material-item">
            <div 
              className="material-content"
              onClick={() => material.type === 'folder' && navigateToFolder(material._id)}
            >
              <div className="material-icon">
                {material.type === 'folder' ? '📁' : '📄'}
              </div>
              <div className="material-info">
                <div className="material-title">{material.title}</div>
                <div className="material-meta">
                  {material.type === 'file' && (
                    <span>{(material.size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                </div>
              </div>
            </div>
            
            {(user.role === 'teacher' || user.role === 'admin') && (
              <button
                onClick={() => handleDelete(material._id)}
                className="delete-button"
              >
                Delete
              </button>
            )}
            
            {material.type === 'file' && (
              <a
                href={`${axios.defaults.baseURL}/${material.fileUrl}`}
                download
                className="download-button"
              >
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Materials; 