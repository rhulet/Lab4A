DROP DATABASE IF EXISTS `it210b`;
CREATE DATABASE `it210b`; 
USE `it210b`;

--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `loggedIn` int(11) DEFAULT NULL,
  `isAdmin` BOOLEAN DEFAULT FALSE,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'user','user@user.com','12dea96fec20593566ab75692c9949596833adc9',0,0,'2013-08-21 10:22:16','2013-08-21 10:22:16'),(2,'admin','admin@admin.com','d033e22ae348aeb5660fc2140aec35850c4da997',0,0,'2013-08-21 10:22:16','2013-08-21 10:22:16'),(3,'jed','test@gmail.com','123456789',1,0,'2013-08-21 10:22:16','2013-08-21 10:22:16'),(4,'tester','tester@test.com','0987654321',0,0,'2013-08-21 10:22:16','2013-08-21 10:22:16');
UNLOCK TABLES;

--
-- Table structure for table `images`
--
DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
  `imageId` int(11) NOT NULL AUTO_INCREMENT,
  `imagePath` varchar(255) DEFAULT NULL,
  `imageApproved` varchar(255) DEFAULT NULL,
  `altText` varchar(255) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `numLikes` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`imageId`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `images`
--
LOCK TABLES `images` WRITE;
INSERT INTO `images` VALUES (1,'/images/image1.jpg','1','testing1',4,46,'2013-08-20 15:45:52','2013-08-26 15:45:52'),(2,'/images/image1.jpg','1','testing1',3,18,'2013-08-21 10:22:16','2013-08-26 15:45:55'),(3,'/images/image2.jpg','0','testing2',4,16,'2013-08-21 10:22:39','2013-08-23 19:03:24'),(4,'/images/image3.jpg','0','testing3',3,12,'2013-08-21 10:22:50','2013-08-22 19:04:28'),(5,'/images/image5.jpg','1','testing5',3,13,'2013-08-21 10:24:59','2013-08-22 22:33:05'),(6,'/images/image6.jpg','1','testing6',4,12,'2013-08-21 10:25:09','2013-08-22 22:33:08'),(7,'/images/image7.jpg','1','testing7',3,10,'2013-08-21 10:25:16','2013-08-22 19:04:31'),(8,'/images/image8.jpg','1','testing8',2,5,'2013-08-22 12:49:37','2013-08-22 22:33:09'),(9,'/images/image9.jpg','1','testing9',3,10,'2013-08-22 13:24:42','2013-08-22 22:33:14'),(10,'/images/image10.jpg','1','testing10',3,10,'2013-08-22 15:03:03','2013-08-22 22:33:12'),(11,'/images/image11.jpg','1','testing11',4,6,'2013-08-22 15:03:29','2013-08-22 15:03:29'),(12,'/images/image12.jpg','1','testing12',3,7,'2013-08-23 13:34:20','2013-08-23 13:34:20'),(13,'/images/image13.jpg','1','testing13',3,5,'2013-08-26 09:48:56','2013-08-26 15:49:10');
UNLOCK TABLES;

--
-- Table structure for table `cross_server_keys`
--
DROP TABLE IF EXISTS `cross_server_keys`;
CREATE TABLE `cross_server_keys` (
  `csk_index` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`csk_index`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
