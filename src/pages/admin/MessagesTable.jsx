import { Box, Button, Chip, Collapse, IconButton, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import { Fragment, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CHANNEL_LABELS, MESSAGE_STATUS_CHIPS, formatDateTime } from '../../utils/format'

// List of queued / sent messages. Click a row to see the full text and any error.
export default function MessagesTable({ messages, showStudent = true, onRetry, onCancel }) {
  const [openId, setOpenId] = useState(null)

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>Queued</TableCell>
          {showStudent && <TableCell>Student</TableCell>}
          <TableCell>Event</TableCell>
          <TableCell>Channel</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {messages.map((m) => {
          const chip = MESSAGE_STATUS_CHIPS[m.status] ?? { label: m.status, color: 'default' }
          const open = openId === m.id
          return (
            <Fragment key={m.id}>
              <TableRow hover sx={{ cursor: 'pointer', '& > td': { borderBottom: open ? 'none' : undefined } }} onClick={() => setOpenId(open ? null : m.id)}>
                <TableCell padding="checkbox">
                  <IconButton size="small">{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(m.createdAt)}</TableCell>
                {showStudent && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Link component={RouterLink} to={`/admin/students/${m.studentId}`}>
                      {m.studentName}
                    </Link>
                  </TableCell>
                )}
                <TableCell>{m.eventName}</TableCell>
                <TableCell>{CHANNEL_LABELS[m.channel] ?? m.channel}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.recipient}</TableCell>
                <TableCell>
                  <Chip size="small" label={chip.label} color={chip.color} />
                  {m.provider === 'Mock' && m.status === 'Sent' && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      (mock)
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                  {['Failed', 'Skipped', 'Cancelled'].includes(m.status) && onRetry && (
                    <Button size="small" onClick={() => onRetry(m)}>
                      Send again
                    </Button>
                  )}
                  {m.status === 'Ready' && onCancel && (
                    <Button size="small" color="inherit" onClick={() => onCancel(m)}>
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={showStudent ? 8 : 7} sx={{ py: 0 }}>
                  <Collapse in={open} unmountOnExit>
                    <Box sx={{ py: 2, px: 1 }}>
                      {m.subject && (
                        <Typography variant="subtitle2" gutterBottom>
                          {m.subject}
                        </Typography>
                      )}
                      {/* Email bodies are HTML; show them as plain text with line breaks for safety */}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        {m.body.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')}
                      </Typography>
                      {m.status === 'Ready' && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Waiting for the background job (runs every minute). Placeholders are filled in when it is sent.
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Attempts {m.attempts}/{m.maxAttempts}
                        {m.provider && ` · via ${m.provider}`}
                        {m.sentAt && ` · sent ${formatDateTime(m.sentAt)}`}
                        {m.status === 'Ready' && m.attempts > 0 && ` · next try ${formatDateTime(m.nextAttemptAt)}`}
                      </Typography>
                      {m.lastError && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          {m.lastError}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}
