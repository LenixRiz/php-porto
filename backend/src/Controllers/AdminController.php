<?php
// src/Controllers/AdminController.php

require_once __DIR__ . '/../Database.php';

class AdminController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // 1. UPDATE HERO TEXT (Mengatasi Error HY093)
    public function updateHero(array $payload): array {
        if (empty($payload['title']) || empty($payload['description'])) {
            throw new InvalidArgumentException("Title dan description wajib diisi.");
        }

        // Menggunakan VALUES(setting_value) agar :value tidak perlu ditulis 2x
        $sql = "INSERT INTO site_settings (setting_key, setting_value) 
                VALUES (:key, :value)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";

        $stmt = $this->db->prepare($sql);

        // Eksekusi untuk hero_title
        $stmt->execute([
            ':key'   => 'hero_title',
            ':value' => trim($payload['title'])
        ]);

        // Eksekusi untuk hero_description
        $stmt->execute([
            ':key'   => 'hero_description',
            ':value' => trim($payload['description'])
        ]);

        return ['message' => 'Hero section berhasil diperbarui.'];
    }

    // 2. CREATE EXPERIENCE (Mengatasi Error 22007 Date)
    public function createExperience(array $payload): array {
        if (empty($payload['role']) || empty($payload['company']) || empty($payload['start_date'])) {
            throw new InvalidArgumentException("Role, company, dan start_date wajib diisi.");
        }

        // Sanitasi format end_date:
        // Jika tidak diisi, berupa boolean true, atau bernilai 'present'/'current', jadikan NULL
        $endDate = null;
        if (!empty($payload['end_date']) && $payload['end_date'] !== true && strtolower((string)$payload['end_date']) !== 'null') {
            // Validasi regex dasar format tanggal YYYY-MM-DD
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $payload['end_date'])) {
                $endDate = $payload['end_date'];
            }
        }

        $sql = "INSERT INTO experiences (role, company, description, start_date, end_date) 
                VALUES (:role, :company, :description, :start_date, :end_date)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':role'        => trim($payload['role']),
            ':company'     => trim($payload['company']),
            ':description' => trim($payload['description'] ?? ''),
            ':start_date'  => $payload['start_date'],
            ':end_date'    => $endDate // Bernilai NULL murni jika masih aktif
        ]);

        return [
            'message' => 'Experience berhasil ditambahkan.',
            'id'      => (int)$this->db->lastInsertId()
        ];
    }

    // 3. CREATE SKILL
    public function createSkill(array $payload): array {
        if (empty($payload['name'])) {
            throw new InvalidArgumentException("Nama skill tidak boleh kosong.");
        }

        $sql = "INSERT INTO skills (name, category) VALUES (:name, :category)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'     => trim($payload['name']),
            ':category' => trim($payload['category'] ?? 'General')
        ]);

        return [
            'message' => 'Skill berhasil ditambahkan.',
            'id'      => (int)$this->db->lastInsertId()
        ];
    }

    // 1. DELETE SKILL BY ID
    public function deleteSkill(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM skills WHERE id = :id");
        $stmt->execute([':id' => $id]);

        // rowCount() menghitung jumlah baris yang terpengaruh oleh query
        if ($stmt->rowCount() === 0) {
            throw new RuntimeException("Skill dengan ID {$id} tidak ditemukan.");
        }

        return ['message' => "Skill dengan ID {$id} berhasil dihapus."];
    }

    // 2. DELETE EXPERIENCE BY ID
    public function deleteExperience(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM experiences WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            throw new RuntimeException("Experience dengan ID {$id} tidak ditemukan.");
        }

        return ['message' => "Experience dengan ID {$id} berhasil dihapus."];
    }
}