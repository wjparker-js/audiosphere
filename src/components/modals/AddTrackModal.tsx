'use client';

import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
  albumTitle: string;
  onTrackAdded: () => void;
}

export function AddTrackModal({ 
  isOpen, 
  onClose, 
  albumId, 
  albumTitle, 
  onTrackAdded 
}: AddTrackModalProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['audio/mpeg', 'audio/mp4', 'audio/m4a'].includes(file.type)) {
      setError('Only MP3 and M4A files are allowed');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setAudioFile(file);
    setError('');
    
    // Derive track title from filename (remove extension)
    const fileName = file.name;
    const titleWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    setTrackTitle(titleWithoutExtension);
  };

  const handleUpload = async () => {
    if (!audioFile || !trackTitle.trim()) {
      setError('Please select an audio file and enter a track title');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('audioFile', audioFile);
      formData.append('trackTitle', trackTitle.trim());
      formData.append('albumId', albumId);

      const response = await fetch('/api/tracks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload track');
      }

      // Success - close modal and refresh tracks
      onTrackAdded();
      handleClose();
      
    } catch (error) {
      console.error('Error uploading track:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload track');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setAudioFile(null);
    setTrackTitle('');
    setError('');
    setIsUploading(false);
    onClose();
  };

  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Add Track to {albumTitle}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Audio File (MP3 or M4A)
            </label>
            <div
              onClick={handleFileAreaClick}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gray-900/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mpeg,audio/mp4,audio/m4a,.mp3,.m4a"
                className="hidden"
                onChange={handleFileChange}
              />
              {!audioFile ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-400 font-medium">Click to upload audio file</p>
                  <p className="text-gray-500 text-sm mt-1">MP3 or M4A up to 50MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">{audioFile.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Track Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Track Title
            </label>
            <input
              type="text"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Enter track title"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !audioFile || !trackTitle.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? 'Adding Track...' : 'Add Track'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}