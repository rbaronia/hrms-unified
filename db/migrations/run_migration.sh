#!/bin/bash

# MySQL connection parameters
MYSQL_HOST="localhost"
MYSQL_PORT="3307"
MYSQL_USER="root"
MYSQL_PASS="P@ssw0rd"
MYSQL_DB="hrmsdb"
MYSQL_OPTS="--protocol=TCP"

# Create backup
echo "Creating database backup..."
mysqldump $MYSQL_OPTS -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB > db/backups/hrmsdb_backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
echo "Running migration to rename Employee table to User..."
mysql $MYSQL_OPTS -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB < db/migrations/rename_employee_to_user.sql

echo "Migration completed!"
