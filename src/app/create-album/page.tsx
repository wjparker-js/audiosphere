'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Music } from 'lucide-react';
import Link from 'next/link';

export default function CreateAlbumPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genreOptions = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 'Classical',
    'Reggae', 'Folk', 'Blues', 'Metal', 'Punk', 'Soul', 'Funk', 'Disco', 'Alternative', 'Indie'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image change triggered', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        console.log('Invalid file type:', file.type);
        setErrors(prev => ({ ...prev, coverImage: 'Only JPEG, PNG, and WebP files are allowed' }));
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('File too large:', file.size);
        setErrors(prev => ({ ...prev, coverImage: 'File size must be less than 10MB' }));
        return;
      }
      
      console.log('Setting cover image and preview');
      setCoverImage(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
      console.log('Preview URL created:', previewUrl);
      setErrors(prev => ({ ...prev, coverImage: '' }));
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Album title is required';
    }
    
    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist name is required';
    }
    
    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('releaseDate', formData.releaseDate);
      formDataToSend.append('description', formData.description);
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      // Send to API
      const response = await fetch('/api/albums', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create album');
      }

      // Redirect to home page (success message removed)
      router.push('/');
      router.refresh();
      
    } catch (error) {
      console.error('Error creating album:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create album'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Page Title */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create New Album</h1>
          </div>
          <p className="text-gray-400 ml-11 text-sm">Add a new album to your music collection</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Cover Art */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cover Art</label>
                  <div className="relative">
                    {!coverPreview ? (
                      <label className="block border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-800/50 h-48">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <div className="flex flex-col items-center justify-center h-full">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium mb-1">Click to upload</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      </label>
                    ) : (
                      <div className="relative h-48 rounded-lg overflow-hidden bg-gray-900">
                        <img
                          src={coverPreview}
                          alt="Album cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                    {errors.coverImage && (
                      <p className="text-red-400 text-xs mt-1">{errors.coverImage}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-3">
                {/* Album Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold mb-1">
                    Album Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter album title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Artist */}
                <div>
                  <label htmlFor="artist" className="block text-sm font-semibold mb-1">
                    Artist *
                  </label>
                  <input
                    id="artist"
                    name="artist"
                    type="text"
                    placeholder="Enter artist name"
                    value={formData.artist}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                  {errors.artist && (
                    <p className="text-red-400 text-xs mt-1">{errors.artist}</p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-semibold mb-1">
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="" className="bg-gray-800">Select a genre</option>
                    {genreOptions.map((genre) => (
                      <option key={genre} value={genre} className="bg-gray-800">
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Release Date */}
                <div>
                  <label htmlFor="releaseDate" className="block text-sm font-semibold mb-1">
                    Release Date
                  </label>
                  <input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Album Details - Full Width */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold mb-1">
                Album Details
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter album description, background, or any additional details..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Creating Album...' : 'Create Album'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}