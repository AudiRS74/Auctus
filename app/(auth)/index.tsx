import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { MT5_SERVERS, DEMO_CREDENTIALS } from '../../constants/Markets';

export default function MT5Login() {
  const { signIn } = useAuth();
  const { connectMT5, isConnecting, connectionError } = useTrading();
  const [server, setServer] = useState('MetaQuotes-Demo');
  const [login, setLogin] = useState('12345');
  const [password, setPassword] = useState('demo123');
  const [showServerList, setShowServerList] = useState(false);

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

  const handleLogin = async () => {
    if (!server || !login || !password) {
      showAlert('Missing Information', 'Please fill in all required fields: Server, Login, and Password');
      return;
    }

    try {
      // First sign in to the app (demo mode)
      await signIn('demo@trader.com', 'demo123');

      // Then connect to MT5 with the provided credentials
      await connectMT5({ server: server.trim(), login: login.trim(), password });

      showAlert(
        'Connection Successful!', 
        `Successfully connected to ${server}.\n\nDemo Mode Active:\n• Real-time price simulation\n• Professional trading interface\n• Complete MT5-style functionality\n\nYour demo account is ready for trading!`
      );

    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      showAlert('Connection Failed', errorMessage);
    }
  };

  const handleServerSelect = (selectedServer: string) => {
    setServer(selectedServer);
    setShowServerList(false);

    // Auto-populate demo credentials for demo servers
    const demoCredential = DEMO_CREDENTIALS.find(cred => 
      cred.server.toLowerCase() === selectedServer.toLowerCase() ||
      selectedServer.toLowerCase().includes(cred.server.toLowerCase())
    );

    if (demoCredential) {
      setLogin(demoCredential.login);
      setPassword(demoCredential.password);
    }
  };

  const fillDemoCredentials = () => {
    setServer('MetaQuotes-Demo');
    setLogin('12345');
    setPassword('demo123');
    showAlert('Demo Credentials', 'Demo credentials have been filled in. Click "Connect to Server" to proceed.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="account-balance" size={48} color={Colors.primary} />
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>MetaTrader 5</Text>
              <Text style={styles.logoSubtitle}>Professional Trading Platform</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Demo Mode Notice */}
        <Card style={styles.demoNoticeCard}>
          <Card.Content style={styles.demoNoticeContent}>
            <View style={styles.demoNoticeHeader}>
              <MaterialIcons name="info" size={24} color={Colors.primary} />
              <Text style={styles.demoNoticeTitle}>Demo Trading Mode</Text>
            </View>
            <Text style={styles.demoNoticeText}>
              Experience professional MT5 trading with real-time market simulation. 
              All features are fully functional in demonstration mode.
            </Text>
            <Button
              mode="outlined"
              onPress={fillDemoCredentials}
              style={styles.demoButton}
              textColor={Colors.primary}
              icon="flash-on"
              compact
            >
              Use Demo Credentials
            </Button>
          </Card.Content>
        </Card>

        {/* MT5 Login Form */}
        <Card style={styles.loginCard}>
          <LinearGradient
            colors={[Colors.surface, Colors.cardElevated]}
            style={styles.loginGradient}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Connect to Trading Server</Text>
              <Text style={styles.formSubtitle}>Enter your MT5 account credentials</Text>
            </View>

            <View style={styles.inputContainer}>
              {/* Server Selection */}
              <View style={styles.serverContainer}>
                <Text style={styles.inputLabel}>Trade Server *</Text>
                <TouchableOpacity
                  style={styles.serverSelector}
                  onPress={() => setShowServerList(true)}
                >
                  <View style={styles.serverSelectorContent}>
                    <MaterialIcons name="dns" size={20} color={Colors.textMuted} />
                    <Text style={styles.serverText}>
                      {server || 'Select trading server'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>

              <TextInput
                label="Login *"
                value={login}
                onChangeText={setLogin}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="Account number"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
                left={<TextInput.Icon icon="badge-account-horizontal-outline" iconColor={Colors.textMuted} />}
                disabled={isConnecting}
                right={
                  <TextInput.Icon 
                    icon="help-circle-outline" 
                    iconColor={Colors.textMuted}
                    onPress={() => showAlert(
                      'Account Login',
                      'Enter your MT5 account number:\n\n• Provided by your broker\n• Usually 6-10 digits\n• For demo: use "12345"\n\nContact your broker if you do not have this information.'
                    )}
                  />
                }
              />

              <TextInput
                label="Password *"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                placeholder="Account password"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
                left={<TextInput.Icon icon="form-textbox-password" iconColor={Colors.textMuted} />}
                disabled={isConnecting}
                right={
                  <TextInput.Icon 
                    icon="help-circle-outline" 
                    iconColor={Colors.textMuted}
                    onPress={() => showAlert(
                      'Account Password',
                      'Enter your MT5 account password:\n\n• Set by you or your broker\n• Case sensitive\n• For demo: use "demo123"\n\nUse "Forgot Password" if you cannot remember it.'
                    )}
                  />
                }
              />
            </View>

            {connectionError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color={Colors.bearish} />
                <Text style={styles.errorText}>{connectionError}</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isConnecting}
              disabled={isConnecting || !server || !login || !password}
              style={styles.loginButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon={isConnecting ? "sync" : "login"}
              labelStyle={styles.loginButtonText}
            >
              {isConnecting ? 'Connecting to Server...' : 'Connect to Server'}
            </Button>

            <Divider style={styles.divider} />

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <View style={styles.helpLinks}>
                <Button
                  mode="text"
                  onPress={() => showAlert(
                    'Demo Account',
                    'For testing purposes:\n\nServer: MetaQuotes-Demo\nLogin: 12345\nPassword: demo123\n\nThis will give you access to all trading features in demonstration mode.'
                  )}
                  textColor={Colors.secondary}
                  icon="school"
                  compact
                >
                  Demo Account Info
                </Button>
                <Button
                  mode="text"
                  onPress={() => showAlert(
                    'Forgot Credentials',
                    'If you have forgotten your MT5 credentials:\n\n1. Contact your broker directly\n2. Check your broker welcome email\n3. Login to your broker client area\n4. Request password reset\n\nFor demo testing, use the "Demo Account Info" option.'
                  )}
                  textColor={Colors.accent}
                  icon="help"
                  compact
                >
                  Forgot Password?
                </Button>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Features Preview */}
        <Card style={styles.featuresCard}>
          <Card.Content style={styles.featuresContent}>
            <Text style={styles.featuresTitle}>Trading Platform Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="timeline" size={24} color={Colors.bullish} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Real-Time Charts</Text>
                  <Text style={styles.featureDescription}>TradingView integration with live data</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="trending-up" size={24} color={Colors.primary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Professional Trading</Text>
                  <Text style={styles.featureDescription}>Execute trades with precision</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="analytics" size={24} color={Colors.accent} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Technical Analysis</Text>
                  <Text style={styles.featureDescription}>Advanced indicators and tools</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="smart-toy" size={24} color={Colors.secondary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Automation Engine</Text>
                  <Text style={styles.featureDescription}>Automated trading strategies</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Server Selection Modal */}
      <Modal
        visible={showServerList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServerList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.serverModal}>
            <View style={styles.serverModalHeader}>
              <Text style={styles.serverModalTitle}>Select Trading Server</Text>
              <TouchableOpacity
                onPress={() => setShowServerList(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.serverList}>
              <Text style={styles.serverCategoryTitle}>Demo Servers</Text>
              {MT5_SERVERS.filter(s => s.type === 'demo').map((serverInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.serverItem,
                    server === serverInfo.name && styles.selectedServerItem
                  ]}
                  onPress={() => handleServerSelect(serverInfo.name)}
                >
                  <View style={styles.serverItemContent}>
                    <MaterialIcons name="dns" size={20} color={Colors.primary} />
                    <View style={styles.serverItemText}>
                      <Text style={styles.serverItemName}>{serverInfo.name}</Text>
                      <Text style={styles.serverItemRegion}>{serverInfo.region}</Text>
                    </View>
                    {server === serverInfo.name && (
                      <MaterialIcons name="check-circle" size={20} color={Colors.bullish} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: 12,
  },
  logoTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  logoSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  demoNoticeCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  demoNoticeContent: {
    paddingVertical: 20,
  },
  demoNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoNoticeTitle: {
    ...Typography.h6,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  demoNoticeText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  demoButton: {
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  loginCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  loginGradient: {
    borderRadius: 16,
    padding: 24,
  },
  formHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  formTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  formSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  serverContainer: {
    marginBottom: 16,
  },
  serverSelector: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  serverSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bearish + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.bearish,
    flex: 1,
    lineHeight: 18,
  },
  loginButton: {
    marginBottom: 24,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  helpSection: {
    alignItems: 'center',
  },
  helpTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  helpLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  featuresCard: {
    marginBottom: 32,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  featuresContent: {
    paddingVertical: 20,
  },
  featuresTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  serverModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  serverModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serverModalTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  serverList: {
    flex: 1,
    padding: 20,
  },
  serverCategoryTitle: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  serverItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedServerItem: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  serverItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverItemText: {
    marginLeft: 12,
    flex: 1,
  },
  serverItemName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  serverItemRegion: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Alert styles
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
    elevation: 8,
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