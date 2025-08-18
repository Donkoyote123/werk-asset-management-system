<?php
/**
 * Helper Functions for WERK Asset Management System
 */

/**
 * Generate staff username from name
 * Format: <Initials>.assets@werk
 */
function generateStaffUsername($name) {
    $words = explode(' ', trim($name));
    $initials = '';
    
    foreach ($words as $word) {
        if (!empty($word)) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
    }
    
    return $initials . '.assets@werk';
}

/**
 * Generate secure random password
 */
function generateSecurePassword($length = 12) {
    $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    $password = '';
    
    for ($i = 0; $i < $length; $i++) {
        $password .= $characters[random_int(0, strlen($characters) - 1)];
    }
    
    return $password;
}

/**
 * Hash password securely
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Generate unique tag number
 */
function generateTagNumber($category_prefix = 'WRK') {
    return $category_prefix . '-' . date('Y') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'M d, Y') {
    if (empty($date) || $date === '0000-00-00') {
        return 'N/A';
    }
    return date($format, strtotime($date));
}

/**
 * Get user role display name
 */
function getRoleDisplayName($role) {
    $roles = [
        'system_admin' => 'System Administrator',
        'asset_manager' => 'Asset Manager',
        'staff' => 'Staff Member'
    ];
    
    return $roles[$role] ?? 'Unknown';
}

/**
 * Get asset status display name and color
 */
function getAssetStatusInfo($status) {
    $statuses = [
        'available' => ['name' => 'Available', 'color' => 'success'],
        'assigned' => ['name' => 'Assigned', 'color' => 'primary'],
        'returned' => ['name' => 'Returned', 'color' => 'info'],
        'maintenance' => ['name' => 'Maintenance', 'color' => 'warning'],
        'retired' => ['name' => 'Retired', 'color' => 'secondary']
    ];
    
    return $statuses[$status] ?? ['name' => 'Unknown', 'color' => 'dark'];
}

/**
 * Log system activity
 */
function logActivity($user_id, $action, $table_name = null, $record_id = null, $old_values = null, $new_values = null) {
    try {
        $db = Database::getInstance();
        $sql = "INSERT INTO system_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $user_id,
            $action,
            $table_name,
            $record_id,
            $old_values ? json_encode($old_values) : null,
            $new_values ? json_encode($new_values) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ];
        
        $db->query($sql, $params);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

/**
 * Check if user has permission for action
 */
function hasPermission($user_role, $required_roles) {
    if (!is_array($required_roles)) {
        $required_roles = [$required_roles];
    }
    
    return in_array($user_role, $required_roles);
}

/**
 * Redirect with message
 */
function redirect($url, $message = null, $type = 'info') {
    if ($message) {
        $_SESSION['flash_message'] = $message;
        $_SESSION['flash_type'] = $type;
    }
    header("Location: $url");
    exit();
}

/**
 * Display flash message
 */
function displayFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $message = $_SESSION['flash_message'];
        $type = $_SESSION['flash_type'] ?? 'info';
        
        echo "<div class='alert alert-{$type} alert-dismissible fade show' role='alert'>
                {$message}
                <button type='button' class='btn-close' data-bs-dismiss='alert'></button>
              </div>";
        
        unset($_SESSION['flash_message'], $_SESSION['flash_type']);
    }
}

/**
 * Export data to CSV
 */
function exportToCSV($data, $filename, $headers = []) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    $output = fopen('php://output', 'w');
    
    if (!empty($headers)) {
        fputcsv($output, $headers);
    }
    
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit();
}
?>
