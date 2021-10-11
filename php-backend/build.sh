#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


rm -f -R cltp.zip
rm -f -R php-dist
rm -f -R ../php-dist

cp -R . ../php-dist

cd ../frontend

ng build

cp -R dist/cltp/** ../php-dist

cd ../php-backend

cp -R ../php-dist .

zip -r cltp.zip php-dist/
