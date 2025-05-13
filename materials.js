const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const { auth, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Add any file type restrictions here
    cb(null, true);
  }
});

// Create folder
router.post('/folders', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, parentFolder } = req.body;
    
    const folder = new Material({
      title,
      description,
      type: 'folder',
      parentFolder: parentFolder || null,
      uploadedBy: req.user._id
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Upload file
router.post('/files', 
  auth, 
  authorize('teacher', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const material = new Material({
        title: req.body.title || req.file.originalname,
        description: req.body.description,
        type: 'file',
        fileUrl: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        parentFolder: req.body.parentFolder || null,
        uploadedBy: req.user._id
      });

      await material.save();
      res.status(201).json(material);
    } catch (error) {
      // Clean up uploaded file if database save fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get materials (with optional parent folder filter)
router.get('/', auth, async (req, res) => {
  try {
    const query = { parentFolder: req.query.parentFolder || null };
    
    // If student, only show public materials
    if (req.user.role === 'student') {
      query.isPublic = true;
    }

    const materials = await Material.find(query)
      .populate('uploadedBy', 'username fullName')
      .sort({ type: -1, createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Delete material (file or folder)
router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const material = await Material.findById(req.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Only allow deletion by the uploader or admin
    if (material.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // If it's a file, delete the actual file
    if (material.type === 'file' && material.fileUrl) {
      fs.unlinkSync(material.fileUrl);
    }

    // If it's a folder, delete all contents recursively
    if (material.type === 'folder') {
      const childMaterials = await Material.find({ parentFolder: material._id });
      for (const child of childMaterials) {
        if (child.type === 'file' && child.fileUrl) {
          fs.unlinkSync(child.fileUrl);
        }
        await child.remove();
      }
    }

    await material.remove();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// Update material
router.patch('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Only allow updates by the uploader or admin
    if (material.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
      isPublic: req.body.isPublic,
      parentFolder: req.body.parentFolder
    };

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        material[key] = updates[key];
      }
    });

    await material.save();
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material' });
  }
});

module.exports = router; 