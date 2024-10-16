#!/bin/bash
set -ex

cd /tmp
sudo apt-get install -y postgresql postgresql-contrib
echo 'postgres Installed'
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
echo 'postgres Started'
