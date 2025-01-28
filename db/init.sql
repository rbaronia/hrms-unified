-- Drop database if exists and create new one
DROP DATABASE IF EXISTS hrmsdb;
CREATE DATABASE hrmsdb;
USE hrmsdb;

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create Department table
DROP TABLE IF EXISTS `DEPARTMENT`;
CREATE TABLE `DEPARTMENT` (
  `DEPTID` int NOT NULL,
  `DEPTNAME` varchar(36) NOT NULL,
  `PARENTID` int DEFAULT NULL,
  PRIMARY KEY (`DEPTID`),
  KEY `PARENTID` (`PARENTID`),
  CONSTRAINT `DEPARTMENT_ibfk_1` FOREIGN KEY (`PARENTID`) REFERENCES `DEPARTMENT` (`DEPTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create UserType table
DROP TABLE IF EXISTS `USERTYPE`;
CREATE TABLE `USERTYPE` (
  `TYPEID` int NOT NULL,
  `TYPENAME` varchar(36) NOT NULL,
  PRIMARY KEY (`TYPEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create User table
DROP TABLE IF EXISTS `USER`;
CREATE TABLE `USER` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `USERID` varchar(50) DEFAULT NULL,
  `FIRSTNAME` varchar(250) NOT NULL,
  `LASTNAME` varchar(250) NOT NULL,
  `STREETADDR` varchar(50) DEFAULT NULL,
  `CITY` varchar(50) DEFAULT NULL,
  `STATE` varchar(2) DEFAULT NULL,
  `ZIPCODE` varchar(50) DEFAULT NULL,
  `TITLE` varchar(50) DEFAULT NULL,
  `MANAGER` varchar(500) DEFAULT NULL,
  `ISMANAGER` char(1) DEFAULT NULL,
  `EDULEVEL` varchar(50) DEFAULT NULL,
  `STATUS` char(1) NOT NULL,
  `DEPTID` int DEFAULT NULL,
  `TYPEID` int DEFAULT NULL,
  `DATE_MODIFIED` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `DEPTID` (`DEPTID`),
  KEY `TYPEID` (`TYPEID`),
  CONSTRAINT `USER_ibfk_1` FOREIGN KEY (`DEPTID`) REFERENCES `DEPARTMENT` (`DEPTID`),
  CONSTRAINT `USER_ibfk_2` FOREIGN KEY (`TYPEID`) REFERENCES `USERTYPE` (`TYPEID`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert Department data
INSERT INTO `DEPARTMENT` VALUES 
(1,'ACME',NULL),
(101,'SOUTH',123),
(102,'QUALITY AND SECURITY',123),
(103,'COUNTRY MANAGER EMEA',129),
(104,'GENERAL SERVICES',1),
(105,'MARKETING',110),
(106,'INTERNATIONAL HR',129),
(107,'SHARED AND FUNCTIONAL',112),
(108,'EXTERNAL',1),
(109,'COUNTRY MANAGER EAST EUROPE',129),
(110,'SALES',1),
(111,'CORPORATE',1),
(112,'IT',111),
(113,'ADMINISTRATION, FINANCE AND CONTROL',111),
(114,'CENTER',123),
(115,'INT PLANNING AND CONTROL',129),
(116,'INTEGR, SAFETY AND OPERATION SUPPORT',129),
(117,'SYSTEMS ADMINISTRATION',112),
(118,'AUDIT',111),
(119,'PROCUREMENT',111),
(120,'LEGAL',111),
(121,'COMPLIANCE AND ANTITRUST',123),
(122,'CUSTOMER SERVICE',110),
(123,'PRODUCT DIVISION',1),
(124,'RISK MANAGEMENT',111),
(125,'HUMAN RESOURCES',111),
(126,'NORTH',123),
(127,'PRODUCT  DEVELOPMENT',123),
(128,'ADMINISTRATION',104),
(129,'INTERNATIONAL',1),
(130,'CEO STAFF',111),
(5752,'WEALTH MANAGEMENT',1),
(5753,'RETAIL MARKETS',1);

-- Insert UserType data
INSERT INTO `USERTYPE` VALUES 
(100,'Regular User'),
(101,'External'),
(102,'System'),
(104,'Training');

-- Insert User data
INSERT INTO `USER` (`ID`, `FIRSTNAME`, `LASTNAME`, `STREETADDR`, `CITY`, `STATE`, `ZIPCODE`, `TITLE`, `MANAGER`, `ISMANAGER`, `EDULEVEL`, `STATUS`, `DEPTID`, `TYPEID`, `USERID`, `DATE_MODIFIED`) VALUES
(1,'Angela','Brown',NULL,'West Palm Beach','FL',NULL,NULL,NULL,'1','Upper Secondary','0',127,100,'ABrown','2025-01-24 14:17:06'),
(2,'Abigail','Gill',NULL,'New Orleans','LA',NULL,NULL,NULL,'1','Secondary','0',116,100,'AGill','2025-01-24 14:17:06'),
(3,'Angeline','Robertson',NULL,'Tacoma','WA',NULL,NULL,NULL,'1','Bachelor','0',120,100,'ARobertson','2025-01-24 14:17:06'),
(4,'Chad','Little',NULL,'Harlingen','TX',NULL,'Recruiter',NULL,'1','Upper Secondary','0',125,100,'CLittle','2025-01-24 14:17:06'),
(5,'Cassandra','Shaner',NULL,'Syracuse','NY',NULL,'Industry Energy Buyer',NULL,'1','Secondary','0',104,101,'CShaner','2025-01-24 14:25:59'),
(6,'Debora','Brittain',NULL,'Montgomery','AL',NULL,NULL,NULL,'1','Tertiary','0',105,100,'DBrittain','2025-01-24 14:17:06'),
(7,'David','Fox',NULL,'Oakland','CA',NULL,NULL,NULL,'1','Upper Secondary','0',127,101,'DFox','2025-01-24 14:25:59'),
(8,'David','Sparkman',NULL,'Mill Valley','CA',NULL,'Recruiter',NULL,'1','Upper Secondary','0',125,101,'DSparkman','2025-01-24 14:25:59'),
(9,'Elizabeth','Kimble',NULL,'Cleveland','OH',NULL,NULL,NULL,'1','Post-Secondary','0',114,100,'EKimble','2025-01-24 14:17:06'),
(10,'Helen','Hayward',NULL,'New York','NY',NULL,NULL,NULL,'1','NA','0',116,100,'HHayward','2025-01-24 14:17:06'),
(11,'Jasmine','Goodwin',NULL,'Madison','FL',NULL,NULL,NULL,'1','Upper Secondary','0',102,104,'JGoodwin','2025-01-24 14:17:06'),
(12,'Jean','Hicks',NULL,'Abbyville','KS',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'JHicks','2025-01-24 14:17:06'),
(13,'Jessica','Hillis',NULL,'High Point','MO',NULL,NULL,NULL,'1','Upper Secondary','0',114,100,'JHillis','2025-01-24 14:17:06'),
(14,'Jeffrey','Turner',NULL,'Los Angeles','CA',NULL,NULL,NULL,'1','Upper Secondary','0',111,101,'JTurner','2025-01-24 14:25:59'),
(15,'Leon','Dinh',NULL,'Mountain View','CA',NULL,NULL,NULL,'1','Upper Secondary','0',111,104,'LDinh','2025-01-24 14:17:06'),
(16,'Leann','Greenleaf',NULL,'Pittsburgh','PA',NULL,NULL,NULL,'1','Post-Secondary','0',118,100,'LGreenleaf','2025-01-24 14:17:06'),
(17,'Mark','Anderson',NULL,'Richmond','VA',NULL,NULL,NULL,'1','Upper Secondary','0',127,104,'MAnderson','2025-01-24 14:17:06'),
(18,'Mary','Nunez',NULL,'Butte','NE',NULL,NULL,NULL,'1','Upper Secondary','0',119,100,'MNunez','2025-01-24 14:17:06'),
(19,'Marcelo','Perez',NULL,'Laramie','WY',NULL,NULL,NULL,'1','Upper Secondary','0',104,104,'MPerez','2025-01-24 14:17:06'),
(20,'Mark','Powers',NULL,'Corpus Christi','TX',NULL,NULL,NULL,'1','Upper Secondary','0',105,104,'MPowers','2025-01-24 14:17:06'),
(21,'Misty','Scott',NULL,'Vineland','NJ',NULL,'Residential Energy Buyer',NULL,'1','Secondary','0',124,104,'MScott','2025-01-24 14:17:06'),
(22,'Rose','Bremner',NULL,'Manchester','NH',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'RBremner','2025-01-24 14:17:06'),
(23,'Robert','Fassett',NULL,'New York','NY',NULL,NULL,NULL,'1','Upper Secondary','0',125,101,'RFassett','2025-01-24 14:25:59'),
(24,'Shirley','Chang',NULL,'Abbyville','KS',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'SChang','2025-01-24 14:17:06');

SET FOREIGN_KEY_CHECKS = 1;
