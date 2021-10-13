#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Clear old builds
rm -f -R cltp.zip
rm -f -R cltp-*.zip
rm -f -R php-dist
rm -f -R ../php-dist

echo "Copy the php backend files"
cp -R . ../php-dist

echo "Copy the sql scripts"
cp -R ../sql ../php-dist

cd ../frontend

echo "Build frontend"
ng build

echo "Copy frontend"
cp -R dist/cltp/** ../php-dist

cd ../php

echo "Package all files together"
cp -R ../php-dist .

echo "Zip the packaged files"
zip -r cltp.zip php-dist/
