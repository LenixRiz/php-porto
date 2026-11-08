<?php
// config/auth.php

return [
    // Ganti dengan string acak yang panjang dan aman
    'admin_token' => getenv('ADMIN_TOKEN') ?: 'marimaraw18'
];