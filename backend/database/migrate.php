<?php
// backend/database/migrate.php

$config = require __DIR__ . '/../config/database.php';

try {
    // 1. Koneksi ke MySQL server TANPA menyertakan dbname terlebih dahulu
    $dsn = "mysql:host={$config['host']};port={$config['port']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "1. Terhubung ke server MySQL...\n";

    // 2. Buat database secara otomatis jika belum ada
    $dbName = $config['database'];
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    echo "2. Database '{$dbName}' siap digunakan.\n";

    // 3. Masuk ke database tersebut
    $pdo->exec("USE `{$dbName}`;");

    // 4. Baca dan eksekusi schema.sql
    $schemaPath = __DIR__ . '/schema.sql';
    if (!file_exists($schemaPath)) {
        throw new Exception("File schema.sql tidak ditemukan di: " . $schemaPath);
    }

    $sql = file_get_contents($schemaPath);
    $pdo->exec($sql);

    echo "3. Migrasi sukses! Tabel dan data awal berhasil dibuat.\n";

} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}