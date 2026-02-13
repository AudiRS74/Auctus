#!/bin/bash

# Kill any existing streamlit process
kill $(lsof -t -i :8501) 2>/dev/null || true

# Run streamlit
streamlit run streamlit_app.py --server.port 8501 --server.address 0.0.0.0
