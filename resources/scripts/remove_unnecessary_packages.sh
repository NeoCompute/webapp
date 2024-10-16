#!/bin/bash
set -ex

sudo apt-get remove -y git
sudo apt-get autoremove -y
sudo apt-get clean

echo 'Git removed and AMI cleaned up.'