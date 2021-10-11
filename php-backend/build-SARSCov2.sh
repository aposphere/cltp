#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


rm -f -R cltp.zip
rm -f -R php-dist
rm -f -R ../php-dist

cp -R . ../php-dist

cd ../frontend

ng build --configuration=SARSCov2 --base-href /SARSCov2/ --deploy-url /SARSCov2/

cp -R dist/cltp/** ../php-dist

cd ../php-backend

cp -R ../php-dist . 

zip -r cltp-SARSCov2.zip php-dist/
