<?php
/**
 * Session Management for WERK Asset Management System
 */

// Start session with secure settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.use_strict_mode', 1);
    
    session_start();
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
}

/**
 * Require login
 */
function requireLogin() {
    if (!isLoggedIn()) {
        redirect('/login.php', 'Please log in to access this page.', 'warning');
    }
}

/**
 * Require specific role
 */
function requireRole($required_roles) {
    requireLogin();
    
    if (!hasPermission($_SESSION['user_role'], $required_roles)) {
        redirect('/dashboard.php', 'You do not have permission to access this page.', 'danger');
    }
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    try {
        $db = Database::getInstance();
        $sql = "SELECT * FROM users WHERE id = ? AND is_active = 1";
        $stmt = $db->query($sql, [$_SESSION['user_id']]);
        return $stmt->fetch();
    } catch (Exception $e) {
        error_log("Failed to get current user: " . $e->getMessage());
        return null;
    }
}

/**
 * Login user
 */
function loginUser($username, $password) {
    try {
        $db = Database::getInstance();
        
        // Handle hardcoded system admin for v0
        if ($username === 'Admin.Asset@werk' && $password === 'werk@321') {
            $_SESSION['user_id'] = 1;
            $_SESSION['user_role'] = 'system_admin';
            $_SESSION['username'] = $username;
            $_SESSION['name'] = 'System Administrator';
            $_SESSION['login_time'] = time();
            
            logActivity(1, 'User logged in');
            return true;
        }
        
        // Regular user authentication
        $sql = "SELECT * FROM users WHERE system_username = ? AND is_active = 1";
        $stmt = $db->query($sql, [$username]);
        $user = $stmt->fetch();
        
        if ($user && verifyPassword($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['username'] = $user['system_username'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['login_time'] = time();
            
            logActivity($user['id'], 'User logged in');
            return true;
        }
        
        return false;
    } catch (Exception $e) {
        error_log("Login failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Logout user
 */
function logoutUser() {
    if (isLoggedIn()) {
        logActivity($_SESSION['user_id'], 'User logged out');
    }
    
    session_destroy();
    redirect('/login.php', 'You have been logged out successfully.', 'success');
}

/**
 * Check session timeout
 */
function checkSessionTimeout() {
    if (isLoggedIn() && isset($_SESSION['login_time'])) {
        if (time() - $_SESSION['login_time'] > SESSION_LIFETIME) {
            logoutUser();
        }
    }
}

/**
 * Regenerate session ID for security
 */
function regenerateSession() {
    if (isLoggedIn()) {
        session_regenerate_id(true);
    }
}

// Check session timeout on every request
checkSessionTimeout();
?>
