import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTrading } from '@/hooks/useTrading';

export default function DashboardPage() {
  const { user } = useAuth();
  const { trades, mt5Config, indicators } = useTrading();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const openTrades = trades.filter(trade => trade.status === 'EXECUTED').length;
  const winRate = trades.length > 0 ? (trades.filter(trade => (trade.profit || 0) > 0).length / trades.length) * 100 : 0;

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
            <Text style={styles.subtitle}>Trading Dashboard</Text>
          </View>
          <View style={[styles.connectionStatus, mt5Config.connected && styles.connected]}>
            <MaterialIcons
              name={mt5Config.connected ? "cloud-done" : "cloud-off"}
              size={16}
              color={mt5Config.connected ? "#10B981" : "#EF4444"}
            />
            <Text style={[styles.statusText, mt5Config.connected && styles.connectedText]}>
              {mt5Config.connected ? 'MT5 Connected' : 'MT5 Offline'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statValue}>${totalProfit.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total P&L</Text>
                <View style={styles.statIcon}>
                  <MaterialIcons
                    name={totalProfit >= 0 ? "trending-up" : "trending-down"}
                    size={24}
                    color={totalProfit >= 0 ? "#10B981" : "#EF4444"}
                  />
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statValue}>{openTrades}</Text>
                <Text style={styles.statLabel}>Open Trades</Text>
                <View style={styles.statIcon}>
                  <MaterialIcons name="swap-horiz" size={24} color="#00C896" />
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statValue}>{winRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
                <View style={styles.statIcon}>
                  <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statValue}>{indicators.rsi.toFixed(1)}</Text>
                <Text style={styles.statLabel}>RSI</Text>
                <View style={styles.statIcon}>
                  <MaterialIcons name="timeline" size={24} color="#8B5CF6" />
                </View>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.recentTradesCard}>
            <Card.Title
              title="Recent Trades"
              titleStyle={styles.cardTitle}
              right={() => (
                <MaterialIcons name="more-vert" size={24} color="#94A3B8" />
              )}
            />
            <Card.Content>
              {trades.slice(0, 5).map((trade) => (
                <View key={trade.id} style={styles.tradeItem}>
                  <View style={styles.tradeInfo}>
                    <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                    <Text style={styles.tradeType}>{trade.type}</Text>
                  </View>
                  <View style={styles.tradeDetails}>
                    <Text style={styles.tradeQuantity}>{trade.quantity}</Text>
                    <Text style={[
                      styles.tradeProfit,
                      { color: (trade.profit || 0) >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {trade.profit ? `$${trade.profit.toFixed(2)}` : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))}
              {trades.length === 0 && (
                <Text style={styles.noTrades}>No trades yet. Start trading to see your history.</Text>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {}} // TODO: Navigate to trading screen
        />
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  connected: {
    borderColor: '#10B981',
  },
  statusText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  connectedText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  recentTradesCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tradeInfo: {
    flex: 1,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  tradeType: {
    fontSize: 14,
    color: '#94A3B8',
  },
  tradeDetails: {
    alignItems: 'flex-end',
  },
  tradeQuantity: {
    fontSize: 14,
    color: '#94A3B8',
  },
  tradeProfit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTrades: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#00C896',
  },
});