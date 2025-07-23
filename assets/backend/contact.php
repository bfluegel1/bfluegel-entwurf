<?php
/**
 * =======================================================================
 * BASTIAN FLÜGEL WEBSITE - PHP BACKEND
 * =======================================================================
 * Complete PHP backend for contact form processing with .env support
 */

/**
 * =======================================================================
 * CONFIGURATION & ENVIRONMENT SETUP
 * =======================================================================
 */

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('Europe/Berlin');

// Headers for CORS and JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * =======================================================================
 * ENVIRONMENT LOADER CLASS
 * =======================================================================
 * Simple .env file parser without external dependencies
 */

class EnvLoader {
    private static $variables = [];
    
    /**
     * Load environment variables from .env file
     */
    public static function load($path = '.env') {
        if (!file_exists($path)) {
            throw new Exception(".env file not found at: $path");
        }
        
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments and empty lines
            if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
                continue;
            }
            
            // Parse key=value pairs
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                $value = trim($value, '"\'');
                
                // Store in class and $_ENV
                self::$variables[$key] = $value;
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
    
    /**
     * Get environment variable
     */
    public static function get($key, $default = null) {
        return self::$variables[$key] ?? $_ENV[$key] ?? getenv($key) ?? $default;
    }
    
    /**
     * Check if environment variable exists
     */
    public static function has($key) {
        return isset(self::$variables[$key]) || isset($_ENV[$key]) || getenv($key) !== false;
    }
}

/**
 * =======================================================================
 * CONFIGURATION CLASS
 * =======================================================================
 * Application configuration with .env support
 */

class Config {
    private static $config = [];
    
    /**
     * Initialize configuration
     */
    public static function init() {
        // Load .env file
        try {
            EnvLoader::load(__DIR__ . '/.env');
        } catch (Exception $e) {
            error_log("Environment file error: " . $e->getMessage());
        }
        
        // Application configuration
        self::$config = [
            // Application settings
            'app' => [
                'name' => EnvLoader::get('APP_NAME', 'Bastian Flügel Website'),
                'env' => EnvLoader::get('APP_ENV', 'production'),
                'debug' => EnvLoader::get('APP_DEBUG', 'false') === 'true',
                'url' => EnvLoader::get('APP_URL', 'https://bfluegel.de'),
                'timezone' => EnvLoader::get('APP_TIMEZONE', 'Europe/Berlin')
            ],
            
            // Mail configuration
            'mail' => [
                'driver' => EnvLoader::get('MAIL_DRIVER', 'smtp'),
                'host' => EnvLoader::get('MAIL_HOST', 'smtp.gmail.com'),
                'port' => (int)EnvLoader::get('MAIL_PORT', 587),
                'encryption' => EnvLoader::get('MAIL_ENCRYPTION', 'tls'),
                'username' => EnvLoader::get('MAIL_USERNAME'),
                'password' => EnvLoader::get('MAIL_PASSWORD'),
                'from_address' => EnvLoader::get('MAIL_FROM_ADDRESS', 'noreply@bastianfluegel.de'),
                'from_name' => EnvLoader::get('MAIL_FROM_NAME', 'Bastian Flügel Website'),
                'to_address' => EnvLoader::get('MAIL_TO_ADDRESS', 'info@bfluegel.de'),
                'to_name' => EnvLoader::get('MAIL_TO_NAME', 'Bastian Flügel')
            ],
            
            // Security settings
            'security' => [
                'csrf_token' => EnvLoader::get('CSRF_TOKEN'),
                'rate_limit' => (int)EnvLoader::get('RATE_LIMIT', 5),
                'rate_limit_window' => (int)EnvLoader::get('RATE_LIMIT_WINDOW', 3600),
                'max_file_size' => EnvLoader::get('MAX_FILE_SIZE', '5MB'),
                'allowed_origins' => explode(',', EnvLoader::get('ALLOWED_ORIGINS', '*'))
            ],
            
            // Database (if needed later)
            'database' => [
                'host' => EnvLoader::get('DB_HOST', 'localhost'),
                'port' => EnvLoader::get('DB_PORT', 3306),
                'database' => EnvLoader::get('DB_DATABASE'),
                'username' => EnvLoader::get('DB_USERNAME'),
                'password' => EnvLoader::get('DB_PASSWORD'),
                'charset' => EnvLoader::get('DB_CHARSET', 'utf8mb4')
            ]
        ];
    }
    
    /**
     * Get configuration value
     */
    public static function get($key, $default = null) {
        $keys = explode('.', $key);
        $value = self::$config;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }
}

/**
 * =======================================================================
 * MAILER CLASS
 * =======================================================================
 * Simple SMTP mailer without external dependencies
 */

