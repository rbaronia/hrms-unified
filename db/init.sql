-- Drop database if exists and create new one
DROP DATABASE IF EXISTS hrmsdb;
CREATE DATABASE hrmsdb;
USE hrmsdb;

-- Import schema and data
SOURCE schema.sql;
SOURCE data.sql;
