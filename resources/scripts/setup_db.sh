#!/bin/bash
set -e

sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql -c "CREATE USER clouduser WITH PASSWORD 'cloud@12345';"
sudo -u postgres psql -c "ALTER USER clouduser CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE clouddb OWNER clouduser;"
sudo -u postgres psql -d clouddb -c "GRANT ALL PRIVILEGES ON DATABASE clouddb TO clouduser;"