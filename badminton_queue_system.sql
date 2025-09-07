-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2025 at 05:39 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deduct_from` enum('cash','gcash','both') NOT NULL DEFAULT 'cash',
  `session_id` int(11) NOT NULL DEFAULT 1,
  `session_name` varchar(255) NOT NULL DEFAULT 'Default Session'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `match_history`
--

CREATE TABLE `match_history` (
  `id` int(11) NOT NULL,
  `match_group` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `team` enum('A','B') NOT NULL,
  `position` int(11) NOT NULL,
  `session_id` int(11) NOT NULL DEFAULT 1,
  `session_name` varchar(255) NOT NULL DEFAULT 'Default Session'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `match_history`
--

INSERT INTO `match_history` (`id`, `match_group`, `player_id`, `team`, `position`, `session_id`, `session_name`) VALUES
(1, 1, 1, 'A', 0, 1, 'Default Session'),
(2, 1, 3, 'A', 0, 1, 'Default Session'),
(3, 1, 2, 'B', 0, 1, 'Default Session'),
(4, 1, 4, 'B', 0, 1, 'Default Session');

-- --------------------------------------------------------

--
-- Table structure for table `match_queue`
--

CREATE TABLE `match_queue` (
  `id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `match_group` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'in queue',
  `match_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `team` enum('A','B') NOT NULL DEFAULT 'A',
  `session_id` int(11) NOT NULL DEFAULT 1,
  `session_name` varchar(255) NOT NULL DEFAULT 'Default Session'
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
  `total_due` decimal(10,2) DEFAULT 0.00,
  `paid_status` enum('paid','not_paid') DEFAULT 'not_paid',
  `payment_mode` enum('cash','gcash') DEFAULT NULL,
  `session_id` int(11) NOT NULL DEFAULT 1,
  `session_name` varchar(255) NOT NULL DEFAULT 'Default Session'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `name`, `level`, `games_played`, `done_playing`, `total_due`, `paid_status`, `payment_mode`, `session_id`, `session_name`) VALUES
(1, 'Vince', 'A', 1, 1, 30.00, 'paid', 'cash', 1, 'Default Session'),
(2, 'Ian', 'A', 1, 1, 30.00, 'paid', 'cash', 1, 'Default Session'),
(3, 'Joe', 'A', 1, 1, 30.00, 'paid', 'cash', 1, 'Default Session'),
(4, 'John', '', 1, 1, 30.00, 'paid', 'cash', 1, 'Default Session');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `name`, `created_at`) VALUES
(1, 'Session 1756903671157', '2025-09-03 12:47:51'),
(2, 'Session 1756903678486', '2025-09-03 12:47:58'),
(3, 'Session 1756903939403', '2025-09-03 12:52:19'),
(4, 'Session 1756904008338', '2025-09-03 12:53:28'),
(5, 'Session 1756904165532', '2025-09-03 12:56:05'),
(6, 'Session 1756904169676', '2025-09-03 12:56:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `match_history`
--
ALTER TABLE `match_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `player_id` (`player_id`);

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
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `match_history`
--
ALTER TABLE `match_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `match_queue`
--
ALTER TABLE `match_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `match_history`
--
ALTER TABLE `match_history`
  ADD CONSTRAINT `match_history_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`);

--
-- Constraints for table `match_queue`
--
ALTER TABLE `match_queue`
  ADD CONSTRAINT `match_queue_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
