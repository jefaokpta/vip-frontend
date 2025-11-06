#!/bin/sh

npm run build

aws s3 sync ./dist/vip2-frontend/browser s3://vip2-frontend --delete
