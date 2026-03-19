Dagu Perfume - InfinityFree PHP Backend
=======================================

This folder contains a simple PHP backend and admin panel for your Dagu Perfume e-commerce site.

HOW TO DEPLOY TO INFINITYFREE:
1. Go to your InfinityFree control panel (vPanel).
2. Open the "MySQL Databases" section. Create a new database (e.g., `epiz_12345678_dagu`).
3. Open "phpMyAdmin" for that database.
4. Import the `setup.sql` file to create the `orders` table.
5. Open `config.php` and update the database credentials to match your InfinityFree details.
6. Upload this entire folder (`api`, `admin`, `config.php`) to your `htdocs` folder using the File Manager or FTP.

HOW TO CONNECT YOUR REACT APP:
In your React app (`src/App.tsx`), inside the `handleCheckoutSubmit` function, you can send the order data to your new PHP API like this:

```javascript
const orderData = {
  name: checkoutForm.name,
  phone: checkoutForm.phone,
  method: checkoutForm.paymentMethod,
  txId: checkoutForm.txId,
  total: cartTotal,
  items: cart
};

fetch('http://YOUR_INFINITYFREE_DOMAIN.com/api/place_order.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})
.then(res => res.json())
.then(data => {
  if(data.success) {
    alert("Order placed successfully!");
    setCart([]);
    setIsCheckoutOpen(false);
  } else {
    alert("Error placing order.");
  }
});
```

ADMIN PANEL:
Access your admin panel at: `http://YOUR_INFINITYFREE_DOMAIN.com/admin/`
Default Login:
Username: admin
Password: admin123

(Make sure to change these in `admin/login.php` before going live!)
