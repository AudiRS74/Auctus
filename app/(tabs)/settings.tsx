import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Switch } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { mt5Config, connectMT5, addAutomationRule, automationRules, toggleAutomationRule, deleteAutomationRule } = useTrading();
  
  const [server, setServer] = useState(mt5Config.server);
  const [login, setLogin] = useState(mt5Config.login);
  const [password, setPassword] = useState(mt5Config.password);
  const [connecting, setConnecting] = useState(false);
  
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');

  const handleMT5Connect = async () => {
    if (!server || !login || !password) {
      const message = 'Please fill in all MT5 connection details';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setConnecting(true);
    try {
      await connectMT5({ server, login, password });
      const message = 'Successfully connected to MT5';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Success', message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to MT5';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setConnecting(false);
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>User Profile</Text>
            <View style={styles.profileRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user?.name}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>MT5 Connection</Text>
            <View style={styles.connectionStatus}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, { 
                color: mt5Config.connected ? '#4CAF50' : '#F44336' 
              }]}>
                {mt5Config.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            
            <TextInput
              label="Server"
              value={server}
              onChangeText={setServer}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., MetaQuotes-Demo"
            />
            
            <TextInput
              label="Login"
              value={login}
              onChangeText={setLogin}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleMT5Connect}
              loading={connecting}
              disabled={connecting}
              style={styles.connectButton}
            >
              {mt5Config.connected ? 'Reconnect' : 'Connect'} to MT5
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Automation Rules</Text>
            
            <TextInput
              label="Rule Name"
              value={newRuleName}
              onChangeText={setNewRuleName}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., RSI Oversold Buy"
            />
            
            <TextInput
              label="Rule Description"
              value={newRuleDescription}
              onChangeText={setNewRuleDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Describe the automation rule..."
            />
            
            <Button
              mode="outlined"
              onPress={handleAddRule}
              style={styles.addRuleButton}
            >
              Add Rule
            </Button>
            
            {automationRules.length === 0 ? (
              <Text style={styles.noRules}>No automation rules configured</Text>
            ) : (
              automationRules.map((rule) => (
                <View key={rule.id} style={styles.ruleItem}>
                  <View style={styles.ruleHeader}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Switch
                      value={rule.isActive}
                      onValueChange={() => toggleAutomationRule(rule.id)}
                    />
                  </View>
                  <Text style={styles.ruleDescription}>{rule.description}</Text>
                  <Button
                    mode="text"
                    onPress={() => handleDeleteRule(rule.id)}
                    textColor="#F44336"
                    compact
                  >
                    Delete
                  </Button>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Account Actions</Text>
            <Button
              mode="outlined"
              onPress={signOut}
              style={styles.signOutButton}
              buttonColor="#F44336"
              textColor="#F44336"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
  },
  connectButton: {
    marginTop: 10,
  },
  addRuleButton: {
    marginBottom: 20,
  },
  noRules: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  ruleItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  signOutButton: {
    marginTop: 10,
  },
});