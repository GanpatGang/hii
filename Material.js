const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true
  },
  fileUrl: {
    type: String,
    // Required only if type is file
    required: function() {
      return this.type === 'file';
    }
  },
  mimeType: {
    type: String,
    // Required only if type is file
    required: function() {
      return this.type === 'file';
    }
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  size: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt timestamp before saving
materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
materialSchema.index({ parentFolder: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema); 