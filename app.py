import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from datetime import datetime
import time

# --- Page Config ---
st.set_page_config(
    page_title="DevOps Dashboard",
    page_icon="🚀",
    layout="wide"
)

# --- Error Handling Example ---
def get_data():
    try:
        # Simulating data source
        df = pd.DataFrame(
            np.random.randn(20, 3),
            columns=['CPU Usage', 'Memory Usage', 'Disk I/O']
        )
        return df
    except Exception as e:
        st.error(f"Failed to fetch data: {e}")
        return None

# --- Main App ---
def main():
    st.title("🚀 DevOps engineer - Streamlit Project")
    st.markdown("""
    This app is running inside a **Docker container** and is fully optimized for **Windows 11** and **GitHub Codespaces**.
    """)

    # Sidebar for interactivity
    st.sidebar.header("Control Panel")
    app_mode = st.sidebar.selectbox("Choose the view", ["System Monitor", "Interactive Plot", "Project Info"])

    refresh_rate = st.sidebar.slider("Refresh Rate (seconds)", 1, 10, 5)

    if app_mode == "System Monitor":
        st.header("实时系统监控 (Real-time System Monitor)")

        # Metrics row
        col1, col2, col3 = st.columns(3)
        col1.metric("Server Status", "Online", delta="Stable")
        col2.metric("Active Containers", "12", delta="+2")
        col3.metric("Uptime", "14d 2h", delta="-5m")

        # Data chart
        data = get_data()
        if data is not None:
            st.subheader("Infrastructure Health")
            st.line_chart(data)

            with st.expander("View Raw Data"):
                st.write(data)

    elif app_mode == "Interactive Plot":
        st.header("📊 Interactive Analytics")

        # Generator for random scatter plot
        n_points = st.sidebar.number_input("Number of points", 10, 1000, 100)

        chart_data = pd.DataFrame(
            np.random.randn(n_points, 2),
            columns=['X', 'Y']
        )

        fig = px.scatter(chart_data, x='X', y='Y', title="Dynamic Scatter Analysis")
        st.plotly_chart(fig, use_container_width=True)

    elif app_mode == "Project Info":
        st.header("📂 Deployment Configuration")
        st.info("Everything you see here is configured via DevOps best practices.")

        st.code("""
# Docker Deployment Summary
Image: streamlit-app:1.0.0
OS: Debian Bookworm (Python 3.11)
Port: 8501
Network: Bridge
        """, language="bash")

        if st.button("Simulate Deployment"):
            with st.status("Deploying to Production...", expanded=True) as status:
                st.write("Building image layers...")
                time.sleep(1)
                st.write("Pushing to Docker Hub...")
                time.sleep(1)
                st.write("Verifying healthchecks...")
                time.sleep(1)
                status.update(label="Deployment Complete!", state="complete", expanded=False)
            st.success("The app has been successfully deployed to the virtual registry.")

if __name__ == "__main__":
    main()
