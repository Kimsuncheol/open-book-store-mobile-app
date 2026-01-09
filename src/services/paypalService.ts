import { PAYPAL_CLIENT_ID, PAYPAL_SANDBOX_URL } from '../config/firebase';
import { CartItem } from '../context/SavedContext';

interface PayPalOrder {
  orderId: string;
  approvalUrl: string;
}

// Create PayPal order for a single book
export const createPayPalOrder = async (amount: number, bookId: string): Promise<PayPalOrder> => {
  // In production, this should call your backend to create a PayPal order
  // For now, we return a mock approval URL
  const orderId = `ORDER_${Date.now()}`;
  const approvalUrl = `${PAYPAL_SANDBOX_URL}/checkoutnow?token=${orderId}`;
  
  return { orderId, approvalUrl };
};

// Create PayPal order for cart items
export const createCartOrder = async (items: CartItem[], totalAmount: number): Promise<PayPalOrder> => {
  // In production, this should call your backend to create a PayPal order for the cart
  const orderId = `CART_ORDER_${Date.now()}`;
  const approvalUrl = `${PAYPAL_SANDBOX_URL}/checkoutnow?token=${orderId}`;
  
  return { orderId, approvalUrl };
};

// Verify PayPal payment
export const verifyPayPalPayment = async (orderId: string): Promise<boolean> => {
  // In production, verify with your backend
  // This is a mock implementation
  return true;
};

// Generate PayPal checkout HTML for WebView (single book)
export const getPayPalCheckoutHtml = (amount: number, bookTitle: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; text-align: center; }
        .item { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .price { font-size: 24px; color: #0070ba; font-weight: bold; }
        #paypal-button-container { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h2>Complete Purchase</h2>
      <div class="item">
        <h3>${bookTitle}</h3>
        <p class="price">$${amount.toFixed(2)}</p>
      </div>
      <div id="paypal-button-container"></div>
      <script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD"></script>
      <script>
        paypal.Buttons({
          createOrder: function(data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: { value: '${amount.toFixed(2)}' }
              }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'success',
                orderId: data.orderID,
                payerId: details.payer.payer_id
              }));
            });
          },
          onCancel: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
          },
          onError: function(err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: err.toString() }));
          }
        }).render('#paypal-button-container');
      </script>
    </body>
    </html>
  `;
};

// Generate PayPal checkout HTML for cart
export const getCartCheckoutHtml = (items: CartItem[], totalAmount: number): string => {
  const itemsHtml = items.map(item => `
    <div class="cart-item">
      <span class="item-title">${item.book.title}</span>
      <span class="item-qty">x${item.quantity}</span>
      <span class="item-price">$${(item.book.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; }
        h2 { text-align: center; }
        .cart-items { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .cart-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .cart-item:last-child { border-bottom: none; }
        .item-title { flex: 1; font-weight: 500; }
        .item-qty { margin: 0 10px; color: #666; }
        .total { text-align: center; font-size: 24px; color: #0070ba; font-weight: bold; margin: 20px 0; }
        #paypal-button-container { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h2>Complete Cart Purchase</h2>
      <div class="cart-items">
        ${itemsHtml}
      </div>
      <div class="total">Total: $${totalAmount.toFixed(2)}</div>
      <div id="paypal-button-container"></div>
      <script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD"></script>
      <script>
        paypal.Buttons({
          createOrder: function(data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: { value: '${totalAmount.toFixed(2)}' }
              }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'success',
                orderId: data.orderID,
                payerId: details.payer.payer_id
              }));
            });
          },
          onCancel: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
          },
          onError: function(err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: err.toString() }));
          }
        }).render('#paypal-button-container');
      </script>
    </body>
    </html>
  `;
};
