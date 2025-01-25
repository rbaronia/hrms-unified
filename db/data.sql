-- MySQL dump 10.13  Distrib 9.0.1, for macos14.7 (x86_64)
--
-- Host: 127.0.0.1    Database: hrmsdb
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `DEPARTMENT`
--

LOCK TABLES `DEPARTMENT` WRITE;
/*!40000 ALTER TABLE `DEPARTMENT` DISABLE KEYS */;
INSERT INTO `DEPARTMENT` VALUES (1,'ACME',NULL),(101,'SOUTH',123),(102,'QUALITY AND SECURITY',123),(103,'COUNTRY MANAGER EMEA',129),(104,'GENERAL SERVICES',1),(105,'MARKETING',110),(106,'INTERNATIONAL HR',129),(107,'SHARED AND FUNCTIONAL',112),(108,'EXTERNAL',1),(109,'COUNTRY MANAGER EAST EUROPE',129),(110,'SALES',1),(111,'CORPORATE',1),(112,'IT',111),(113,'ADMINISTRATION, FINANCE AND CONTROL',111),(114,'CENTER',123),(115,'INT PLANNING AND CONTROL',129),(116,'INTEGR, SAFETY AND OPERATION SUPPORT',129),(117,'SYSTEMS ADMINISTRATION',112),(118,'AUDIT',111),(119,'PROCUREMENT',111),(120,'LEGAL',111),(121,'COMPLIANCE AND ANTITRUST',123),(122,'CUSTOMER SERVICE',110),(123,'PRODUCT DIVISION',1),(124,'RISK MANAGEMENT',111),(125,'HUMAN RESOURCES',111),(126,'NORTH',123),(127,'PRODUCT  DEVELOPMENT',123),(128,'ADMINISTRATION',104),(129,'INTERNATIONAL',1),(130,'CEO STAFF',111),(5752,'WEALTH MANAGEMENT',1),(5753,'RETAIL MARKETS',1);
/*!40000 ALTER TABLE `DEPARTMENT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `EMPLOYEE`
--

LOCK TABLES `EMPLOYEE` WRITE;
/*!40000 ALTER TABLE `EMPLOYEE` DISABLE KEYS */;
INSERT INTO `EMPLOYEE` VALUES (1,'Angela','Brown',NULL,'West Palm Beach','FL',NULL,NULL,NULL,'1','Upper Secondary','0',127,100,'ABrown','2025-01-24 14:17:06'),(2,'Abigail','Gill',NULL,'New Orleans','LA',NULL,NULL,NULL,'1','Secondary','0',116,100,'AGill','2025-01-24 14:17:06'),(3,'Angeline','Robertson',NULL,'Tacoma','WA',NULL,NULL,NULL,'1','Bachelor','0',120,100,'ARobertson','2025-01-24 14:17:06'),(4,'Chad','Little',NULL,'Harlingen','TX',NULL,'Recruiter',NULL,'1','Upper Secondary','0',125,100,'CLittle','2025-01-24 14:17:06'),(5,'Cassandra','Shaner',NULL,'Syracuse','NY',NULL,'Industry Energy Buyer',NULL,'1','Secondary','0',104,101,'CShaner','2025-01-24 14:25:59'),(6,'Debora','Brittain',NULL,'Montgomery','AL',NULL,NULL,NULL,'1','Tertiary','0',105,100,'DBrittain','2025-01-24 14:17:06'),(7,'David','Fox',NULL,'Oakland','CA',NULL,NULL,NULL,'1','Upper Secondary','0',127,101,'DFox','2025-01-24 14:25:59'),(8,'David','Sparkman',NULL,'Mill Valley','CA',NULL,'Recruiter',NULL,'1','Upper Secondary','0',125,101,'DSparkman','2025-01-24 14:25:59'),(9,'Elizabeth','Kimble',NULL,'Cleveland','OH',NULL,NULL,NULL,'1','Post-Secondary','0',114,100,'EKimble','2025-01-24 14:17:06'),(10,'Helen','Hayward',NULL,'New York','NY',NULL,NULL,NULL,'1','NA','0',116,100,'HHayward','2025-01-24 14:17:06'),(11,'Jasmine','Goodwin',NULL,'Madison','FL',NULL,NULL,NULL,'1','Upper Secondary','0',102,104,'JGoodwin','2025-01-24 14:17:06'),(12,'Jean','Hicks',NULL,'Abbyville','KS',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'JHicks','2025-01-24 14:17:06'),(13,'Jessica','Hillis',NULL,'High Point','MO',NULL,NULL,NULL,'1','Upper Secondary','0',114,100,'JHillis','2025-01-24 14:17:06'),(14,'Jeffrey','Turner',NULL,'Los Angeles','CA',NULL,NULL,NULL,'1','Upper Secondary','0',111,101,'JTurner','2025-01-24 14:25:59'),(15,'Leon','Dinh',NULL,'Mountain View','CA',NULL,NULL,NULL,'1','Upper Secondary','0',111,104,'LDinh','2025-01-24 14:17:06'),(16,'Leann','Greenleaf',NULL,'Pittsburgh','PA',NULL,NULL,NULL,'1','Post-Secondary','0',118,100,'LGreenleaf','2025-01-24 14:17:06'),(17,'Mark','Anderson',NULL,'Richmond','VA',NULL,NULL,NULL,'1','Upper Secondary','0',127,104,'MAnderson','2025-01-24 14:17:06'),(18,'Mary','Nunez',NULL,'Butte','NE',NULL,NULL,NULL,'1','Upper Secondary','0',119,100,'MNunez','2025-01-24 14:17:06'),(19,'Marcelo','Perez',NULL,'Laramie','WY',NULL,NULL,NULL,'1','Upper Secondary','0',104,104,'MPerez','2025-01-24 14:17:06'),(20,'Mark','Powers',NULL,'Corpus Christi','TX',NULL,NULL,NULL,'1','Upper Secondary','0',105,104,'MPowers','2025-01-24 14:17:06'),(21,'Misty','Scott',NULL,'Vineland','NJ',NULL,'Residential Energy Buyer',NULL,'1','Secondary','0',124,104,'MScott','2025-01-24 14:17:06'),(22,'Rose','Bremner',NULL,'Manchester','NH',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'RBremner','2025-01-24 14:17:06'),(23,'Robert','Fassett',NULL,'New York','NY',NULL,NULL,NULL,'1','Upper Secondary','0',125,101,'RFassett','2025-01-24 14:25:59'),(24,'Shirley','Chang',NULL,'Abbyville','KS',NULL,NULL,NULL,'1','Upper Secondary','0',111,100,'SChang','2025-01-24 14:17:06'),(25,'JOhn','Martin','sfs','sdf','jg','3242','sfdsd','MPerez','0','dsfsfds','1',129,101,'jmartin','2025-01-24 17:29:20'),(26,'John','Wick','New St','NY','WA','32421','VP','LGreenleaf','0','High School','0',126,100,'jwick','2025-01-25 05:08:57');
/*!40000 ALTER TABLE `EMPLOYEE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `USERTYPE`
--

LOCK TABLES `USERTYPE` WRITE;
/*!40000 ALTER TABLE `USERTYPE` DISABLE KEYS */;
INSERT INTO `USERTYPE` VALUES (100,'Employee'),(101,'External'),(102,'System'),(104,'Training');
/*!40000 ALTER TABLE `USERTYPE` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-25 13:46:23
