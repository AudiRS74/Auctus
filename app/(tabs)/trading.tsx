
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTrading } from '../../hooks/useTrading';

export default function TradingScreen() {
  const { 
    selectedSymbol, 
    setSelectedSymbol, 
    executeTrade, 
    realTimeData,
    getMarketData,
    mt5Config 
  } = useTrading();
  
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [lotSize, setLotSize] = useState('0.1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const lotSizes = ['0.01', '0.1', '0.5', '1.0'];

  const handleExecuteTrade = async () => {
    const lots = parseFloat(lotSize);
    if (isNaN(lots) || lots <= 0) {
      Alert.alert('Error', 'Please enter a valid lot size');
      return;
    }

    try {
      setIsExecuting(true);
      await executeTrade(selectedSymbol, tradeType, lots);
      
      Alert.alert(
        'Trade Executed',
        `${tradeType} ${lots} lots of ${selectedSymbol} has been executed successfully.`,
        [{ text: 'OK', onPress: () => setShowOrderModal(false) }]
      );
    } catch (error) {
      Alert.alert(
        'Trade Failed', 
        error instanceof Error ? error.message : 'Failed to execute trade'
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const calculatePositionSize = () => {
    const lots = parseFloat(lotSize) || 0;
    return lots * 100000; // Standard forex lot size
  };

  const calculateMargin = () => {
    const marketData = getMarketData(selectedSymbol);
    if (!marketData || !realTimeData.accountInfo) return 0;
    
    const lots = parseFloat(lotSize) || 0;
    const leverage = realTimeData.accountInfo.leverage || 100;
    const price = marketData.price;
    
    return (lots * 100000 * price) / leverage;
  };

  const currentPrice = getMarketData(selectedSymbol);

  const OrderModal = () => (
    <Modal
      visible={showOrderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowOrderModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Place Order</Text>
            <TouchableOpacity 
              onPress={() => setShowOrderModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Symbol:</Text>
              <Text style={styles.orderSummaryValue}>{selectedSymbol}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Type:</Text>
              <Text style={[
                styles.orderSummaryValue,
                { color: tradeType === 'BUY' ? Colors.bullish : Colors.bearish }
              ]}>
                {tradeType}
              </Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Volume:</Text>
              <Text style={styles.orderSummaryValue}>{lotSize} lots</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Price:</Text>
              <Text style={styles.orderSummaryValue}>
                {currentPrice ? 
                  (tradeType === 'BUY' ? currentPrice.ask : currentPrice.bid).toFixed(5) :
                  'N/A'
                }
              </Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Margin:</Text>
              <Text style={styles.orderSummaryValue}>
                ${calculateMargin().toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: tradeType === 'BUY' ? Colors.bullish : Colors.bearish },
              isExecuting && styles.disabledButton
            ]}
            onPress={handleExecuteTrade}
            disabled={isExecuting}
          >
            <Text style={styles.confirmButtonText}>
              {isExecuting ? 'Executing...' : `${tradeType} ${selectedSymbol}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trading</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot,
              { backgroundColor: mt5Config.connected ? Colors.bullish : Colors.bearish }
            ]} />
            <Text style={styles.statusText}>
              {mt5Config.connected ? 'Connected' : 'Demo Mode'}
            </Text>
          </View>
        </View>

        {/* Symbol Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symbol</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {symbols.map((symbol) => (
              <TouchableOpacity
                key={symbol}
                style={[
                  styles.symbolButton,
                  selectedSymbol === symbol && styles.symbolButtonActive
                ]}
                onPress={() => setSelectedSymbol(symbol)}
              >
                <Text style={[
                  styles.symbolButtonText,
                  selectedSymbol === symbol && styles.symbolButtonTextActive
                ]}>
                  {symbol}
                </Text>
                {getMarketData(symbol) && (
                  <Text style={[
                    styles.symbolPrice,
                    selectedSymbol === symbol && styles.symbolPriceActive
                  ]}>
                    {getMarketData(symbol)!.price.toFixed(5)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Current Price Display */}
        {currentPrice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Price</Text>
            <View style={styles.priceDisplay}>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>BID</Text>
                <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                  {currentPrice.bid ? currentPrice.bid.toFixed(5) : currentPrice.price.toFixed(5)}
                </Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>ASK</Text>
                <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                  {currentPrice.ask ? currentPrice.ask.toFixed(5) : (currentPrice.price + 0.00015).toFixed(5)}
                </Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>SPREAD</Text>
                <Text style={styles.priceValue}>
                  {currentPrice.ask ? 
                    ((currentPrice.ask - (currentPrice.bid || currentPrice.price)) * 100000).toFixed(1) :
                    '1.5'
                  } pips
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Trade Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.tradeTypeSelector}>
            <TouchableOpacity
              style={[
                styles.tradeTypeButton,
                tradeType === 'BUY' && styles.buyButtonActive
              ]}
              onPress={() => setTradeType('BUY')}
            >
              <MaterialIcons 
                name="trending-up" 
                size={20} 
                color={tradeType === 'BUY' ? Colors.textPrimary : Colors.bullish} 
              />
              <Text style={[
                styles.tradeTypeText,
                { color: tradeType === 'BUY' ? Colors.textPrimary : Colors.bullish }
              ]}>
                BUY
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tradeTypeButton,
                tradeType === 'SELL' && styles.sellButtonActive
              ]}
              onPress={() => setTradeType('SELL')}
            >
              <MaterialIcons 
                name="trending-down" 
                size={20} 
                color={tradeType === 'SELL' ? Colors.textPrimary : Colors.bearish} 
              />
              <Text style={[
                styles.tradeTypeText,
                { color: tradeType === 'SELL' ? Colors.textPrimary : Colors.bearish }
              ]}>
                SELL
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lot Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume (Lots)</Text>
          <View style={styles.lotSizeContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {lotSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.lotSizeButton,
                    lotSize === size && styles.lotSizeButtonActive
                  ]}
                  onPress={() => setLotSize(size)}
                >
                  <Text style={[
                    styles.lotSizeButtonText,
                    lotSize === size && styles.lotSizeButtonTextActive
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.lotSizeInput}
              value={lotSize}
              onChangeText={setLotSize}
              placeholder="Custom"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <Text style={styles.positionInfo}>
            Position Size: ${calculatePositionSize().toLocaleString()}
          </Text>
        </View>

        {/* Risk Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Management</Text>
          <View style={styles.riskInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stop Loss</Text>
              <TextInput
                style={styles.riskInput}
                value={stopLoss}
                onChangeText={setStopLoss}
                placeholder="Optional"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Take Profit</Text>
              <TextInput
                style={styles.riskInput}
                value={takeProfit}
                onChangeText={setTakeProfit}
                placeholder="Optional"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Account Info */}
        {realTimeData.accountInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.accountInfo}>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Balance:</Text>
                <Text style={styles.accountValue}>
                  ${realTimeData.accountInfo.balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Free Margin:</Text>
                <Text style={styles.accountValue}>
                  ${realTimeData.accountInfo.freeMargin.toFixed(2)}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Required Margin:</Text>
                <Text style={styles.accountValue}>
                  ${calculateMargin().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Execute Trade Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.executeButton,
              { backgroundColor: tradeType === 'BUY' ? Colors.bullish : Colors.bearish }
            ]}
            onPress={() => setShowOrderModal(true)}
          >
            <MaterialIcons 
              name={tradeType === 'BUY' ? 'trending-up' : 'trending-down'} 
              size={24} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.executeButtonText}>
              {tradeType} {selectedSymbol}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <OrderModal />
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
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  horizontalScroll: {
    flexGrow: 0,
  },
  symbolButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 80,
  },
  symbolButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symbolButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  symbolButtonTextActive: {
    color: Colors.textPrimary,
  },
  symbolPrice: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  symbolPriceActive: {
    color: Colors.textSecondary,
  },
  priceDisplay: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  tradeTypeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  tradeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  buyButtonActive: {
    backgroundColor: Colors.bullish,
    borderColor: Colors.bullish,
  },
  sellButtonActive: {
    backgroundColor: Colors.bearish,
    borderColor: Colors.bearish,
  },
  tradeTypeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  lotSizeContainer: {
    gap: 12,
  },
  lotSizeButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lotSizeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  lotSizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  lotSizeButtonTextActive: {
    color: Colors.textPrimary,
  },
  lotSizeInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  positionInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  riskInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  riskInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  accountInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  executeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  orderSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderSummaryTitle: {

    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  orderSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bottomPadding: {
    height: 20,
  },
});
