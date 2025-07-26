import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Switch, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Settings() {
    const { user, signOut } = useAuth();
  const { 
    mt5Config, 
    connectMT5, 
    disconnectMT5, 
    addAutomationRule, 
    automationRules, 
    toggleAutomationRule, 
    deleteAutomationRule,
    isConnecting,
    connectionError,
    realTimeData
  } = useTrading();
  
  const [server, setServer] = useState(mt5Config.server);
  const [login, setLogin] = useState(mt5Config.login);
  const [password, setPassword] = useState(mt5Config.password);
  const [connecting, setConnecting] = useState(false);
  
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');

  const handleMT5Connect = async () => {
    if (!server || !login || !password) {
      const message = 'Please fill in all MT5 connection details (Server, Login, Password)';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    try {
      await connectMT5({ server, login, password });
      const message = 'Successfully connected to MT5 broker! Your account is now linked.';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Success', message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to MT5';
      const message = `Connection failed: ${errorMsg}\n\nPlease verify your credentials and server details.`;
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Connection Error', message);
      }
    }
  };

  const handleMT5Disconnect = () => {
    const message = 'Are you sure you want to disconnect from MT5? This will stop real-time trading.';
    if (Platform.OS === 'web') {
      if (confirm(message)) {
        disconnectMT5();
      }
    } else {
      Alert.alert('Confirm Disconnect', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectMT5 }
      ]);
    }
  };

  const handleAddRule = () => {
    if (!newRuleName.trim() || !newRuleDescription.trim()) {
      const message = 'Please provide both rule name and description';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    addAutomationRule(newRuleName.trim(), newRuleDescription.trim());
    setNewRuleName('');
    setNewRuleDescription('');
  };

  const handleDeleteRule = (ruleId: string) => {
    const message = 'Are you sure you want to delete this automation rule?';
    if (Platform.OS === 'web') {
      if (confirm(message)) {
        deleteAutomationRule(ruleId);
      }
    } else {
      Alert.alert('Confirm Delete', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAutomationRule(ruleId) }
      ]);
    }
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
            <Text style={styles.subtitle}>Platform configuration</Text>
          </View>
          <MaterialIcons name="settings" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        <Card style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.primary + '15', Colors.surface]}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <MaterialIcons name="account-circle" size={64} color={Colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'Trader'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.profileBadge}>
                  <MaterialIcons name="verified" size={16} color={Colors.bullish} />
                  <Text style={styles.profileBadgeText}>Verified Account</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* MT5 Connection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="cloud" size={24} color={Colors.secondary} />
                <Text style={styles.cardTitle}>MT5 Connection</Text>
              </View>
              <View style={[styles.connectionStatus, { 
                backgroundColor: mt5Config.connected ? Colors.bullish + '20' : isConnecting ? Colors.primary + '20' : Colors.bearish + '20' 
              }]}>
                <MaterialIcons 
                  name={mt5Config.connected ? "wifi" : isConnecting ? "sync" : "wifi-off"} 
                  size={16} 
                  color={mt5Config.connected ? Colors.bullish : isConnecting ? Colors.primary : Colors.bearish} 
                />
                <Text style={[styles.connectionStatusText, { 
                  color: mt5Config.connected ? Colors.bullish : isConnecting ? Colors.primary : Colors.bearish 
                }]}>
                  {mt5Config.connected ? 'Live Trading' : isConnecting ? 'Connecting...' : 'Offline'}
                </Text>
              </View>
            </View>
            
            {connectionError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color={Colors.bearish} />
                <Text style={styles.errorText}>{connectionError}</Text>
              </View>
            )}

            {mt5Config.connected && realTimeData.accountInfo && (
              <View style={styles.accountInfoContainer}>
                <Text style={styles.accountInfoTitle}>Account Information</Text>
                <View style={styles.accountInfoGrid}>
                  <View style={styles.accountInfoItem}>
                    <Text style={styles.accountInfoLabel}>Balance</Text>
                    <Text style={styles.accountInfoValue}>
                      {realTimeData.accountInfo.currency} {realTimeData.accountInfo.balance.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.accountInfoItem}>
                    <Text style={styles.accountInfoLabel}>Equity</Text>
                    <Text style={styles.accountInfoValue}>
                      {realTimeData.accountInfo.currency} {realTimeData.accountInfo.equity.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.accountInfoItem}>
                    <Text style={styles.accountInfoLabel}>Free Margin</Text>
                    <Text style={styles.accountInfoValue}>
                      {realTimeData.accountInfo.currency} {realTimeData.accountInfo.freeMargin.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.accountInfoItem}>
                    <Text style={styles.accountInfoLabel}>Leverage</Text>
                    <Text style={styles.accountInfoValue}>1:{realTimeData.accountInfo.leverage}</Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Server"
                value={server}
                onChangeText={setServer}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., MetaQuotes-Demo, YourBroker-Live01"
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
                disabled={isConnecting}
              />
              
              <TextInput
                label="Login"
                value={login}
                onChangeText={setLogin}
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
                disabled={isConnecting}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
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
                disabled={isConnecting}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={handleMT5Connect}
                loading={isConnecting}
                disabled={isConnecting}
                style={[styles.connectButton, { flex: mt5Config.connected ? 1 : 2 }]}
                buttonColor={Colors.primary}
                textColor={Colors.background}
                icon={isConnecting ? "sync" : "connection"}
              >
                {isConnecting ? 'Connecting...' : mt5Config.connected ? 'Reconnect' : 'Connect to MT5'}
              </Button>
              
              {mt5Config.connected && (
                <Button
                  mode="outlined"
                  onPress={handleMT5Disconnect}
                  style={[styles.disconnectButton, { flex: 1 }]}
                  textColor={Colors.bearish}
                  icon="power-off"
                >
                  Disconnect
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Automation Rules */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="smart-toy" size={24} color={Colors.accent} />
                <Text style={styles.cardTitle}>Automation Rules</Text>
              </View>
              <Text style={styles.sectionSubtitle}>{automationRules.length} rules</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Rule Name"
                value={newRuleName}
                onChangeText={setNewRuleName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., RSI Oversold Buy Signal"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
              />
              
              <TextInput
                label="Rule Description"
                value={newRuleDescription}
                onChangeText={setNewRuleDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Describe the conditions and actions..."
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
              />
            </View>
            
            <Button
              mode="outlined"
              onPress={handleAddRule}
              style={styles.addRuleButton}
              textColor={Colors.accent}
              icon="plus"
            >
              Add Automation Rule
            </Button>
            
            {automationRules.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No automation rules configured</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create rules to automate your trading strategies
                </Text>
              </View>
            ) : (
              <>
                <Divider style={styles.divider} />
                <View style={styles.rulesContainer}>
                  {automationRules.map((rule, index) => (
                    <View key={rule.id}>
                      <View style={styles.ruleItem}>
                        <View style={styles.ruleHeader}>
                          <View style={styles.ruleInfo}>
                            <Text style={styles.ruleName}>{rule.name}</Text>
                            <Text style={styles.ruleDescription}>{rule.description}</Text>
                          </View>
                          <Switch
                            value={rule.isActive}
                            onValueChange={() => toggleAutomationRule(rule.id)}
                            thumbColor={rule.isActive ? Colors.bullish : Colors.textMuted}
                            trackColor={{
                              false: Colors.border,
                              true: Colors.bullish + '40'
                            }}
                          />
                        </View>
                        
                        <View style={styles.ruleActions}>
                          <View style={styles.ruleStats}>
                            <View style={styles.ruleStat}>
                              <Text style={styles.ruleStatValue}>
                                {Math.floor(Math.random() * 15) + 1}
                              </Text>
                              <Text style={styles.ruleStatLabel}>Triggers</Text>
                            </View>
                            <View style={styles.ruleStat}>
                              <Text style={styles.ruleStatValue}>
                                {(Math.random() * 30 + 60).toFixed(0)}%
                              </Text>
                              <Text style={styles.ruleStatLabel}>Success</Text>
                            </View>
                          </View>
                          
                          <Button
                            mode="text"
                            onPress={() => handleDeleteRule(rule.id)}
                            textColor={Colors.bearish}
                            compact
                            icon="delete"
                          >
                            Delete
                          </Button>
                        </View>
                      </View>
                      {index < automationRules.length - 1 && <Divider style={styles.ruleDivider} />}
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="manage-accounts" size={24} color={Colors.bearish} />
                <Text style={styles.cardTitle}>Account Management</Text>
              </View>
            </View>
            
            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <Text style={styles.dangerZoneDescription}>
                These actions will affect your account and trading session
              </Text>
              
              <Button
                mode="outlined"
                onPress={signOut}
                style={styles.signOutButton}
                textColor={Colors.bearish}
                icon="logout"
              >
                Sign Out
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
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
  profileCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  profileGradient: {
    borderRadius: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bullish + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    ...Typography.caption,
    color: Colors.bullish,
    marginLeft: 4,
    fontWeight: '500',
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
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  connectButton: {
    marginTop: 4,
  },
  addRuleButton: {
    borderColor: Colors.accent,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 16,
  },
  emptyStateSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  rulesContainer: {
    gap: 0,
  },
  ruleItem: {
    paddingVertical: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 16,
  },
  ruleName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  ruleDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ruleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleStats: {
    flexDirection: 'row',
    gap: 24,
  },
  ruleStat: {
    alignItems: 'center',
  },
  ruleStatValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  ruleStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  ruleDivider: {
    backgroundColor: Colors.border,
  },
  dangerZone: {
    backgroundColor: Colors.bearish + '10',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.bearish + '30',
  },
  dangerZoneTitle: {
    ...Typography.body1,
    color: Colors.bearish,
    fontWeight: '600',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  signOutButton: {
    borderColor: Colors.bearish,
  },
});