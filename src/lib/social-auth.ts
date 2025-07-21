// Social authentication utilities for Google and Facebook OAuth
export interface SocialAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string[];
  };
  facebook: {
    appId: string;
    redirectUri: string;
    scope: string[];
  };
}

export interface SocialUserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: 'google' | 'facebook';
}

export class SocialAuthService {
  private static config: SocialAuthConfig = {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/google/callback`,
      scope: ['openid', 'email', 'profile']
    },
    facebook: {
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      redirectUri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/facebook/callback`,
      scope: ['email', 'public_profile']
    }
  };

  /**
   * Initialize Google OAuth
   */
  static async initializeGoogle(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      // Load Google OAuth script
      if (!document.getElementById('google-oauth-script')) {
        const script = document.createElement('script');
        script.id = 'google-oauth-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  /**
   * Initialize Facebook SDK
   */
  static async initializeFacebook(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      // Load Facebook SDK
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.onload = () => {
          (window as any).FB.init({
            appId: this.config.facebook.appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  /**
   * Google OAuth login
   */
  static async loginWithGoogle(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.initializeGoogle();

      if (!this.config.google.clientId) {
        throw new Error('Google Client ID not configured');
      }

      return new Promise((resolve) => {
        (window as any).google.accounts.oauth2.initCodeClient({
          client_id: this.config.google.clientId,
          scope: this.config.google.scope.join(' '),
          ux_mode: 'popup',
          callback: async (response: any) => {
            if (response.code) {
              try {
                // Send authorization code to backend
                const result = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ code: response.code }),
                  credentials: 'include'
                });

                const data = await result.json();
                resolve({ success: data.success, data: data.data, error: data.error?.message });
              } catch (error) {
                resolve({ success: false, error: 'Failed to authenticate with Google' });
              }
            } else {
              resolve({ success: false, error: 'Google authentication cancelled' });
            }
          },
          error_callback: (error: any) => {
            resolve({ success: false, error: error.message || 'Google authentication failed' });
          }
        }).requestCode();
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google authentication failed' 
      };
    }
  }

  /**
   * Facebook OAuth login
   */
  static async loginWithFacebook(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.initializeFacebook();

      if (!this.config.facebook.appId) {
        throw new Error('Facebook App ID not configured');
      }

      return new Promise((resolve) => {
        (window as any).FB.login((response: any) => {
          if (response.authResponse) {
            // Get user profile
            (window as any).FB.api('/me', { fields: 'name,email,picture' }, async (userInfo: any) => {
              try {
                // Send access token to backend
                const result = await fetch('/api/auth/facebook', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    accessToken: response.authResponse.accessToken,
                    userInfo 
                  }),
                  credentials: 'include'
                });

                const data = await result.json();
                resolve({ success: data.success, data: data.data, error: data.error?.message });
              } catch (error) {
                resolve({ success: false, error: 'Failed to authenticate with Facebook' });
              }
            });
          } else {
            resolve({ success: false, error: 'Facebook authentication cancelled' });
          }
        }, { scope: this.config.facebook.scope.join(',') });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Facebook authentication failed' 
      };
    }
  }

  /**
   * Generate OAuth URL for server-side redirect flow
   */
  static generateGoogleAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.google.clientId,
      redirect_uri: this.config.google.redirectUri,
      response_type: 'code',
      scope: this.config.google.scope.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    if (state) {
      params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate Facebook OAuth URL for server-side redirect flow
   */
  static generateFacebookAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.facebook.appId,
      redirect_uri: this.config.facebook.redirectUri,
      response_type: 'code',
      scope: this.config.facebook.scope.join(',')
    });

    if (state) {
      params.set('state', state);
    }

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange Google authorization code for tokens
   */
  static async exchangeGoogleCode(code: string): Promise<{
    access_token: string;
    id_token: string;
    refresh_token?: string;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.google.clientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.google.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Google authorization code');
    }

    return response.json();
  }

  /**
   * Get Google user profile from access token
   */
  static async getGoogleProfile(accessToken: string): Promise<SocialUserProfile> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to get Google user profile');
    }

    const profile = await response.json();
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      firstName: profile.given_name,
      lastName: profile.family_name,
      picture: profile.picture,
      provider: 'google'
    };
  }

  /**
   * Exchange Facebook authorization code for access token
   */
  static async exchangeFacebookCode(code: string): Promise<{ access_token: string }> {
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.facebook.appId,
        client_secret: process.env.FACEBOOK_APP_SECRET || '',
        code,
        redirect_uri: this.config.facebook.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Facebook authorization code');
    }

    return response.json();
  }

  /**
   * Get Facebook user profile from access token
   */
  static async getFacebookProfile(accessToken: string): Promise<SocialUserProfile> {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to get Facebook user profile');
    }

    const profile = await response.json();
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      picture: profile.picture?.data?.url,
      provider: 'facebook'
    };
  }

  /**
   * Validate social auth configuration
   */
  static validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.google.clientId) {
      errors.push('Google Client ID is not configured');
    }

    if (!this.config.facebook.appId) {
      errors.push('Facebook App ID is not configured');
    }

    if (typeof window !== 'undefined') {
      if (!this.config.google.redirectUri.startsWith('http')) {
        errors.push('Google redirect URI must be a valid URL');
      }

      if (!this.config.facebook.redirectUri.startsWith('http')) {
        errors.push('Facebook redirect URI must be a valid URL');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default SocialAuthService;