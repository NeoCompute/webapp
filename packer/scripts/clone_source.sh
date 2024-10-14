#!/bin/bash
set -e

# Clone the repository using the GitHub access token
git clone https://your_token_here@github.com/NeoCompute/webapp.git /home/ubuntu/webapp

cd /home/ubuntu/webapp
npm install