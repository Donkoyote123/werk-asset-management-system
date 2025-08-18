<?php
/**
 * Common Header Template
 */

if (!defined('APP_NAME')) {
    die('Direct access not allowed');
}

$current_user = getCurrentUser();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title ?? 'Dashboard'; ?> - <?php echo APP_NAME; ?></title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Custom CSS -->
    <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="main-wrapper">
        <!-- Sidebar -->
        <nav class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h4><i class="fas fa-boxes me-2"></i>WERK</h4>
                <small>Asset Management</small>
            </div>
            
            <div class="sidebar-menu">
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'dashboard' ? 'active' : ''; ?>" 
                           href="/dashboard.php">
                            <i class="fas fa-tachometer-alt"></i>
                            Dashboard
                        </a>
                    </li>
                    
                    <?php if (hasPermission($_SESSION['user_role'], ['system_admin', 'asset_manager'])): ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'assets' ? 'active' : ''; ?>" 
                           href="/pages/assets.php">
                            <i class="fas fa-boxes"></i>
                            Assets
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'assignments' ? 'active' : ''; ?>" 
                           href="/pages/assignments.php">
                            <i class="fas fa-handshake"></i>
                            Assignments
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'reports' ? 'active' : ''; ?>" 
                           href="/pages/reports.php">
                            <i class="fas fa-chart-bar"></i>
                            Reports
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (hasPermission($_SESSION['user_role'], ['system_admin'])): ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'users' ? 'active' : ''; ?>" 
                           href="/pages/users.php">
                            <i class="fas fa-users"></i>
                            User Management
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'categories' ? 'active' : ''; ?>" 
                           href="/pages/categories.php">
                            <i class="fas fa-tags"></i>
                            Categories
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'logs' ? 'active' : ''; ?>" 
                           href="/pages/system-logs.php">
                            <i class="fas fa-history"></i>
                            System Logs
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($current_page ?? '') === 'profile' ? 'active' : ''; ?>" 
                           href="/pages/profile.php">
                            <i class="fas fa-user"></i>
                            My Profile
                        </a>
                    </li>
                    
                    <li class="nav-item mt-3">
                        <a class="nav-link text-light" href="/logout.php">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
        
        <!-- Main Content -->
        <main class="main-content">
            <!-- Top Header -->
            <div class="content-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <button class="btn btn-link d-md-none" id="sidebarToggle">
                            <i class="fas fa-bars"></i>
                        </button>
                        <h4 class="mb-0"><?php echo $page_title ?? 'Dashboard'; ?></h4>
                        <?php if (isset($page_subtitle)): ?>
                            <small class="text-muted"><?php echo $page_subtitle; ?></small>
                        <?php endif; ?>
                    </div>
                    
                    <div class="d-flex align-items-center">
                        <div class="dropdown">
                            <button class="btn btn-link dropdown-toggle" 
                                    type="button" 
                                    id="userDropdown" 
                                    data-bs-toggle="dropdown">
                                <i class="fas fa-user-circle me-2"></i>
                                <?php echo htmlspecialchars($current_user['name']); ?>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <span class="dropdown-item-text">
                                        <small class="text-muted">
                                            <?php echo getRoleDisplayName($_SESSION['user_role']); ?>
                                        </small>
                                    </span>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="/pages/profile.php">
                                        <i class="fas fa-user me-2"></i>My Profile
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/logout.php">
                                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Content Body -->
            <div class="content-body">
                <?php displayFlashMessage(); ?>
