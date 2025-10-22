#!/bin/sh

npm run build

aws s3 sync ./dist/iasmin-frontend/browser s3://iasmin-frontend --delete
