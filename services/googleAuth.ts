import { Platform } from 'react-native';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

class GoogleAuthService {
  async signIn(): Promise<GoogleUser> {
    try {
      // Simulate Google Sign-In process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (Platform.OS === 'web') {
        // Web implementation would use Google's web SDK
        return this.simulateWebGoogleAuth();
      } else {
        // Mobile implementation would use Google Sign-In SDK
        return this.simulateMobileGoogleAuth();
      }
    } catch (error) {
      throw new Error('Google Sign-In failed');
    }
  }

  async signOut(): Promise<void> {
    // Simulate sign out
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private simulateWebGoogleAuth(): GoogleUser {
    return {
      id: 'google_' + Date.now(),
      name: 'Demo Google User',
      email: 'demo@gmail.com',
      photo: 'https://via.placeholder.com/100/0080FF/FFFFFF?text=GU',
    };
  }

  private simulateMobileGoogleAuth(): GoogleUser {
    return {
      id: 'google_mobile_' + Date.now(),
      name: 'Mobile Google User',
      email: 'mobile.demo@gmail.com',
      photo: 'https://via.placeholder.com/100/00C851/FFFFFF?text=MU',
    };
  }
}

export const googleAuth = new GoogleAuthService();