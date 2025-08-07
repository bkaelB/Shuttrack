-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 07, 2025 at 10:35 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `badminton_queue_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `match_queue`
--

CREATE TABLE `match_queue` (
  `id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `match_group` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'in queue'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `level` enum('A','B','C','D') NOT NULL,
  `games_played` int(11) DEFAULT 0,
  `done_playing` tinyint(1) DEFAULT 0,
  `paid` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `name`, `level`, `games_played`, `done_playing`, `paid`) VALUES
(1, 'Vincent', 'B', 0, 0, 0),
(2, 'Ian', 'B', 0, 0, 0),
(3, 'Mark L', 'A', 0, 0, 0),
(4, 'Richmond', 'A', 0, 0, 0),
(9, 'Regean', 'B', 0, 0, 0),
(10, 'Buddy', 'D', 0, 0, 0),
(11, 'Allan', 'C', 0, 0, 0),
(12, 'Jerome', 'C', 0, 0, 0),
(13, 'Atty. Bri', 'A', 0, 0, 0),
(14, 'Nilo', 'A', 0, 0, 0),
(15, 'Aaron', 'C', 0, 0, 0),
(16, 'Ramil', 'B', 0, 0, 0),
(17, 'Harry', 'D', 0, 0, 0),
(18, 'Francois', 'C', 0, 0, 0),
(19, 'El', 'C', 0, 0, 0),
(20, 'Prince', 'C', 0, 0, 0),
(21, 'Anto', 'B', 0, 0, 0),
(22, 'Josh', 'C', 0, 0, 0),
(23, 'Megan', 'D', 0, 0, 0),
(24, 'Val', 'B', 0, 0, 0),
(25, 'Ponzi', 'A', 0, 0, 0),
(26, 'Bridgette', 'B', 0, 0, 0),
(27, 'Owi', 'B', 0, 0, 0),
(28, 'Abel', 'C', 0, 0, 0),
(29, 'Jess', 'A', 0, 0, 0),
(30, 'Eltung', 'A', 0, 1, 0),
(31, 'Yojann', 'D', 1, 0, 0),
(32, 'Jonald', 'C', 1, 1, 0),
(33, 'Rein', 'C', 1, 0, 0),
(34, 'Emerson', 'B', 1, 0, 0),
(35, 'JJ', 'D', 0, 0, 0),
(36, 'Joseph', 'B', 0, 0, 0),
(37, 'France', 'C', 0, 0, 0),
(38, 'Monti', 'D', 0, 0, 0),
(39, 'France', 'C', 0, 0, 0),
(40, 'KimB', 'D', 0, 0, 0),
(41, 'KimG', 'D', 0, 0, 0),
(42, 'Jepoy', 'C', 0, 0, 0),
(43, 'Arjay', 'B', 0, 0, 0),
(44, 'Gab', 'A', 0, 1, 0),
(45, 'Kevin', 'C', 0, 0, 0),
(46, 'Brent', 'A', 0, 1, 0),
(47, 'raffy', 'D', 0, 0, 0),
(48, 'Dustin', 'D', 0, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `match_queue`
--
ALTER TABLE `match_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `match_queue`
--
ALTER TABLE `match_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `match_queue`
--
ALTER TABLE `match_queue`
  ADD CONSTRAINT `match_queue_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
