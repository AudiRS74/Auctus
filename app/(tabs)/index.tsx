import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { trades, mt5Config, indicators } = useTrading();

  const activeTrades = trades.filter(trade => trade.status === 'EXECUTED');
  const totalProfit = activeTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {user?.name}</Text>
          <Text style={styles.subtitle}>Trading Dashboard</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Account Overview</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Total Trades:</Text>
              <Text style={styles.value}>{trades.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Active Trades:</Text>
              <Text style={styles.value}>{activeTrades.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total P&L:</Text>
              <Text style={[styles.value, { color: totalProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                ${totalProfit.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>MT5 Connection</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, { color: mt5Config.connected ? '#4CAF50' : '#F44336' }]}>
                {mt5Config.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            {mt5Config.connected && (
              <View style={styles.row}>
                <Text style={styles.label}>Server:</Text>
                <Text style={styles.value}>{mt5Config.server}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Market Indicators</Text>
            <View style={styles.row}>
              <Text style={styles.label}>RSI:</Text>
              <Text style={styles.value}>{indicators.rsi.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Moving Average:</Text>
              <Text style={styles.value}>{indicators.movingAverage.toFixed(4)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>MACD Signal:</Text>
              <Text style={styles.value}>{indicators.macd.signal.toFixed(4)}</Text>
            </View>
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={signOut} style={styles.signOutButton}>
          Sign Out
        </Button>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
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
  row: {
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
  signOutButton: {
    margin: 20,
    marginBottom: 40,
  },
});