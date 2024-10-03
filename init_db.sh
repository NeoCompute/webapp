#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Run the following PostgreSQL commands to create the DB, user, and grant privileges
sudo -i -u postgres psql <<EOF
-- Create a new PostgreSQL role
DO
\$do\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = '$DB_USER') THEN

      CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
   END IF;
END
\$do\$;

-- Create the database if it does not exist
DO
\$do\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database
      WHERE datname = '$DB_DATABASE') THEN

      CREATE DATABASE $DB_DATABASE OWNER $DB_USER;
   END IF;
END
\$do\$;

-- Grant privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;

EOF

echo "PostgreSQL initialization complete. Database '$DB_DATABASE' with user '$DB_USER' created."