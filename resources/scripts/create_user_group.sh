#!/bin/bash
set -ex

sudo groupadd csye6225
sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
echo 'User and Group Created'

