#! /usr/bin/bash
pwd
git pull
yarn
yarn run build
pm2 restart staging
