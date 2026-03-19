<?php
// config.php
// Update these credentials with your InfinityFree database details
$db_host = 'localhost';
$db_user = 'root'; // e.g., epiz_12345678
$db_pass = '';     // Your vPanel password
$db_name = 'dagu_perfume'; // e.g., epiz_12345678_dagu

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
