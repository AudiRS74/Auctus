import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';

export default function SettingsScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { 
    mt5Config, 
    connectMT5, 
    disconnectMT5, 
    isConnecting, 
    connectionError 
  } = useTrading();
  
  const [showMT5Modal, setShowMT5Modal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mt5Form, setMT5Form] = useState({
    server: mt5Config.server || '',
    login: mt5Config.login || '',
    password: '',
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    notifications: true,
    autoTrading: true,
    darkMode: true,
    soundEnabled: true,
    priceAlerts: true,
  });

  const handleMT5Connect = async () => {
    if (!mt5Form.server.trim() || !mt5Form.login.trim() || !mt5Form.password.trim()) {
      Alert.alert('Error', 'Please fill in all MT5 connection details');
      return;
    }

    try {
      await connectMT5({
        server: mt5Form.server,
        login: mt5Form.login,
        password: mt5Form.password,
      });
      
      setShowMT5Modal(false);
      Alert.alert('Success', 'Connected to MT5 successfully!');
      
      // Clear password for security
      setMT5Form(prev => ({ ...prev, password: '' }));
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        error instanceof Error ? error.message : 'Failed to connect to MT5'
      );
    }
  };

  const handleMT5Disconnect = () => {
    Alert.alert(
      'Disconnect MT5',
      'Are you sure you want to disconnect from MT5?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnectMT5();
            setMT5Form({ server: '', login: '', password: '' });
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      
      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // Use a simple web alert for demo
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const MT5ConnectionModal = () => (
    <Modal
      visible={showMT5Modal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMT5Modal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>MT5 Connection</Text>
            <TouchableOpacity 
              onPress={() => setShowMT5Modal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Server</Text>
              <TextInput
                style={styles.textInput}
                value={mt5Form.server}
                onChangeText={(text) => setMT5Form(prev => ({ ...prev, server: text }))}
                placeholder="e.g. Demo-Server, Live-Server"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.textInput}
                value={mt5Form.login}
                onChangeText={(text) => setMT5Form(prev => ({ ...prev, login: text }))}
                placeholder="Your MT5 account number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={mt5Form.password}
                onChangeText={(text) => setMT5Form(prev => ({ ...prev, password: text }))}
                placeholder="Your MT5 password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {connectionError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{connectionError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, isConnecting && styles.disabledButton]}
              onPress={handleMT5Connect}
              disabled={isConnecting}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ProfileModal = () => (
    <Modal
      visible={showProfileModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={() => setShowProfileModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileForm.name}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={profileForm.email}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                editable={false}
              />
              <Text style={styles.helpText}>Email cannot be changed</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <MaterialIcons name="account-circle" size={48} color={Colors.primary} />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowProfileModal(true)}
            >
              <MaterialIcons name="edit" size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MT5 Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MT5 Connection</Text>
          
          <View style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionInfo}>
                <MaterialIcons name="cloud" size={24} color={Colors.textSecondary} />
                <View style={styles.connectionDetails}>
                  <Text style={styles.connectionTitle}>MetaTrader 5</Text>
                  <Text style={styles.connectionStatus}>
                    {mt5Config.connected ? `Connected to ${mt5Config.server}` : 'Not connected'}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.connectionIndicator,
                { backgroundColor: mt5Config.connected ? Colors.bullish : Colors.bearish }
              ]} />
            </View>
            
            <View style={styles.connectionActions}>
              {mt5Config.connected ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleMT5Disconnect}
                >
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => setShowMT5Modal(true)}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="notifications" size={20} color={Colors.textSecondary} />
                <Text style={styles.preferenceLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, notifications: value }))}
                trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                thumbColor={preferences.notifications ? Colors.textPrimary : Colors.textSecondary}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="smart-toy" size={20} color={Colors.textSecondary} />
                <Text style={styles.preferenceLabel}>Auto Trading</Text>
              </View>
              <Switch
                value={preferences.autoTrading}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, autoTrading: value }))}
                trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                thumbColor={preferences.autoTrading ? Colors.textPrimary : Colors.textSecondary}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="volume-up" size={20} color={Colors.textSecondary} />
                <Text style={styles.preferenceLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={preferences.soundEnabled}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, soundEnabled: value }))}
                trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                thumbColor={preferences.soundEnabled ? Colors.textPrimary : Colors.textSecondary}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="notification-important" size={20} color={Colors.textSecondary} />
                <Text style={styles.preferenceLabel}>Price Alerts</Text>
              </View>
              <Switch
                value={preferences.priceAlerts}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, priceAlerts: value }))}
                trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                thumbColor={preferences.priceAlerts ? Colors.textPrimary : Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => showAlert('App Version', 'TradingPro v1.0.0')}
            >
              <MaterialIcons name="info" size={20} color={Colors.textSecondary} />
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => showAlert('Privacy Policy', 'View our privacy policy at tradingpro.com/privacy')}
            >
              <MaterialIcons name="privacy-tip" size={20} color={Colors.textSecondary} />
              <Text style={styles.aboutLabel}>Privacy Policy</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => showAlert('Terms of Service', 'View our terms at tradingpro.com/terms')}
            >
              <MaterialIcons name="description" size={20} color={Colors.textSecondary} />
              <Text style={styles.aboutLabel}>Terms of Service</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <MaterialIcons name="logout" size={20} color={Colors.error} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <MT5ConnectionModal />
      <ProfileModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  connectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connectionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  connectButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  disconnectButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  preferencesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  aboutValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: Colors.border,
  },
  helpText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bottomPadding: {
    height: 20,
  },
});