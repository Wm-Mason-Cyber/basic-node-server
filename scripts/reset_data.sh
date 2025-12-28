#!/bin/bash

# Remove messages.json
if [ -f data/messages.json ]; then
    echo "Removing data/messages.json..."
    rm data/messages.json
else
    echo "data/messages.json not found, skipping removal."
fi

# Remove SQLite database
if [ -f data/node_demo.db ]; then
    echo "Removing data/node_demo.db..."
    rm data/node_demo.db
else
    echo "data/node_demo.db not found, skipping removal."
fi

echo "Data reset complete."