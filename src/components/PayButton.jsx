import { Button } from '@mui/material'
import { useState } from 'react'
import { paymentsApi } from '../api/endpoints'
import MockPaymentDialog from '../pages/MockPaymentDialog'
import { getErrorMessage } from '../utils/errors'
import { openRazorpayCheckout } from '../utils/razorpay'

// Whole online payment flow behind one button:
//   createOrder() -> Mock dialog or Razorpay Checkout -> POST /payments/verify (or /payments/failed)
// onPaid(result)    payment confirmed (result = PaymentResultDto)
// onProblem(text)   paid but could not be applied (refund case), or payment failed / closed
export default function PayButton({ createOrder, onPaid, onProblem, children = 'Pay now', disabled, ...buttonProps }) {
  const [busy, setBusy] = useState(false)
  const [mockOrder, setMockOrder] = useState(null)

  const verify = async (payment) => {
    setMockOrder(null)
    setBusy(true)
    try {
      const result = await paymentsApi.verify(payment)
      if (result.outcome === 'SeatLost' || result.outcome === 'InvoiceClosed') onProblem?.(result.message, true)
      else onPaid?.(result)
    } catch (err) {
      onProblem?.(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fail = async (order, reason, paymentId) => {
    setMockOrder(null)
    setBusy(false)
    onProblem?.(`Payment not completed: ${reason}. You can try again.`)
    try {
      await paymentsApi.failed({ orderId: order.orderId, paymentId, reason })
    } catch {
      // Only bookkeeping
    }
  }

  const handleClick = async () => {
    setBusy(true)
    let order
    try {
      order = await createOrder()
    } catch (err) {
      setBusy(false)
      onProblem?.(getErrorMessage(err))
      return
    }

    if (order.provider === 'Mock') {
      setMockOrder(order)
      return
    }
    try {
      await verify(await openRazorpayCheckout(order))
    } catch (failure) {
      if (failure instanceof Error) {
        setBusy(false)
        onProblem?.(failure.message)
      } else {
        fail(order, failure.reason, failure.paymentId)
      }
    }
  }

  return (
    <>
      <Button variant="contained" onClick={handleClick} disabled={disabled || busy} {...buttonProps}>
        {busy ? 'Processing…' : children}
      </Button>
      {mockOrder && (
        <MockPaymentDialog order={mockOrder} onSuccess={verify} onFailure={(reason, paymentId) => fail(mockOrder, reason, paymentId)} />
      )}
    </>
  )
}
