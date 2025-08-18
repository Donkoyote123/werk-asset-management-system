<?php
/**
 * WERK Asset Management System - Main Dashboard Router
 */

require_once 'config/database.php';
require_once 'includes/functions.php';
require_once 'includes/session.php';

// Require login
requireLogin();

// Get current user data
$current_user = getCurrentUser();
if (!$current_user) {
    logoutUser();
}

// Route to appropriate dashboard based on role
switch ($_SESSION['user_role']) {
    case 'system_admin':
        include 'pages/admin-dashboard.php';
        break;
    case 'asset_manager':
        include 'pages/manager-dashboard.php';
        break;
    case 'staff':
        include 'pages/staff-dashboard.php';
        break;
    default:
        redirect('/login.php', 'Invalid user role.', 'danger');
}
?>
