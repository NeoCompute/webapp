#!/bin/bash
set -ex

sudo cp /home/csye6225/webapp/webapp_service.service /etc/systemd/system/
sudo chown csye6225:csye6225 /etc/systemd/system/webapp_service.service
sudo chmod 750 /etc/systemd/system/webapp_service.service
sudo systemctl daemon-reload
sudo systemctl start webapp_service
sudo systemctl enable webapp_service
sudo systemctl status webapp_service
echo 'Service Configured'
