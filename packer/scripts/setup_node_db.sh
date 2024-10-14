#!/bin/bash
set -e

sudo apt-get update

# Add the PostgreSQL APT repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import the repository signing key
wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update the package lists again to include the PostgreSQL repository
sudo apt-get update

# Install PostgreSQL and its contrib package
sudo apt-get install -y postgresql postgresql-contrib git curl

# Install Node.js 20.x and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs