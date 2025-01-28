#!/bin/bash

# Configuration
BACKUP_DIR="/opt/hrms-backup"
MYSQL_USER="hrmsuser"
MYSQL_DB="hrmsdb"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Starting database backup..."
mysqldump -u "$MYSQL_USER" -p "$MYSQL_DB" > "$BACKUP_DIR/hrmsdb_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "Database backup completed successfully: $BACKUP_DIR/hrmsdb_$DATE.sql"
else
    echo "Error: Database backup failed!"
    exit 1
fi

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/hrmsdb_$DATE.sql"

# Clean up old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "hrmsdb_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed!"
