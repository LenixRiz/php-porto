<?php
// public/index.php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../src/Controllers/AdminController.php';
require_once __DIR__ . '/../src/Controllers/PortofolioController.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php'; // 1. Import Middleware

function jsonResponse(int $statusCode, array $data): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD']);
$rawPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim(trim($rawPath), '/');
if ($path === '') {
    $path = '/';
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

try {
    // -------------------------------------------------------------
    // MIDDLEWARE GATEKEEPER
    // -------------------------------------------------------------
    // Jika path diawali dengan '/api/admin', kunci akses wajib pakai token
    if (str_starts_with($path, '/api/admin')) {
        AuthMiddleware::handle();
    }

    // -------------------------------------------------------------
    // ROUTE PUBLIK
    // -------------------------------------------------------------
    if ($method === 'GET' && ($path === '/api/portfolio' || $path === '/api/portofolio')) {
        $controller = new PortofolioController();
        jsonResponse(200, [
            'status' => 'success',
            'data'   => $controller->getPortofolio()
        ]);
    }

    // -------------------------------------------------------------
    // ROUTE ADMIN (Otomatis Terproteksi oleh AuthMiddleware)
    // -------------------------------------------------------------
    if ($method === 'PUT' && $path === '/api/admin/hero') {
        $admin = new AdminController();
        $result = $admin->updateHero($body);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    if ($method === 'POST' && ($path === '/api/admin/experience' || $path === '/api/admin/experiences')) {
        $admin = new AdminController();
        $result = $admin->createExperience($body);
        jsonResponse(201, ['status' => 'success', 'data' => $result]);
    }

    if ($method === 'POST' && ($path === '/api/admin/skill' || $path === '/api/admin/skills')) {
        $admin = new AdminController();
        $result = $admin->createSkill($body);
        jsonResponse(201, ['status' => 'success', 'data' => $result]);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/skills/(\d+)$#', $path, $matches)) {
        $admin = new AdminController();
        $result = $admin->deleteSkill((int)$matches[1]);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/experiences/(\d+)$#', $path, $matches)) {
        $admin = new AdminController();
        $result = $admin->deleteExperience((int)$matches[1]);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    // Fallback 404
    jsonResponse(404, [
        'status'  => 'error',
        'message' => "Route {$method} {$path} not found."
    ]);

} catch (RuntimeException $e) {
    jsonResponse(404, ['status' => 'error', 'message' => $e->getMessage()]);
} catch (InvalidArgumentException $e) {
    jsonResponse(422, ['status' => 'error', 'message' => $e->getMessage()]);
} catch (PDOException $e) {
    jsonResponse(500, ['status' => 'error', 'message' => 'Database Query Error: ' . $e->getMessage()]);
} catch (Exception $e) {
    jsonResponse(500, ['status' => 'error', 'message' => 'Internal Server Error: ' . $e->getMessage()]);
}