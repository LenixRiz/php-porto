<?php

require_once __DIR__ . '/../Database.php';

class PortofolioController {
    public function getPortofolio(): array {
        $db = Database::getConnection();

        // Fetch hero title and description
        $stmtSettings = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $settings = $stmtSettings->fetchAll(PDO::FETCH_KEY_PAIR);

        // Fetch experiences
        $stmtExp = $db->query("SELECT id, role, company, description, start_date, end_date FROM experiences ORDER BY start_date DESC");
        $experiences = $stmtExp->fetchAll();

        // Fetch skills
        $stmtSkills = $db->query("SELECT id, name, category FROM skills ORDER BY category ASC, name ASC");
        $skills = $stmtSkills->fetchAll();

        return [
            'hero' => [
                'title' => $settings['hero_title'] ?? '',
                'description' => $settings['hero_description'] ?? '',
            ],
            'experiences' => $experiences,
            'skills' => $skills,
        ];
    }
}