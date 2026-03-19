<?php
// api/place_order.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../config.php';
    
    // Get JSON input
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid data"]);
        exit;
    }

    $name = $conn->real_escape_string($data->name);
    $phone = $conn->real_escape_string($data->phone);
    $method = $conn->real_escape_string($data->method);
    $txId = $conn->real_escape_string($data->txId);
    $total = (float)$data->total;
    $items = $conn->real_escape_string(json_encode($data->items));

    $sql = "INSERT INTO orders (customer_name, phone, payment_method, tx_id, total_amount, items)
            VALUES ('$name', '$phone', '$method', '$txId', $total, '$items')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Order placed successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
