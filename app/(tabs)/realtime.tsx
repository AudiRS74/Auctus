import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTrading } from '../../hooks/useTrading';

export default function RealTimeScreen() {
  const { 
    realTimeData, 
    mt5Config,
    refreshAccountData,
    getMarketData,
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'account' | 'positions' | 'market'>('account');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountData();
    } catch (error) {
      console.error('Real-time refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (mt5Config.connected) {
        refreshAccountData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [mt5Config.connected]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return Number(value).toFixed(decimals);
  };

  const AccountTab = () => (
    <View style={styles.tabContent}>
      {realTimeData.accountInfo ? (
        <>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="account-balance-wallet" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Balance</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(realTimeData.accountInfo.balance)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="trending-up" size={20} color={Colors.bullish} />
              <Text style={styles.infoLabel}>Equity</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(realTimeData.accountInfo.equity)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="account-balance" size={20} color={Colors.accent} />
              <Text style={styles.infoLabel}>Free Margin</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(realTimeData.accountInfo.freeMargin)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="settings" size={20} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Leverage</Text>
              <Text style={styles.infoValue}>1:{realTimeData.accountInfo.leverage}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Name:</Text>
              <Text style={styles.detailValue}>{realTimeData.accountInfo.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Company:</Text>
              <Text style={styles.detailValue}>{realTimeData.accountInfo.company}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Server:</Text>
              <Text style={styles.detailValue}>{realTimeData.accountInfo.server}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency:</Text>
              <Text style={styles.detailValue}>{realTimeData.accountInfo.currency}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="account-circle" size={64} color={Colors.textMuted} />
          <Text style={styles.noDataTitle}>No Account Data</Text>
          <Text style={styles.noDataMessage}>
            {mt5Config.connected 
              ? 'Loading account information...' 
              : 'Connect to MT5 to view account details'
            }
          </Text>
        </View>
      )}
    </View>
  );

  const PositionsTab = () => (
    <View style={styles.tabContent}>
      {realTimeData.positions.length > 0 ? (
        <View style={styles.positionsList}>
          {realTimeData.positions.map((position) => (
            <View key={position.ticket} style={styles.positionCard}>
              <View style={styles.positionHeader}>
                <Text style={styles.positionSymbol}>{position.symbol}</Text>
                <Text style={[
                  styles.positionType,
                  { color: position.type === 'BUY' ? Colors.bullish : Colors.bearish }
                ]}>
                  {position.type}
                </Text>
              </View>
              
              <View style={styles.positionDetails}>
                <View style={styles.positionDetail}>
                  <Text style={styles.positionDetailLabel}>Volume:</Text>
                  <Text style={styles.positionDetailValue}>
                    {formatNumber(position.volume)} lots
                  </Text>
                </View>
                <View style={styles.positionDetail}>
                  <Text style={styles.positionDetailLabel}>Price:</Text>
                  <Text style={styles.positionDetailValue}>
                    {formatNumber(position.price, 5)}
                  </Text>
                </View>
                <View style={styles.positionDetail}>
                  <Text style={styles.positionDetailLabel}>Profit:</Text>
                  <Text style={[
                    styles.positionDetailValue,
                    { color: position.profit >= 0 ? Colors.bullish : Colors.bearish }
                  ]}>
                    {formatCurrency(position.profit)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.positionTicket}>#{position.ticket}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="trending-flat" size={64} color={Colors.textMuted} />
          <Text style={styles.noDataTitle}>No Open Positions</Text>
          <Text style={styles.noDataMessage}>
            Your open positions will appear here when you place trades
          </Text>
        </View>
      )}
    </View>
  );

  const MarketTab = () => (
    <View style={styles.tabContent}>
      {Object.keys(realTimeData.symbols).length > 0 ? (
        <View style={styles.marketList}>
          {Object.entries(realTimeData.symbols).map(([symbol, data]) => (
            <View key={symbol} style={styles.marketCard}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketSymbol}>{symbol}</Text>
                <Text style={styles.marketSpread}>
                  {data.spread.toFixed(1)} pips
                </Text>
              </View>
              
              <View style={styles.marketPrices}>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>BID</Text>
                  <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                    {formatNumber(data.bid, symbol.includes('JPY') ? 3 : 5)}
                  </Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>ASK</Text>
                  <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                    {formatNumber(data.ask, symbol.includes('JPY') ? 3 : 5)}
                  </Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>LAST</Text>
                  <Text style={styles.priceValue}>
                    {formatNumber(data.last, symbol.includes('JPY') ? 3 : 5)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.marketDetails}>
                <Text style={styles.marketDetailText}>
                  Vol: {(data.volume / 1000).toFixed(0)}K
                </Text>
                <Text style={styles.marketDetailText}>
                  Digits: {data.digits}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="show-chart" size={64} color={Colors.textMuted} />
          <Text style={styles.noDataTitle}>No Market Data</Text>
          <Text style={styles.noDataMessage}>
            Connect to MT5 to view real-time market prices
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Real-time Data</Text>
        <View style={styles.headerStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: mt5Config.connected ? Colors.bullish : Colors.bearish }
          ]} />
          <Text style={styles.statusText}>
            {mt5Config.connected ? 'Live' : 'Demo'}
          </Text>
          {realTimeData.lastUpdate && (
            <Text style={styles.lastUpdate}>
              {realTimeData.lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'account' && styles.activeTab]}
          onPress={() => setSelectedTab('account')}
        >
          <MaterialIcons 
            name="account-circle" 
            size={20} 
            color={selectedTab === 'account' ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'account' && styles.activeTabText
          ]}>
            Account
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'positions' && styles.activeTab]}
          onPress={() => setSelectedTab('positions')}
        >
          <MaterialIcons 
            name="trending-up" 
            size={20} 
            color={selectedTab === 'positions' ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'positions' && styles.activeTabText
          ]}>
            Positions
          </Text>
          {realTimeData.positions.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{realTimeData.positions.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'market' && styles.activeTab]}
          onPress={() => setSelectedTab('market')}
        >
          <MaterialIcons 
            name="show-chart" 
            size={20} 
            color={selectedTab === 'market' ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'market' && styles.activeTabText
          ]}>
            Market
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {selectedTab === 'account' && <AccountTab />}
        {selectedTab === 'positions' && <PositionsTab />}
        {selectedTab === 'market' && <MarketTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  lastUpdate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  positionsList: {
    gap: 16,
  },
  positionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  positionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  positionDetail: {
    alignItems: 'center',
  },
  positionDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  positionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  positionTicket: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  marketList: {
    gap: 12,
  },
  marketCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  marketSpread: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  marketPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  marketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketDetailText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});