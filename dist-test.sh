#!/bin/bash

# Start a simple HTTP server in the current directory and capture its PID
python3 -m http.server 8000 --directory dist &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 1

# Open index.html in the default web browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000/index.html
elif command -v open > /dev/null; then
    open http://localhost:8000/index.html
else
    echo "Please open http://localhost:8000/index.html in your browser."
fi

# Keep the script running until interrupted
trap "kill $SERVER_PID" EXIT

# Wait for the server to finish
wait $SERVER_PID