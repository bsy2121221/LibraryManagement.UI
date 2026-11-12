import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import QrCode2 from '@mui/icons-material/QrCode2'
import { useState } from 'react'
import { formatMoney } from '../utils/format'

// Stands in for Razorpay Checkout while "Payment:Provider" is "Mock" in the API. No money moves.
// Must match MockPaymentGateway.SuccessSignature in the API
const MOCK_SUCCESS_SIGNATURE = 'mock_signature_success'

export default function MockPaymentDialog({ order, onSuccess, onFailure }) {
  const [paymentId] = useState(() => `pay_mock_${Date.now()}`)

  return (
    <Dialog open onClose={() => onFailure('Payment window closed')} maxWidth="xs" fullWidth>
      <DialogTitle>Test payment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Alert severity="warning" sx={{ width: '100%', textAlign: 'left' }}>
            Mock payment gateway. Set <code>Payment:Provider</code> to <code>Razorpay</code> in the API&apos;s appsettings.json for real UPI payments.
          </Alert>
          <Typography color="text.secondary">{order.libraryName}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatMoney(order.amount, order.currency)}
          </Typography>
          <Typography variant="body2">{order.description}</Typography>
          <Box sx={{ color: 'text.disabled' }}>
            <QrCode2 sx={{ fontSize: 96 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Order {order.orderId}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button color="error" onClick={() => onFailure('Payment failed (simulated)', paymentId)}>
          Simulate failure
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => onSuccess({ orderId: order.orderId, paymentId, signature: MOCK_SUCCESS_SIGNATURE })}
        >
          Pay (simulate success)
        </Button>
      </DialogActions>
    </Dialog>
  )
}
