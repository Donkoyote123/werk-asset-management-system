<?php
/**
 * WERK Asset Management System - Main Entry Point
 */

require_once 'config/database.php';
require_once 'includes/functions.php';
require_once 'includes/session.php';

// Redirect to appropriate page based on login status
if (isLoggedIn()) {
    header('Location: /dashboard.php');
} else {
    header('Location: /login.php');
}
exit();
?>
