<?php
// admin/index.php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit;
}
require_once '../config.php';

// Handle order completion
if (isset($_GET['complete'])) {
    $id = (int)$_GET['complete'];
    $conn->query("UPDATE orders SET status='Completed' WHERE id=$id");
    header("Location: index.php");
    exit;
}

// Fetch all orders
$result = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dagu Perfume - Admin Panel</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; background: #6E1324; color: #fff; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        .logout-btn { background: #fff; color: #6E1324; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #555; }
        tr:hover { background: #fcfcfc; }
        .status-pending { color: #d97706; font-weight: bold; }
        .status-completed { color: #059669; font-weight: bold; }
        .btn-complete { background: #10b981; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px; }
        .btn-complete:hover { background: #059669; }
        .items-list { margin: 0; padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Dagu Perfume Orders</h2>
            <a href="logout.php" class="logout-btn">Logout</a>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Customer Info</th>
                    <th>Payment</th>
                    <th>Order Details</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($result && $result->num_rows > 0): ?>
                    <?php while($row = $result->fetch_assoc()): ?>
                    <tr>
                        <td>#<?= $row['id'] ?></td>
                        <td><?= date('M d, Y H:i', strtotime($row['created_at'])) ?></td>
                        <td>
                            <strong><?= htmlspecialchars($row['customer_name']) ?></strong><br>
                            <?= htmlspecialchars($row['phone']) ?>
                        </td>
                        <td>
                            <?= htmlspecialchars($row['payment_method']) ?><br>
                            <small>TxID: <?= htmlspecialchars($row['tx_id']) ?></small>
                        </td>
                        <td>
                            <ul class="items-list">
                            <?php
                            $items = json_decode($row['items'], true);
                            if($items) {
                                foreach($items as $item) {
                                    echo "<li>" . htmlspecialchars($item['quantity'] . 'x ' . $item['name']) . "</li>";
                                }
                            }
                            ?>
                            </ul>
                        </td>
                        <td><strong><?= number_format($row['total_amount'], 2) ?> ETB</strong></td>
                        <td class="<?= $row['status'] === 'Completed' ? 'status-completed' : 'status-pending' ?>">
                            <?= $row['status'] ?>
                        </td>
                        <td>
                            <?php if($row['status'] !== 'Completed'): ?>
                                <a href="?complete=<?= $row['id'] ?>" class="btn-complete">Mark Done</a>
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr><td colspan="8" style="text-align:center;">No orders found.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
