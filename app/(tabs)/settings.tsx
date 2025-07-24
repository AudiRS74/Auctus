import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Switch, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTrading } from '@/hooks/useTrading';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { mt5Config, connectMT5 } = useTrading();
  const [server, setServer] = useState(mt5Config.server);
  const [login, setLogin] = useState(mt5Config.login);
  const [password, setPassword] = useState(mt5Config.password);
  const [connecting, setConnecting] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const handleMT5Connect = async () => {
    if (!server || !login || !password) {
      Alert.alert('Error', 'Please fill in all MT5 connection details');
      return;
    }

    setConnecting(true);
    try {
      await connectMT5({ server, login, password });
      Alert.alert('Success', 'Successfully connected to MT5!');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to MT5. Please check your credentials.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  const handleVerifyEmail = () => {
    if (user?.verified) {
      Alert.alert('Info', 'Your email is already verified!');
    } else {
      Alert.alert(
        'Email Verification',
        'A verification email has been sent to your email address.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <MaterialIcons name="settings" size={24} color="#94A3B8" />
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.profileCard}>
            <Card.Title
              title="Profile"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="person" size={24} color="#00C896" />}
            />
            <Card.Content>
              <View style={styles.profileInfo}>
                <View style={styles.avatar}>
                  <MaterialIcons name="account-circle" size={60} color="#64748B" />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.name}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <View style={styles.verificationStatus}>
                    <MaterialIcons
                      name={user?.verified ? "verified" : "warning"}
                      size={16}
                      color={user?.verified ? "#10B981" : "#F59E0B"}
                    />
                    <Text style={[
                      styles.verificationText,
                      { color: user?.verified ? "#10B981" : "#F59E0B" }
                    ]}>
                      {user?.verified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                </View>
              </View>
              {!user?.verified && (
                <Button
                  mode="outlined"
                  onPress={handleVerifyEmail}
                  style={styles.verifyButton}
                  labelStyle={styles.verifyButtonText}
                >
                  Verify Email
                </Button>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.mt5Card}>
            <Card.Title
              title="MetaTrader 5 Configuration"
              titleStyle={styles.cardTitle}
              left={() => (
                <MaterialIcons
                  name={mt5Config.connected ? "cloud-done" : "cloud-off"}
                  size={24}
                  color={mt5Config.connected ? "#10B981" : "#EF4444"}
                />
              )}
            />
            <Card.Content>
              <View style={styles.connectionStatus}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[
                  styles.statusValue,
                  { color: mt5Config.connected ? "#10B981" : "#EF4444" }
                ]}>
                  {mt5Config.connected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>

              <TextInput
                label="MT5 Server"
                value={server}
                onChangeText={setServer}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., MetaQuotes-Demo"
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />

              <TextInput
                label="Login ID"
                value={login}
                onChangeText={setLogin}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />

              <Button
                mode="contained"
                onPress={handleMT5Connect}
                loading={connecting}
                disabled={connecting}
                style={styles.connectButton}
                labelStyle={styles.connectButtonText}
              >
                {connecting ? 'Connecting...' : mt5Config.connected ? 'Reconnect' : 'Connect'}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.preferencesCard}>
            <Card.Title
              title="Preferences"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="tune" size={24} color="#8B5CF6" />}
            />
            <Card.Content>
              <List.Item
                title="Push Notifications"
                description="Receive trading alerts and signals"
                left={() => <MaterialIcons name="notifications" size={24} color="#94A3B8" />}
                right={() => (
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    color="#00C896"
                  />
                )}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
              />

              <List.Item
                title="Auto Sync"
                description="Automatically sync data with MT5"
                left={() => <MaterialIcons name="sync" size={24} color="#94A3B8" />}
                right={() => (
                  <Switch
                    value={autoSync}
                    onValueChange={setAutoSync}
                    color="#00C896"
                  />
                )}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
              />

              <List.Item
                title="Risk Management"
                description="Configure trading risk settings"
                left={() => <MaterialIcons name="security" size={24} color="#94A3B8" />}
                right={() => <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
                onPress={() => Alert.alert('Coming Soon', 'Risk management settings will be available soon!')}
              />

              <List.Item
                title="Trading Hours"
                description="Set active trading time windows"
                left={() => <MaterialIcons name="schedule" size={24} color="#94A3B8" />}
                right={() => <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
                onPress={() => Alert.alert('Coming Soon', 'Trading hours configuration will be available soon!')}
              />
            </Card.Content>
          </Card>

          <Card style={styles.supportCard}>
            <Card.Title
              title="Support & Information"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="help" size={24} color="#F59E0B" />}
            />
            <Card.Content>
              <List.Item
                title="Help Center"
                description="Get help with trading and platform usage"
                left={() => <MaterialIcons name="help-center" size={24} color="#94A3B8" />}
                right={() => <MaterialIcons name="open-in-new" size={24} color="#94A3B8" />}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
                onPress={() => Alert.alert('Help Center', 'Opening help documentation...')}
              />

              <List.Item
                title="Contact Support"
                description="Get technical support and assistance"
                left={() => <MaterialIcons name="support" size={24} color="#94A3B8" />}
                right={() => <MaterialIcons name="open-in-new" size={24} color="#94A3B8" />}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
                onPress={() => Alert.alert('Support', 'Contact support at support@tradingbot.com')}
              />

              <List.Item
                title="App Version"
                description="TradingBot Pro v1.0.0"
                left={() => <MaterialIcons name="info" size={24} color="#94A3B8" />}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>

          <Card style={styles.signOutCard}>
            <Card.Content>
              <Button
                mode="outlined"
                onPress={handleSignOut}
                style={styles.signOutButton}
                labelStyle={styles.signOutButtonText}
                icon="logout"
              >
                Sign Out
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 16,
    color: '#94A3B8',
    marginVertical: 4,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    borderColor: '#F59E0B',
  },
  verifyButtonText: {
    color: '#F59E0B',
  },
  mt5Card: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#334155',
  },
  connectButton: {
    backgroundColor: '#00C896',
    paddingVertical: 8,
  },
  connectButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  preferencesCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  supportCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  listItem: {
    paddingVertical: 4,
  },
  listItemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  listItemDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signOutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  signOutButton: {
    borderColor: '#EF4444',
    paddingVertical: 8,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 16,
  },
});