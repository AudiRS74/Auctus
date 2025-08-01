import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, DataTable, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function RealTime() {
  const { 
    realTimeData, 
    mt5Config, 
    selectedSymbol, 
    setSelectedSymbol, 
    refreshAccountData,
    connectionError,
    trades 
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'prices' | 'positions' | 'account'>('prices');

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

  const onRefresh = async () => {
    if (!mt5Config.connected) {
      showAlert('Not Connected', 'Please connect to MT5 in Settings to view real-time data.');
      return;
    }

    setRefreshing(true);
    try {
      await refreshAccountData();
    } catch (error) {
      console.error('Refresh failed:', error);
      showAlert('Refresh Failed', 'Failed to update real-time data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 5 seconds when connected
  useEffect(() => {
    if (mt5Config.connected) {
      const interval = setInterval(() => {
        refreshAccountData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mt5Config.connected]);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP'];

  const TabButton = ({ id, title, active, onPress, icon }: { 
    id: string; 
    title: string; 
    active: boolean; 
    onPress: () => void; 
    icon: string;
  }) => (
    <Button
      mode={active ? "contained" : "outlined"}
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
      labelStyle={[styles.tabButtonLabel, active && styles.activeTabButtonLabel]}
      buttonColor={active ? Colors.primary : 'transparent'}
      textColor={active ? Colors.background : Colors.textSecondary}
      icon={icon}
      compact
    >
      {title}
    </Button>
  );

  const formatPrice = (price: number, digits: number = 5) => {
    return price.toFixed(digits);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getPriceChange = (symbol: string) => {
    // Simulate price change calculation
    const change = (Math.random() - 0.5) * 0.02;
    return {
      value: change,
      percentage: (change / 1.2) * 100,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Real-Time Data</Text>
            <Text style={styles.subtitle}>Live market feeds & positions</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.connectionStatus, { 
              backgroundColor: mt5Config.connected ? Colors.bullish + '20' : Colors.bearish + '20' 
            }]}>
              <MaterialIcons 
                name={mt5Config.connected ? "fiber-manual-record" : "fiber-manual-record"} 
                size={12} 
                color={mt5Config.connected ? Colors.bullish : Colors.bearish} 
              />
              <Text style={[styles.connectionText, { 
                color: mt5Config.connected ? Colors.bullish : Colors.bearish 
              }]}>
                {mt5Config.connected ? 'LIVE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          <TabButton
            id="prices"
            title="Live Prices"
            active={selectedTab === 'prices'}
            onPress={() => setSelectedTab('prices')}
            icon="trending-up"
          />
          <TabButton
            id="positions"
            title="Positions"
            active={selectedTab === 'positions'}
            onPress={() => setSelectedTab('positions')}
            icon="donut-large"
          />
          <TabButton
            id="account"
            title="Account"
            active={selectedTab === 'account'}
            onPress={() => setSelectedTab('account')}
            icon="account-balance"
          />
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Connection Error */}
        {connectionError && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <View style={styles.errorHeader}>
                <MaterialIcons name="error" size={24} color={Colors.bearish} />
                <Text style={styles.errorTitle}>Connection Issue</Text>
              </View>
              <Text style={styles.errorText}>{connectionError}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Offline Notice */}
        {!mt5Config.connected && (
          <Card style={styles.offlineCard}>
            <Card.Content style={styles.offlineContent}>
              <View style={styles.offlineHeader}>
                <MaterialIcons name="cloud-off" size={24} color={Colors.textMuted} />
                <Text style={styles.offlineTitle}>Offline Mode</Text>
              </View>
              <Text style={styles.offlineText}>
                Connect to MT5 in Settings to view real-time market data and positions.
              </Text>
              <Button
                mode="outlined"
                onPress={() => showAlert('Settings', 'Navigate to Settings tab to connect to MT5 demo server.')}
                style={styles.offlineButton}
                textColor={Colors.primary}
                icon="settings"
                compact
              >
                Go to Settings
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Live Prices Tab */}
        {selectedTab === 'prices' && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Live Market Prices</Text>
                <View style={styles.lastUpdateContainer}>
                  <MaterialIcons name="access-time" size={16} color={Colors.textMuted} />
                  <Text style={styles.lastUpdateText}>
                    {realTimeData.lastUpdate ? formatTime(realTimeData.lastUpdate) : '--:--:--'}
                  </Text>
                </View>
              </View>

              {mt5Config.connected ? (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title textStyle={styles.tableHeader}>Symbol</DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeader} numeric>Bid</DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeader} numeric>Ask</DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeader} numeric>Spread</DataTable.Title>
                  </DataTable.Header>

                  {symbols.map((symbol) => {
                    const symbolData = realTimeData.symbols[symbol];
                    const change = getPriceChange(symbol);
                    
                    return (
                      <DataTable.Row 
                        key={symbol}
                        onPress={() => setSelectedSymbol(symbol)}
                        style={selectedSymbol === symbol ? styles.selectedRow : undefined}
                      >
                        <DataTable.Cell>
                          <View style={styles.symbolCell}>
                            <Text style={[styles.symbolText, selectedSymbol === symbol && styles.selectedSymbolText]}>
                              {symbol}
                            </Text>
                            <MaterialIcons 
                              name={change.value >= 0 ? "trending-up" : "trending-down"}
                              size={16} 
                              color={change.value >= 0 ? Colors.bullish : Colors.bearish}
                            />
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={[styles.priceText, { color: Colors.bearish }]}>
                            {symbolData ? formatPrice(symbolData.bid) : '--'}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={[styles.priceText, { color: Colors.bullish }]}>
                            {symbolData ? formatPrice(symbolData.ask) : '--'}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={styles.spreadText}>
                            {symbolData ? (symbolData.spread * 100000).toFixed(1) : '--'}
                          </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })}
                </DataTable>
              ) : (
                <View style={styles.noDataState}>
                  <MaterialIcons name="cloud-off" size={48} color={Colors.textMuted} />
                  <Text style={styles.noDataText}>No live data available</Text>
                  <Text style={styles.noDataSubtext}>Connect to MT5 to view real-time prices</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Positions Tab */}
        {selectedTab === 'positions' && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Open Positions</Text>
                <Text style={styles.positionCount}>
                  {mt5Config.connected ? realTimeData.positions.length : trades.filter(t => t.status === 'EXECUTED').length} positions
                </Text>
              </View>

              {mt5Config.connected ? (
                realTimeData.positions.length > 0 ? (
                  realTimeData.positions.map((position) => (
                    <View key={position.ticket} style={styles.positionCard}>
                      <View style={styles.positionHeader}>
                        <View style={styles.positionSymbol}>
                          <Text style={styles.positionSymbolText}>{position.symbol}</Text>
                          <Chip 
                            style={[styles.positionTypeChip, { 
                              backgroundColor: position.type === 'BUY' ? Colors.bullish + '20' : Colors.bearish + '20' 
                            }]}
                            textStyle={[styles.positionTypeText, { 
                              color: position.type === 'BUY' ? Colors.bullish : Colors.bearish 
                            }]}
                          >
                            {position.type}
                          </Chip>
                        </View>
                        <Text style={[styles.positionProfit, { 
                          color: position.profit >= 0 ? Colors.bullish : Colors.bearish 
                        }]}>
                          {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.positionDetails}>
                        <View style={styles.positionDetail}>
                          <Text style={styles.positionDetailLabel}>Volume</Text>
                          <Text style={styles.positionDetailValue}>{position.volume}</Text>
                        </View>
                        <View style={styles.positionDetail}>
                          <Text style={styles.positionDetailLabel}>Open Price</Text>
                          <Text style={styles.positionDetailValue}>{formatPrice(position.openPrice)}</Text>
                        </View>
                        <View style={styles.positionDetail}>
                          <Text style={styles.positionDetailLabel}>Current</Text>
                          <Text style={styles.positionDetailValue}>{formatPrice(position.currentPrice)}</Text>
                        </View>
                        <View style={styles.positionDetail}>
                          <Text style={styles.positionDetailLabel}>Ticket</Text>
                          <Text style={styles.positionDetailValue}>#{position.ticket}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noDataState}>
                    <MaterialIcons name="donut-large" size={48} color={Colors.textMuted} />
                    <Text style={styles.noDataText}>No open positions</Text>
                    <Text style={styles.noDataSubtext}>Execute trades to see positions here</Text>
                  </View>
                )
              ) : (
                <View style={styles.noDataState}>
                  <MaterialIcons name="cloud-off" size={48} color={Colors.textMuted} />
                  <Text style={styles.noDataText}>Offline mode</Text>
                  <Text style={styles.noDataSubtext}>Connect to MT5 to view live positions</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Account Tab */}
        {selectedTab === 'account' && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Account Information</Text>
                <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
              </View>

              {mt5Config.connected && realTimeData.accountInfo ? (
                <View style={styles.accountContainer}>
                  <View style={styles.accountMainInfo}>
                    <Text style={styles.accountBalance}>
                      {realTimeData.accountInfo.currency} {realTimeData.accountInfo.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.accountBalanceLabel}>Account Balance</Text>
                  </View>

                  <View style={styles.accountGrid}>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Equity</Text>
                      <Text style={styles.accountItemValue}>
                        {realTimeData.accountInfo.currency} {realTimeData.accountInfo.equity.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Free Margin</Text>
                      <Text style={styles.accountItemValue}>
                        {realTimeData.accountInfo.currency} {realTimeData.accountInfo.freeMargin.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Margin</Text>
                      <Text style={styles.accountItemValue}>
                        {realTimeData.accountInfo.currency} {realTimeData.accountInfo.margin.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Margin Level</Text>
                      <Text style={[styles.accountItemValue, { 
                        color: realTimeData.accountInfo.marginLevel > 100 ? Colors.bullish : Colors.bearish 
                      }]}>
                        {realTimeData.accountInfo.marginLevel.toFixed(2)}%
                      </Text>
                    </View>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Leverage</Text>
                      <Text style={styles.accountItemValue}>1:{realTimeData.accountInfo.leverage}</Text>
                    </View>
                    <View style={styles.accountItem}>
                      <Text style={styles.accountItemLabel}>Company</Text>
                      <Text style={styles.accountItemValue}>{realTimeData.accountInfo.company}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataState}>
                  <MaterialIcons name="account-balance" size={48} color={Colors.textMuted} />
                  <Text style={styles.noDataText}>No account data</Text>
                  <Text style={styles.noDataSubtext}>Connect to MT5 to view account information</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
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
  headerRight: {
    alignItems: 'flex-end',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectionText: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    marginRight: 8,
    borderColor: Colors.border,
  },
  activeTabButton: {
    elevation: 2,
  },
  tabButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabButtonLabel: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorCard: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.bearish + '10',
    borderWidth: 1,
    borderColor: Colors.bearish + '30',
  },
  errorContent: {
    paddingVertical: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    ...Typography.body1,
    color: Colors.bearish,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  offlineCard: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.textMuted + '10',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offlineContent: {
    paddingVertical: 16,
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineTitle: {
    ...Typography.body1,
    color: Colors.textMuted,
    fontWeight: '600',
    marginLeft: 8,
  },
  offlineText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  offlineButton: {
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  card: {
    marginTop: 20,
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
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdateText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  positionCount: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  tableHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectedRow: {
    backgroundColor: Colors.primary + '10',
  },
  symbolCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolText: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  selectedSymbolText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  priceText: {
    ...Typography.body2,
    ...Typography.number,
    fontWeight: '500',
  },
  spreadText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    ...Typography.number,
  },
  noDataState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 16,
  },
  noDataSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  positionCard: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionSymbolText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  positionTypeChip: {
    height: 24,
  },
  positionTypeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  positionProfit: {
    ...Typography.h6,
    ...Typography.number,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  positionDetail: {
    flex: 1,
    minWidth: '22%',
  },
  positionDetailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  positionDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    ...Typography.number,
  },
  accountContainer: {
    gap: 20,
  },
  accountMainInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  accountBalance: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    ...Typography.number,
  },
  accountBalanceLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  accountItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
  },
  accountItemLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  accountItemValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    ...Typography.number,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: '500',
  },
});