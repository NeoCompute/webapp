#!/bin/bash
set -ex

curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
echo 'Node Installed'
node -v
npm -v