class Mailer {
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
    }
    
    /**
     * Send email via SMTP
     */
    public function send($to, $subject, $body, $headers = []) {
        $defaultHeaders = [
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/html; charset=UTF-8',
            'From' => $this->config['from_name'] . ' <' . $this->config['from_address'] . '>',
            'Reply-To' => $this->config['from_address'],
            'X-Mailer' => 'PHP/' . phpversion()
        ];
        
        $headers = array_merge($defaultHeaders, $headers);
        
        // Build header string
        $headerString = '';
        foreach ($headers as $key => $value) {
            $headerString .= "$key: $value\r\n";
        }
        
        // Send email
        $success = mail($to, $subject, $body, $headerString);
        
        if (!$success) {
            throw new Exception('Failed to send email');
        }
        
        return true;
    }
    
    /**
     * Send contact form email
     */
    public function sendContactForm($data) {
        $subject = '[Kontaktformular] ' . ($data['subject_text'] ?? 'Neue Nachricht');
        
        $body = $this->buildContactEmailTemplate($data);
        
        return $this->send(
            $this->config['to_address'],
            $subject,
            $body,
            [
                'Reply-To' => $data['name'] . ' <' . $data['email'] . '>'
            ]
        );
    }
    
    /**
     * Build HTML email template for contact form
     */
    private function buildContactEmailTemplate($data) {
        $timestamp = date('d.m.Y H:i:s');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Kontaktformular</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f4f4f4; }
                .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .email-header { background: linear-gradient(135deg, #2D5016 0%, #4A6741 100%); color: white; padding: 20px; text-align: center; }
                .email-body { padding: 30px; }
                .field-group { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #2D5016; }
                .field-label { font-weight: bold; color: #2D5016; margin-bottom: 5px; }
                .field-value { background: white; padding: 10px; border-radius: 3px; border: 1px solid #ddd; }
                .message-field { min-height: 100px; }
                .email-footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                .timestamp { color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='email-header'>
                    <h1>🚀 Neue Kontaktanfrage</h1>
                    <p>Bastian Flügel Website</p>
                </div>
                
                <div class='email-body'>
                    <div class='field-group'>
                        <div class='field-label'>👤 Name:</div>
                        <div class='field-value'>" . htmlspecialchars($data['name']) . "</div>
                    </div>
                    
                    <div class='field-group'>
                        <div class='field-label'>📧 E-Mail:</div>
                        <div class='field-value'><a href='mailto:" . htmlspecialchars($data['email']) . "'>" . htmlspecialchars($data['email']) . "</a></div>
                    </div>
                    
                    " . (!empty($data['company']) ? "
                    <div class='field-group'>
                        <div class='field-label'>🏢 Unternehmen:</div>
                        <div class='field-value'>" . htmlspecialchars($data['company']) . "</div>
                    </div>
                    " : "") . "
                    
                    " . (!empty($data['phone']) ? "
                    <div class='field-group'>
                        <div class='field-label'>📞 Telefon:</div>
                        <div class='field-value'><a href='tel:" . htmlspecialchars($data['phone']) . "'>" . htmlspecialchars($data['phone']) . "</a></div>
                    </div>
                    " : "") . "
                    
                    <div class='field-group'>
                        <div class='field-label'>📋 Betreff:</div>
                        <div class='field-value'>" . htmlspecialchars($data['subject_text'] ?? 'Nicht angegeben') . "</div>
                    </div>
                    
                    <div class='field-group'>
                        <div class='field-label'>💬 Nachricht:</div>
                        <div class='field-value message-field'>" . nl2br(htmlspecialchars($data['message'])) . "</div>
                    </div>
                </div>
                
                <div class='email-footer'>
                    <p>📅 Eingegangen am: <span class='timestamp'>$timestamp</span></p>
                    <p>🌐 Gesendet über: " . htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'Website') . "</p>
                    <p>📧 Zum Antworten einfach auf diese E-Mail antworten.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}

/**
 * =======================================================================
 * CONTACT FORM HANDLER CLASS
 * =======================================================================
 * Main contact form processing logic
 */

class ContactFormHandler {
    private $config;
    private $mailer;
    
    public function __construct() {
        $this->config = Config::get('mail');
        $this->mailer = new Mailer($this->config);
    }
    
    /**
     * Process contact form submission
     */
    public function handle() {
        try {
            // Validate request method
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Only POST requests allowed', 405);
            }
            
            // Get and validate input data
            $data = $this->getInputData();
            $validatedData = $this->validateData($data);
            
            // Security checks
            $this->performSecurityChecks();
            
            // Send email
            $this->mailer->sendContactForm($validatedData);
            
            // Log successful submission
            $this->logSubmission($validatedData);
            
            // Return success response
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Nachricht erfolgreich gesendet!',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            return $this->handleError($e);
        }
    }
    
    /**
     * Get and sanitize input data
     */
    private function getInputData() {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            // JSON input
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data', 400);
            }
        } else {
            // Form data
            $data = $_POST;
        }
        
        // Sanitize all input
        return array_map(function($value) {
            return is_string($value) ? trim($value) : $value;
        }, $data);
    }
    
    /**
     * Validate form data
     */
    private function validateData($data) {
        $errors = [];
        
        // Required fields
        $required = ['name', 'email', 'subject', 'message'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $errors[] = "Feld '$field' ist erforderlich";
            }
        }
        
        // Email validation
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Ungültige E-Mail-Adresse';
        }
        
        // Length validation
        if (!empty($data['name']) && strlen($data['name']) > 100) {
            $errors[] = 'Name ist zu lang (max. 100 Zeichen)';
        }
        
        if (!empty($data['message']) && strlen($data['message']) > 5000) {
            $errors[] = 'Nachricht ist zu lang (max. 5000 Zeichen)';
        }
        
        // Subject mapping
        $subjectMap = [
            'beratung' => 'Beratungsanfrage',
            'projekt' => 'Projektanfrage',
            'schulung' => 'Schulung/Workshop',
            'partnership' => 'Partnerschaft',
            'sonstiges' => 'Sonstiges',
            'consulting' => 'Consulting Inquiry',
            'project' => 'Project Inquiry',
            'training' => 'Training/Workshop',
            'other' => 'Other'
        ];
        
        $data['subject_text'] = $subjectMap[$data['subject']] ?? $data['subject'];
        
        if (!empty($errors)) {
            throw new Exception('Validierungsfehler: ' . implode(', ', $errors), 400);
        }
        
        return $data;
    }
    
    /**
     * Perform security checks
     */
    private function performSecurityChecks() {
        // Rate limiting (simple file-based)
        $this->checkRateLimit();
        
        // Basic spam detection
        $this->checkSpam();
        
        // CSRF protection (if token provided)
        if (!empty($_POST['csrf_token'])) {
            $this->validateCSRFToken($_POST['csrf_token']);
        }
    }
    
    /**
     * Simple rate limiting
     */
    private function checkRateLimit() {
        $ip = $this->getClientIP();
        $rateLimitFile = sys_get_temp_dir() . '/contact_rate_limit_' . md5($ip);
        $maxRequests = Config::get('security.rate_limit', 5);
        $timeWindow = Config::get('security.rate_limit_window', 3600);
        
        $now = time();
        $requests = [];
        
        if (file_exists($rateLimitFile)) {
            $data = file_get_contents($rateLimitFile);
            $requests = json_decode($data, true) ?: [];
        }
        
        // Remove old requests outside time window
        $requests = array_filter($requests, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        // Check if limit exceeded
        if (count($requests) >= $maxRequests) {
            throw new Exception('Rate limit exceeded. Please try again later.', 429);
        }
        
        // Add current request
        $requests[] = $now;
        file_put_contents($rateLimitFile, json_encode($requests));
    }
    
    /**
     * Basic spam detection
     */
    private function checkSpam() {
        $message = $_POST['message'] ?? '';
        $name = $_POST['name'] ?? '';
        
        // Check for spam indicators
        $spamWords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'claim now'];
        $messageWords = strtolower($message . ' ' . $name);
        
        foreach ($spamWords as $spamWord) {
            if (strpos($messageWords, $spamWord) !== false) {
                throw new Exception('Message flagged as spam', 403);
            }
        }
        
        // Check for excessive links
        if (substr_count($message, 'http') > 3) {
            throw new Exception('Too many links in message', 403);
        }
    }
    
    /**
     * Validate CSRF token
     */
    private function validateCSRFToken($token) {
        $expectedToken = Config::get('security.csrf_token');
        if ($expectedToken && $token !== $expectedToken) {
            throw new Exception('Invalid CSRF token', 403);
        }
    }
    
    /**
     * Get client IP address
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    /**
     * Log successful submission
     */
    private function logSubmission($data) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $this->getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'email' => $data['email'],
            'subject' => $data['subject_text'],
            'success' => true
        ];
        
        $logFile = __DIR__ . '/logs/contact_form.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Handle errors and return error response
     */
    private function handleError($exception) {
        $code = $exception->getCode() ?: 500;
        $message = $exception->getMessage();
        
        // Log error
        error_log("Contact form error: $message");
        
        // Return appropriate HTTP status
        http_response_code($code);
        
        return $this->jsonResponse([
            'success' => false,
            'error' => $message,
            'code' => $code,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
    /**
     * Return JSON response
     */
    private function jsonResponse($data) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

/**
 * =======================================================================
 * MAIN EXECUTION
 * =======================================================================
 */

try {
    // Initialize configuration
    Config::init();
    
    // Handle contact form
    $handler = new ContactFormHandler();
    $handler->handle();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
}