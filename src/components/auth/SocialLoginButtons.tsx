'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialAuthService } from '@/lib/social-auth';
import { useAuth } from '@/contexts/AuthContext';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function SocialLoginButtons({ onSuccess, onError, disabled = false }: SocialLoginButtonsProps) {
  const { updateUser } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (disabled || isGoogleLoading) return;

    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await SocialAuthService.loginWithGoogle();
      
      if (result.success && result.data) {
        // Update auth context with user data
        updateUser(result.data.user);
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Google login failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Google login failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (disabled || isFacebookLoading) return;

    setIsFacebookLoading(true);
    setError('');

    try {
      const result = await SocialAuthService.loginWithFacebook();
      
      if (result.success && result.data) {
        // Update auth context with user data
        updateUser(result.data.user);
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Facebook login failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Facebook login failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const isLoading = isGoogleLoading || isFacebookLoading;

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {/* Google Login Button */}
        <Button
          onClick={handleGoogleLogin}
          disabled={disabled || isLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGoogleLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Connecting to Google...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <GoogleIcon />
              Continue with Google
            </div>
          )}
        </Button>

        {/* Facebook Login Button */}
        <Button
          onClick={handleFacebookLogin}
          disabled={disabled || isLoading}
          className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isFacebookLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting to Facebook...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FacebookIcon />
              Continue with Facebook
            </div>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">or</span>
        </div>
      </div>
    </div>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Facebook Icon Component
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default SocialLoginButtons;