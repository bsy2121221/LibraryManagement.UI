// Loads Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js) once, on first use
let loader = null

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)

  loader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => {
      loader = null
      reject(new Error('Could not load Razorpay. Check your internet connection.'))
    }
    document.body.appendChild(script)
  })
  return loader
}

// Opens Razorpay Checkout for an order from POST /bookings/{id}/payment-order.
// Resolves with { orderId, paymentId, signature } on success; rejects with { reason, paymentId } on failure/close.
export async function openRazorpayCheckout(order) {
  const Razorpay = await loadRazorpay()

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountInPaise,
      currency: order.currency,
      name: order.libraryName,
      description: order.description,
      prefill: { name: order.prefill.name, contact: order.prefill.contact, email: order.prefill.email || undefined },
      theme: { color: '#283593' },
      handler: (response) =>
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      modal: { ondismiss: () => reject({ reason: 'Payment window closed' }) },
    })

    checkout.on('payment.failed', (response) =>
      reject({ reason: response.error?.description || 'Payment failed', paymentId: response.error?.metadata?.payment_id }),
    )
    checkout.open()
  })
}
