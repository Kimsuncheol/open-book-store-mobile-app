// Toss Payments Service
import { CartItem } from '../context/SavedContext';

export const TOSS_CLIENT_KEY = process.env.TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

interface TossPaymentResponse {
  orderId: string;
  paymentKey?: string;
  checkoutUrl?: string;
}

/**
 * Initialize Toss Payment
 */
export const createTossPayment = async (
  amount: number,
  orderId: string,
  orderName: string
): Promise<TossPaymentResponse> => {
  // In production, this should call your backend to create a Toss payment
  return {
    orderId,
    checkoutUrl: `https://api.tosspayments.com/v1/payments/${orderId}`,
  };
};

/**
 * Verify Toss Payment
 */
export const verifyTossPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<boolean> => {
  // In production, verify payment with your backend
  // Backend should call Toss Payments API to confirm
  return true;
};

/**
 * Generate Toss Payments checkout HTML for WebView
 */
export const getTossCheckoutHtml = (
  amount: number,
  orderName: string,
  orderId: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          padding: 20px; 
          text-align: center; 
          background: #f8f9fa;
        }
        .item { 
          background: #ffffff; 
          padding: 24px; 
          border-radius: 12px; 
          margin: 20px 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .price { 
          font-size: 32px; 
          color: #1e2a78; 
          font-weight: bold; 
          margin: 16px 0;
        }
        #payment-button { 
          background: #1e2a78;
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
          width: 100%;
          max-width: 400px;
        }
        #payment-button:hover {
          background: #2c3da1;
        }
      </style>
      <script src="https://js.tosspayments.com/v1"></script>
    </head>
    <body>
      <h2>결제하기</h2>
      <div class="item">
        <h3>${orderName}</h3>
        <p class="price">₩${amount.toLocaleString()}</p>
      </div>
      <button id="payment-button">Toss Payments로 결제하기</button>
      <script>
        const clientKey = '${TOSS_CLIENT_KEY}';
        const tossPayments = TossPayments(clientKey);
        
        document.getElementById('payment-button').addEventListener('click', function() {
          tossPayments.requestPayment('카드', {
            amount: ${amount},
            orderId: '${orderId}',
            orderName: '${orderName}',
            successUrl: window.location.origin + '/payment/success',
            failUrl: window.location.origin + '/payment/fail',
          }).then(function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'success',
              paymentKey: response.paymentKey,
              orderId: response.orderId,
              amount: response.amount
            }));
          }).catch(function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          });
        });
      </script>
    </body>
    </html>
  `;
};

/**
 * Generate Toss Payments checkout HTML for cart
 */
export const getCartTossCheckoutHtml = (
  items: CartItem[],
  totalAmount: number,
  orderId: string
): string => {
  const itemsHtml = items.map(item => `
    <div class="cart-item">
      <span class="item-title">${item.book.title}</span>
      <span class="item-qty">x${item.quantity}</span>
      <span class="item-price">₩${(item.book.price * item.quantity * 1000).toLocaleString()}</span>
    </div>
  `).join('');

  const orderName = items.length === 1 
    ? items[0].book.title 
    : `${items[0].book.title} 외 ${items.length - 1}건`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          padding: 20px; 
          background: #f8f9fa;
        }
        h2 { text-align: center; color: #212529; }
        .cart-items { 
          background: #ffffff; 
          padding: 16px; 
          border-radius: 12px; 
          margin: 20px 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .cart-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e9ecef; 
        }
        .cart-item:last-child { border-bottom: none; }
        .item-title { flex: 1; font-weight: 500; }
        .item-qty { margin: 0 12px; color: #6c757d; }
        .total { 
          text-align: center; 
          font-size: 32px; 
          color: #1e2a78; 
          font-weight: bold; 
          margin: 24px 0; 
        }
        #payment-button { 
          background: #1e2a78;
          color: white;
          border: none;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
        }
      </style>
      <script src="https://js.tosspayments.com/v1"></script>
    </head>
    <body>
      <h2>결제하기</h2>
      <div class="cart-items">
        ${itemsHtml}
      </div>
      <div class="total">총 ₩${(totalAmount * 1000).toLocaleString()}</div>
      <button id="payment-button">Toss Payments로 결제하기</button>
      <script>
        const clientKey = '${TOSS_CLIENT_KEY}';
        const tossPayments = TossPayments(clientKey);
        
        document.getElementById('payment-button').addEventListener('click', function() {
          tossPayments.requestPayment('카드', {
            amount: ${Math.floor(totalAmount * 1000)},
            orderId: '${orderId}',
            orderName: '${orderName}',
            successUrl: window.location.origin + '/payment/success',
            failUrl: window.location.origin + '/payment/fail',
          }).then(function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'success',
              paymentKey: response.paymentKey,
              orderId: response.orderId,
              amount: response.amount
            }));
          }).catch(function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          });
        });
      </script>
    </body>
    </html>
  `;
};
