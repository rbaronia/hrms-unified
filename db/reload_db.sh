#!/bin/bash
mysql -h127.0.0.1 -P3307 -uroot -p'P@ssw0rd' -e "DROP DATABASE IF EXISTS hrmsdb; CREATE DATABASE hrmsdb;"
mysql -h127.0.0.1 -P3307 -uroot -p'P@ssw0rd' hrmsdb < new_schema.sql
