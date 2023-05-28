#!/bin/sh
npm run init_db_prd
pm2-runtime start pm2.conf.json