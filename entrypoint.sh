#!/bin/sh
set -e

# Generate runtime config file
echo "Generating runtime configuration..."

cat > public/config.js << EOF
window.__RUNTIME_CONFIG__ = {
  API_URL: "${NEXT_PUBLIC_API_URL:-http://localhost:8080}",
  MAPBOX_ACCESS_TOKEN: "${MAPBOX_ACCESS_TOKEN:-}"
};
EOF

echo "Runtime config generated:"
echo "  API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8080}"
echo "  MAPBOX_ACCESS_TOKEN: ${MAPBOX_ACCESS_TOKEN:+[hidden]}"

# Start the application with standalone server
exec node server.js
