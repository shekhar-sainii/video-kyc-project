#!/bin/bash

# setup-https.sh - Helper script to generate local SSL certificates for Vite

CERT_DIR=".cert"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

mkdir -p "$CERT_DIR"

if command -v mkcert >/dev/null 2>&1; then
    echo "Using mkcert to generate trusted local certificates..."
    mkcert -install
    mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" localhost 127.0.0.1 ::1
    echo "Certificates generated successfully with mkcert."
else
    echo "mkcert not found. Falling back to openssl (will show 'Not Secure' warning in browser)."
    echo "To fix 'Not Secure', please install mkcert: sudo apt install mkcert"
    
    openssl req -x509 -newkey rsa:2048 -keyout "$KEY_FILE" -out "$CERT_FILE" -sha256 -days 365 -nodes \
      -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

    echo "Self-signed certificates generated using openssl."
fi

echo "Vite is configured to use these certificates in vite.config.js."
