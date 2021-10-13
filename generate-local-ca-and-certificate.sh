#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "Generating certificate for: $1"

mkcert -cert-file $DIR/proxy/certs/server.crt -key-file $DIR/proxy/certs/server.key $1
