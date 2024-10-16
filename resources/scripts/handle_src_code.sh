#!/bin/bash
set -ex

sudo apt-get install -y unzip
sudo mkdir -p /home/csye6225/webapp
sudo unzip -o /tmp/webapp.zip -d /home/csye6225/webapp
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod -R 775 /home/csye6225
cd /home/csye6225/webapp
sudo npm install

echo 'Webapp Installed'