// Google Authentication Service
// This is a placeholder implementation for demo purposes

export interface GoogleAuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
}

class GoogleAuthService {
  private isConfigured: boolean = false;

  async configure(): Promise<void> {
    // Configure Google Sign-In
    // In a real implementation, this would configure the Google Sign-In SDK
    this.isConfigured = true;
  }

  async signIn(): Promise<GoogleAuthResult> {
    if (!this.isConfigured) {
      await this.configure();
    }

    // Demo implementation - simulate Google sign-in
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful Google sign-in
        const result: GoogleAuthResult = {
          user: {
            id: 'google_user_' + Date.now(),
            email: 'demo.user@gmail.com',
            name: 'Demo Google User',
            avatar: undefined,
          },
          tokens: {
            accessToken: 'demo_access_token_' + Date.now(),
            refreshToken: 'demo_refresh_token_' + Date.now(),
          },
        };
        resolve(result);
      }, 1500);
    });
  }

  async signOut(): Promise<void> {
    // Sign out from Google
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  async isSignedIn(): Promise<boolean> {
    // Check if user is signed in with Google
    return false; // Always false for demo
  }

  async getCurrentUser(): Promise<GoogleAuthResult['user'] | null> {
    // Get current Google user
    return null; // Always null for demo
  }
}

export const googleAuthService = new GoogleAuthService();