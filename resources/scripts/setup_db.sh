#!/bin/bash

set -ex
cd /tmp


sudo -u postgres psql -c "CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';"
sudo -u postgres psql -c "ALTER USER $DATABASE_USER CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE $DATABASE_NAME OWNER $DATABASE_USER;"
sudo -u postgres psql -d $DATABASE_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO $DATABASE_USER;"
