<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../src/Controllers/AdminController.php';
require_once __DIR__ . '/../src/Controllers/PortofolioController.php';

function jsonResponse(int $statusCode, array $data): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$rawPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($rawPath, '/');
if ($path === '') {
    $path = '/';
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

try {
    // GET /api/portofolio
    if ($method === 'GET' && $path === '/api/portfolio') {
        $controller = new PortofolioController();
        jsonResponse(200, [
            'status' => 'success',
            'data' => $controller->getPortofolio()
        ]);
    }

    // PUT /api/admin/hero (update hero title and description)
    if ($method === 'PUT' && $path === '/api/admin/hero') {
        $admin = new AdminController();
        $result = $admin->updateHero($body);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    // POST /api/admin/experience (create new experience)
    if ($method === 'POST' && $path === '/api/admin/experiences') {
        $admin = new AdminController();
        $result = $admin->createExperience($body);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    // POST /api/admin/skill (create new skill)
    if ($method === 'POST' && $path === '/api/admin/skills') {
        $admin = new AdminController();
        $result = $admin->createSkill($body);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    // ROUTE CMS: DELETE /api/admin/skills/{id}
    if ($method === 'DELETE' && preg_match('#^/api/admin/skills/(\d+)$#', $path, $matches)) {
        $id = (int)$matches[1];
        $admin = new AdminController();
        $result = $admin->deleteSkill($id);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    // ROUTE CMS: DELETE /api/admin/experiences/{id}
    if ($method === 'DELETE' && preg_match('#^/api/admin/experiences/(\d+)$#', $path, $matches)) {
        $id = (int)$matches[1];
        $admin = new AdminController();
        $result = $admin->deleteExperience($id);
        jsonResponse(200, ['status' => 'success', 'data' => $result]);
    }

    jsonResponse(404, [
        'status'  => 'error',
        'message' => "Route {$method} {$path} not found."
    ]);

} catch (InvalidArgumentException $e) {
    jsonResponse(422, [
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    jsonResponse(500, [
        'status'  => 'error',
        'message' => 'Database Query Error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    jsonResponse(500, [
        'status'  => 'error',
        'message' => 'Internal Server Error: ' . $e->getMessage()
    ]);
} catch (RuntimeException $e) {
    // 404 jika resource/ID yang dicari tidak ada
    jsonResponse(404, [
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
} catch (InvalidArgumentException $e) {
    jsonResponse(422, [
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
}