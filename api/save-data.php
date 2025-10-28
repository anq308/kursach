<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataDir = '../data/';

function readJSON($file) {
    $path = $GLOBALS['dataDir'] . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        return json_decode($content, true);
    }
    return null;
}

function writeJSON($file, $data) {
    $path = $GLOBALS['dataDir'] . $file;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($path, $json);
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'addUser':
        $data = json_decode(file_get_contents('php://input'), true);
        $users = readJSON('users.json');
        
        $newUser = [
            'id' => 'u' . time(),
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'] ?? 'client',
            'status' => $data['status'] ?? 'active',
            'createdAt' => date('c')
        ];
        
        $users['users'][] = $newUser;
        writeJSON('users.json', $users);
        
        echo json_encode(['success' => true, 'user' => $newUser]);
        break;
    
    case 'addReview':
        $data = json_decode(file_get_contents('php://input'), true);
        $reviews = readJSON('reviews.json');
        
        $newReview = [
            'id' => 'r' . time(),
            'userId' => $data['userId'],
            'menuItemId' => $data['menuItemId'] ?? null,
            'text' => $data['text'],
            'status' => 'pending',
            'isAnonymous' => $data['isAnonymous'] ?? false,
            'createdAt' => date('c')
        ];
        
        $reviews['reviews'][] = $newReview;
        writeJSON('reviews.json', $reviews);
        
        echo json_encode(['success' => true, 'review' => $newReview]);
        break;
    
    case 'addRating':
        $data = json_decode(file_get_contents('php://input'), true);
        $ratings = readJSON('ratings.json');
        
        $average = ($data['quality'] + $data['taste'] + $data['service'] + 
                   $data['atmosphere'] + $data['valueForMoney']) / 5;
        
        $newRating = [
            'id' => 'ra' . time(),
            'reviewId' => $data['reviewId'],
            'quality' => (int)$data['quality'],
            'taste' => (int)$data['taste'],
            'service' => (int)$data['service'],
            'atmosphere' => (int)$data['atmosphere'],
            'valueForMoney' => (int)$data['valueForMoney'],
            'average' => round($average, 1)
        ];
        
        $ratings['ratings'][] = $newRating;
        writeJSON('ratings.json', $ratings);
        
        echo json_encode(['success' => true, 'rating' => $newRating]);
        break;
    
    case 'updateReviewStatus':
        $data = json_decode(file_get_contents('php://input'), true);
        $reviews = readJSON('reviews.json');
        
        foreach ($reviews['reviews'] as &$review) {
            if ($review['id'] === $data['reviewId']) {
                $review['status'] = $data['status'];
                break;
            }
        }
        
        writeJSON('reviews.json', $reviews);
        
        echo json_encode(['success' => true]);
        break;
    
    case 'getAllData':
        $users = readJSON('users.json');
        $menuItems = readJSON('menuItems.json');
        $reviews = readJSON('reviews.json');
        $ratings = readJSON('ratings.json');
        
        echo json_encode([
            'users' => $users['users'],
            'menuItems' => $menuItems['menuItems'],
            'reviews' => $reviews['reviews'],
            'ratings' => $ratings['ratings']
        ]);
        break;
    
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?>
