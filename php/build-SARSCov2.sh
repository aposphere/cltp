#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


rm -f -R cltp-SARSCov2.zip
rm -f -R php-dist
rm -f -R ../php-dist

echo "Copy the php backend files"
cp -R . ../php-dist

cd ../frontend

echo "Build frontend [env=SARSCov2]"
ng build --configuration=SARSCov2 --base-href /SARSCov2/ --deploy-url /SARSCov2/

echo "Copy frontend"
cp -R dist/cltp/** ../php-dist

cd ../php

echo "Package all files together"
cp -R ../php-dist .

echo "Zip the packaged files"
zip -r cltp-SARSCov2.zip php-dist/
