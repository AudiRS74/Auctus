import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Switch, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const { mt5Config, connectMT5, disconnectMT5, isConnecting, connectionError } = useTrading();
  
  // MT5 connection form state
  const [mt5Server, setMT5Server] = useState(mt5Config.server || '');
  const [mt5Login, setMT5Login] = useState(mt5Config.login || '');
  const [mt5Password, setMT5Password] = useState(mt5Config.password || '');
  const [showMT5Form, setShowMT5Form] = useState(!mt5Config.connected);
  
  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  
  // App settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cross-platform alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      const Alert = require('react-native').Alert;
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleMT5Connect = async () => {
    if (!mt5Server.trim() || !mt5Login.trim() || !mt5Password.trim()) {
      showAlert('Missing Information', 'Please fill in all MT5 connection fields');
      return;
    }

    try {
      await connectMT5({
        server: mt5Server.trim(),
        login: mt5Login.trim(),
        password: mt5Password.trim(),
      });
      
      setShowMT5Form(false);
      showAlert('Connection Successful', 'Successfully connected to MT5 demo server');
    } catch (error) {
      console.error('MT5 connection error:', error);
      // Error is already handled by the trading provider
    }
  };

  const handleMT5Disconnect = () => {
    showAlert(
      'Disconnect MT5',
      'Are you sure you want to disconnect from MT5? This will stop all real-time data feeds.',
      () => {
        disconnectMT5();
        setShowMT5Form(true);
        showAlert('Disconnected', 'Successfully disconnected from MT5');
      }
    );
  };

  const handleUpdateProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      showAlert('Missing Information', 'Please fill in all profile fields');
      return;
    }

    try {
      await updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
      });
      showAlert('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      showAlert('Update Failed', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        await logout();
        router.replace('/(auth)');
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your trading environment</Text>
          </View>
          <MaterialIcons name="settings" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* MT5 Connection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>MT5 Connection</Text>
              <View style={[styles.connectionStatus, { 
                backgroundColor: mt5Config.connected ? Colors.bullish + '20' : Colors.bearish + '20' 
              }]}>
                <MaterialIcons 
                  name={mt5Config.connected ? "cloud-done" : "cloud-off"} 
                  size={16} 
                  color={mt5Config.connected ? Colors.bullish : Colors.bearish} 
                />
                <Text style={[styles.connectionStatusText, { 
                  color: mt5Config.connected ? Colors.bullish : Colors.bearish 
                }]}>
                  {mt5Config.connected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>

            {mt5Config.connected && !showMT5Form ? (
              <View style={styles.connectedInfo}>
                <View style={styles.connectionDetails}>
                  <View style={styles.connectionDetail}>
                    <Text style={styles.detailLabel}>Server:</Text>
                    <Text style={styles.detailValue}>{mt5Config.server}</Text>
                  </View>
                  <View style={styles.connectionDetail}>
                    <Text style={styles.detailLabel}>Account:</Text>
                    <Text style={styles.detailValue}>{mt5Config.login}</Text>
                  </View>
                </View>
                
                <View style={styles.connectionActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowMT5Form(true)}
                    style={styles.editButton}
                    textColor={Colors.primary}
                    icon="edit"
                    compact
                  >
                    Edit
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleMT5Disconnect}
                    style={styles.disconnectButton}
                    buttonColor={Colors.bearish}
                    icon="cloud-off"
                    compact
                  >
                    Disconnect
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.mt5Form}>
                <Text style={styles.formDescription}>
                  Connect to your MT5 demo account for live trading simulation and real-time market data.
                </Text>
                
                <TextInput
                  label="Server Name"
                  value={mt5Server}
                  onChangeText={setMT5Server}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., MetaQuotes-Demo"
                  theme={{
                    colors: {
                      primary: Colors.primary,
                      onSurface: Colors.textPrimary,
                      outline: Colors.border,
                      surface: Colors.inputBackground,
                    }
                  }}
                  textColor={Colors.textPrimary}
                  left={<TextInput.Icon icon="server" iconColor={Colors.textMuted} />}
                />

                <TextInput
                  label="Account Number"
                  value={mt5Login}
                  onChangeText={setMT5Login}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Your MT5 account number"
                  theme={{
                    colors: {
                      primary: Colors.primary,
                      onSurface: Colors.textPrimary,
                      outline: Colors.border,
                      surface: Colors.inputBackground,
                    }
                  }}
                  textColor={Colors.textPrimary}
                  left={<TextInput.Icon icon="account" iconColor={Colors.textMuted} />}
                />

                <TextInput
                  label="Password"
                  value={mt5Password}
                  onChangeText={setMT5Password}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  placeholder="Your MT5 account password"
                  theme={{
                    colors: {
                      primary: Colors.primary,
                      onSurface: Colors.textPrimary,
                      outline: Colors.border,
                      surface: Colors.inputBackground,
                    }
                  }}
                  textColor={Colors.textPrimary}
                  left={<TextInput.Icon icon="lock" iconColor={Colors.textMuted} />}
                />

                {connectionError && (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error" size={20} color={Colors.error} />
                    <Text style={styles.errorText}>{connectionError}</Text>
                  </View>
                )}

                <Button
                  mode="contained"
                  onPress={handleMT5Connect}
                  loading={isConnecting}
                  disabled={isConnecting}
                  style={styles.connectButton}
                  buttonColor={Colors.primary}
                  textColor={Colors.background}
                  icon="cloud-upload"
                  labelStyle={styles.buttonText}
                >
                  {isConnecting ? 'Connecting...' : 'Connect to MT5'}
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Profile Settings */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            
            <TextInput
              label="Full Name"
              value={profileName}
              onChangeText={setProfileName}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="account" iconColor={Colors.textMuted} />}
            />

            <TextInput
              label="Email"
              value={profileEmail}
              onChangeText={setProfileEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="email" iconColor={Colors.textMuted} />}
            />

            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              style={styles.updateButton}
              buttonColor={Colors.secondary}
              textColor={Colors.background}
              icon="content-save"
              labelStyle={styles.buttonText}
            >
              Update Profile
            </Button>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Application Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive trading alerts and market updates</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor={notifications ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Use dark theme for better low-light viewing</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                thumbColor={darkMode ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Refresh</Text>
                <Text style={styles.settingDescription}>Automatically refresh market data</Text>
              </View>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                thumbColor={autoRefresh ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Account Actions</Text>
            
            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)')}
              style={styles.actionButton}
              textColor={Colors.secondary}
              icon="login"
              labelStyle={styles.buttonText}
            >
              Switch Account
            </Button>

            <Button
              mode="contained"
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
              buttonColor={Colors.bearish}
              textColor={Colors.background}
              icon="logout"
              labelStyle={styles.buttonText}
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>App Information</Text>
            
            <View style={styles.appInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version:</Text>
                <Text style={styles.infoValue}>1.0.0 (Demo)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform:</Text>
                <Text style={styles.infoValue}>{Platform.OS.toUpperCase()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build:</Text>
                <Text style={styles.infoValue}>Demo Build</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Cross-platform Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectionStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  connectedInfo: {
    gap: 16,
  },
  connectionDetails: {
    gap: 8,
  },
  connectionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  detailLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    borderColor: Colors.primary,
  },
  disconnectButton: {
    flex: 1,
  },
  mt5Form: {
    gap: 16,
  },
  formDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBackground,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.error + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error,
    flex: 1,
  },
  connectButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  settingDescription: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 4,
  },
  logoutButton: {
    marginBottom: 0,
  },
  appInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  // Cross-platform alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%',
  },
  alertTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 80,
  },
  alertButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: '500',
  },
});