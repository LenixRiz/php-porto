<?php
// src/Middleware/AuthMiddleware.php

class AuthMiddleware {
    public static function handle(): void {
        $token = self::getBearerToken();
        $config = require __DIR__ . '/../../config/auth.php';
        $validToken = $config['admin_token'] ?? null;

        // 1. Cek keberadaan token
        if (!$token || !$validToken) {
            self::abortUnauthorized('Token otentikasi tidak ditemukan.');
        }

        // 2. Bandingkan token menggunakan hash_equals
        // KENAPA hash_equals()? 
        // Operator '===' rentan terhadap Timing Attack (penyerang bisa menebak karakter 
        // demi karakter berdasarkan selisih waktu eksekusi CPU). 
        // hash_equals() membandingkan string dengan waktu konstan (constant-time comparison).
        if (!hash_equals($validToken, $token)) {
            self::abortUnauthorized('Token otentikasi tidak valid atau telah kedaluwarsa.');
        }
    }

    /**
     * Mengambil header Authorization dari berbagai environment web server
     */
    private static function getAuthorizationHeader(): ?string {
        // Cek $_SERVER standar
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return trim($_SERVER['HTTP_AUTHORIZATION']);
        }

        // Cek pada Apache / Nginx FastCGI
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        }

        // Cek via fungsi bawaan Apache jika tersedia
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            // Header case-insensitive (bisa 'Authorization' atau 'authorization')
            $headers = array_change_key_case($headers, CASE_LOWER);
            if (!empty($headers['authorization'])) {
                return trim($headers['authorization']);
            }
        }

        return null;
    }

    /**
     * Mengekstrak nilai token dari format "Bearer <token>"
     */
    private static function getBearerToken(): ?string {
        $header = self::getAuthorizationHeader();
        
        if (!empty($header) && preg_match('/^Bearer\s+(\S+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Menghentikan request dan merespons dengan JSON 401
     */
    private static function abortUnauthorized(string $message): void {
        http_response_code(401);
        echo json_encode([
            'status'  => 'error',
            'message' => $message
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }
}