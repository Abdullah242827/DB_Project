<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['election_id'], $data['candidate_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$user_id = $_SESSION['user_id'];
$election_id = intval($data['election_id']);
$candidate_id = intval($data['candidate_id']);

// Check if election is active
$sql = "SELECT status FROM Elections WHERE election_id = $election_id";
$result = $conn->query($sql);
if (!$result || $result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Election not found']);
    exit;
}
$row = $result->fetch_assoc();
if ($row['status'] !== 'active') {
    echo json_encode(['success' => false, 'message' => 'Election is not active']);
    exit;
}

// Check if user has already voted in this election
$sql = "SELECT id FROM Votes WHERE user_id = $user_id AND election_id = $election_id";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'You have already voted in this election']);
    exit;
}

// Insert vote
$vote_time = date('Y-m-d H:i:s');
$stmt = $conn->prepare("INSERT INTO Votes (user_id, election_id, candidate_id, vote_time) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiis", $user_id, $election_id, $candidate_id, $vote_time);
if ($stmt->execute()) {
    // Log admin action (optional)
    $stmt_log = $conn->prepare("INSERT INTO AdminLogs (admin_id, action, action_time) VALUES (?, ?, ?)");
    $admin_id = $user_id; // Assuming user is admin or log user id
    $action = "User $user_id voted for candidate $candidate_id in election $election_id";
    $action_time = $vote_time;
    $stmt_log->bind_param("iss", $admin_id, $action, $action_time);
    $stmt_log->execute();
    $stmt_log->close();

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error recording vote: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
