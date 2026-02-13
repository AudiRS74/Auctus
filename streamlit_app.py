import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime, timedelta
import time
import random

# Page configuration
st.set_page_config(
    page_title="TradingPro Streamlit",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize session state
if 'initialized' not in st.session_state:
    st.session_state.initialized = True
    st.session_state.trades = []
    st.session_state.mt5_connected = False
    st.session_state.selected_symbol = 'EURUSD'
    st.session_state.balance = 10000.00
    st.session_state.equity = 10000.00
    st.session_state.automation_running = False
    st.session_state.strategies = [
        {
            "id": "1",
            "name": "RSI Mean Reversion",
            "active": True,
            "indicator": "RSI",
            "symbol": "EURUSD",
            "trade_type": "BOTH",
            "size": 0.1
        }
    ]
    st.session_state.market_data = {
        'EURUSD': 1.0850,
        'GBPUSD': 1.2650,
        'USDJPY': 149.50,
        'AUDUSD': 0.6750,
        'USDCAD': 1.3650
    }

# Simulation update
def update_market_data():
    for symbol in st.session_state.market_data:
        variation = (random.random() - 0.5) * 0.001
        st.session_state.market_data[symbol] += variation
    st.session_state.equity = st.session_state.balance + (random.random() - 0.5) * 200

# Sidebar Navigation
st.sidebar.title("TradingPro")
st.sidebar.markdown("---")
page = st.sidebar.radio(
    "Navigation",
    ["Dashboard", "Charts", "Trading", "Automation", "Real-time", "Settings"]
)

# Connection Status in Sidebar
st.sidebar.markdown("---")
st.sidebar.subheader("Connection Status")
if st.session_state.mt5_connected:
    st.sidebar.success("MT5 Connected")
    if st.sidebar.button("Disconnect"):
        st.session_state.mt5_connected = False
        st.rerun()
else:
    st.sidebar.warning("Demo Mode")
    if st.sidebar.button("Connect MT5"):
        st.session_state.mt5_connected = True
        st.rerun()

# --- Pages ---

if page == "Dashboard":
    st.title("Trading Dashboard")

    # Summary Cards
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Balance", f"${st.session_state.balance:,.2f}")
    col2.metric("Equity", f"${st.session_state.equity:,.2f}", f"{(st.session_state.equity - st.session_state.balance):.2f}")
    col3.metric("Active Trades", len([t for t in st.session_state.trades if t['status'] == 'OPEN']))
    col4.metric("Profit/Loss", f"${sum([t.get('profit', 0) for t in st.session_state.trades]):.2f}")

    # Market Overview
    st.subheader("Market Overview")
    df_market = pd.DataFrame([
        {"Symbol": s, "Price": f"{p:.5f}", "Change": f"{(random.random()-0.5)*0.1:+.2f}%"}
        for s, p in st.session_state.market_data.items()
    ])
    st.table(df_market)

    # Recent Trades
    st.subheader("Recent Trades")
    if st.session_state.trades:
        st.dataframe(pd.DataFrame(st.session_state.trades))
    else:
        st.info("No recent trades")

elif page == "Charts":
    st.title("Market Charts")

    col1, col2 = st.columns([1, 4])
    with col1:
        symbol = st.selectbox("Symbol", list(st.session_state.market_data.keys()))
        timeframe = st.selectbox("Timeframe", ["1M", "5M", "15M", "1H", "4H", "1D"])
        chart_type = st.radio("Type", ["Candlestick", "Line"])

    # Generate mock chart data
    now = datetime.now()
    dates = [now - timedelta(hours=i) for i in range(50, 0, -1)]
    base_price = st.session_state.market_data[symbol]

    prices = [base_price]
    for _ in range(49):
        prices.append(prices[-1] + (random.random() - 0.5) * 0.005)

    opens = [p + (random.random() - 0.5) * 0.002 for p in prices]
    closes = [p + (random.random() - 0.5) * 0.002 for p in prices]
    highs = [max(o, c) + random.random() * 0.001 for o, c in zip(opens, closes)]
    lows = [min(o, c) - random.random() * 0.001 for o, c in zip(opens, closes)]

    fig = go.Figure()
    if chart_type == "Candlestick":
        fig.add_trace(go.Candlestick(
            x=dates, open=opens, high=highs, low=lows, close=closes,
            name=symbol
        ))
    else:
        fig.add_trace(go.Scatter(x=dates, y=closes, mode='lines', name=symbol))

    fig.update_layout(
        title=f"{symbol} {timeframe} Chart",
        xaxis_title="Time",
        yaxis_title="Price",
        template="plotly_dark",
        height=600
    )
    st.plotly_chart(fig, use_container_width=True)

elif page == "Trading":
    st.title("Execution Terminal")

    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("Order Configuration")
        symbol = st.selectbox("Select Instrument", list(st.session_state.market_data.keys()), key="trade_symbol")

        c1, c2 = st.columns(2)
        trade_type = c1.radio("Action", ["BUY", "SELL"])
        lot_size = c2.number_input("Lot Size", min_value=0.01, max_value=10.0, value=0.1, step=0.01)

        c3, c4 = st.columns(2)
        stop_loss = c3.text_input("Stop Loss (Optional)")
        take_profit = c4.text_input("Take Profit (Optional)")

        if st.button(f"Execute {trade_type} {symbol}", use_container_width=True, type="primary"):
            new_trade = {
                "id": str(int(time.time())),
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "symbol": symbol,
                "type": trade_type,
                "size": lot_size,
                "price": st.session_state.market_data[symbol],
                "status": "OPEN",
                "profit": 0.0
            }
            st.session_state.trades.insert(0, new_trade)
            st.success(f"Order Executed: {trade_type} {lot_size} {symbol}")
            st.rerun()

    with col2:
        st.subheader("Current Price")
        price = st.session_state.market_data[st.session_state.trade_symbol]
        st.metric(st.session_state.trade_symbol, f"{price:.5f}", f"{(random.random()-0.5)*0.01:+.5f}")

        st.markdown("---")
        st.subheader("Position Value")
        est_margin = lot_size * 100000 * price / 100 # 1:100 leverage
        st.write(f"Estimated Margin: ${est_margin:,.2f}")
        st.write(f"Account Free Margin: ${st.session_state.balance - est_margin:,.2f}")

elif page == "Automation":
    st.title("Algorithmic Trading")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Automation Status")
        if st.session_state.automation_running:
            st.success("Engine is Running")
            if st.button("Stop Automation"):
                st.session_state.automation_running = False
                st.rerun()
        else:
            st.info("Engine is Stopped")
            if st.button("Start Automation"):
                st.session_state.automation_running = True
                st.rerun()

        st.subheader("Active Strategies")
        for i, strat in enumerate(st.session_state.strategies):
            with st.expander(f"{strat['name']} ({strat['symbol']})"):
                st.write(f"Indicator: {strat['indicator']}")
                st.write(f"Type: {strat['trade_type']}")
                st.write(f"Lot Size: {strat['size']}")
                if st.button(f"Remove {strat['name']}", key=f"del_{i}"):
                    st.session_state.strategies.pop(i)
                    st.rerun()

    with col2:
        st.subheader("Create New Strategy")
        with st.form("new_strategy"):
            name = st.text_input("Strategy Name")
            sym = st.selectbox("Symbol", list(st.session_state.market_data.keys()))
            ind = st.selectbox("Indicator", ["RSI", "MACD", "MA", "Bollinger Bands"])
            tt = st.selectbox("Trade Type", ["BUY", "SELL", "BOTH"])
            sz = st.number_input("Position Size", 0.01, 1.0, 0.1)

            if st.form_submit_button("Add Strategy"):
                st.session_state.strategies.append({
                    "id": str(len(st.session_state.strategies) + 1),
                    "name": name if name else f"Strategy {len(st.session_state.strategies)+1}",
                    "active": True,
                    "indicator": ind,
                    "symbol": sym,
                    "trade_type": tt,
                    "size": sz
                })
                st.success("Strategy Added")
                st.rerun()

elif page == "Real-time":
    st.title("Real-time Data Stream")

    st.info("This view updates automatically with simulated market ticks.")

    placeholder = st.empty()

    # Run for a few iterations in this view for demo
    for _ in range(10):
        update_market_data()
        with placeholder.container():
            cols = st.columns(len(st.session_state.market_data))
            for i, (s, p) in enumerate(st.session_state.market_data.items()):
                cols[i].metric(s, f"{p:.5f}", f"{(random.random()-0.5)*0.001:+.5f}")

            st.subheader("Live Logs")
            st.code(f"""
[{datetime.now().strftime("%H:%M:%S")}] TICK Received: EURUSD {st.session_state.market_data['EURUSD']:.5f}
[{datetime.now().strftime("%H:%M:%S")}] TICK Received: GBPUSD {st.session_state.market_data['GBPUSD']:.5f}
[{datetime.now().strftime("%H:%M:%S")}] ENGINE: Scanning for signals...
[{datetime.now().strftime("%H:%M:%S")}] ENGINE: No signals detected.
            """)
        time.sleep(1)

elif page == "Settings":
    st.title("System Settings")

    st.subheader("Profile Settings")
    st.text_input("Display Name", "Demo User")
    st.text_input("Email", "demo@tradingpro.com")

    st.subheader("Trading Preferences")
    st.checkbox("One-click Trading", value=False)
    st.checkbox("Enable Notifications", value=True)
    st.slider("Default Leverage", 1, 500, 100)

    st.subheader("API Configuration")
    st.text_input("MT5 Server", "Demo-Server")
    st.text_input("Login ID", "12345678")
    st.text_input("Password", type="password")

    if st.button("Save Settings"):
        st.success("Settings saved successfully")

# Periodic market update (if not on Real-time page which has its own loop)
if page != "Real-time":
    update_market_data()
