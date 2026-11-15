import { Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material'
import Add from '@mui/icons-material/Add'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import Close from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import { useState } from 'react'
import MediaPickerDialog from '../../../components/MediaPickerDialog'
import { BLOCK_TYPES, safeImage, safeLink } from '../../../components/home/blockTypes'

const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

function ImageField({ field, value, onChange }) {
  const [open, setOpen] = useState(false)
  const url = safeImage(value)
  const invalid = !!value && !url
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
        {field.label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            width: 96,
            height: 64,
            flexShrink: 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'text.disabled',
          }}
        >
          {url ? <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon />}
        </Box>
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
            {url ? 'Change picture' : 'Choose picture'}
          </Button>
          {value && (
            <Button size="small" color="inherit" startIcon={<Close fontSize="small" />} onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </Stack>
      </Stack>
      {(field.help || invalid) && (
        <Typography variant="caption" color={invalid ? 'error' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
          {invalid ? 'This picture address is not allowed. Choose a picture from the library.' : field.help}
        </Typography>
      )}
      <MediaPickerDialog
        open={open}
        selectedUrl={value}
        onClose={() => setOpen(false)}
        onSelect={(picked) => {
          onChange(picked)
          setOpen(false)
        }}
      />
    </Box>
  )
}

function Field({ field, value, onChange }) {
  switch (field.type) {
    case 'image':
      return <ImageField field={field} value={value} onChange={onChange} />

    case 'select':
      return (
        <TextField select size="small" label={field.label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} fullWidth>
          {field.options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      )

    case 'link': {
      const invalid = !!value && !safeLink(value)
      return (
        <TextField
          size="small"
          label={field.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={invalid}
          helperText={invalid ? 'Use /seats, /register, https://..., tel:... or mailto:...' : field.help || 'e.g. /seats, /register or https://...'}
          fullWidth
        />
      )
    }

    case 'items':
      return <ItemsField field={field} value={value} onChange={onChange} />

    default:
      return (
        <TextField
          size="small"
          label={field.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          multiline={field.type === 'multiline'}
          minRows={field.type === 'multiline' ? (field.rows ?? 3) : undefined}
          helperText={field.help}
          fullWidth
        />
      )
  }
}

function ItemsField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : []
  const [openIndex, setOpenIndex] = useState(null)
  const update = (index, changes) => onChange(items.map((item, i) => (i === index ? { ...item, ...changes } : item)))
  const atMax = field.max && items.length >= field.max

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        {field.label} ({items.length})
      </Typography>
      <Stack spacing={1}>
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const title = item[field.titleKey] || `${field.itemLabel} ${index + 1}`
          return (
            <Paper key={index} variant="outlined" sx={{ p: 1, borderColor: isOpen ? 'primary.main' : 'divider' }}>
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                {field.itemFields.some((f) => f.type === 'image') && (
                  <Box
                    component={safeImage(item.url) ? 'img' : 'div'}
                    src={safeImage(item.url) || undefined}
                    alt=""
                    sx={{ width: 36, height: 28, objectFit: 'cover', borderRadius: 0.5, mr: 1, bgcolor: 'action.hover', flexShrink: 0 }}
                  />
                )}
                <Typography
                  variant="body2"
                  noWrap
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  sx={{ flexGrow: 1, cursor: 'pointer', minWidth: 0 }}
                >
                  {title}
                </Typography>
                <IconButton size="small" onClick={() => onChange(move(items, index, index - 1))} disabled={index === 0} aria-label="Move up">
                  <ArrowUpward fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onChange(move(items, index, index + 1))}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDownward fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    onChange(items.filter((_, i) => i !== index))
                    setOpenIndex(null)
                  }}
                  aria-label="Delete"
                >
                  <Delete fontSize="inherit" />
                </IconButton>
              </Stack>
              {isOpen && (
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {field.itemFields.map((f) => (
                    <Field key={f.key} field={f} value={item[f.key]} onChange={(v) => update(index, { [f.key]: v })} />
                  ))}
                </Stack>
              )}
            </Paper>
          )
        })}
      </Stack>
      <Tooltip title={atMax ? `At most ${field.max}` : ''}>
        <span>
          <Button
            size="small"
            startIcon={<Add />}
            sx={{ mt: 1 }}
            disabled={atMax}
            onClick={() => {
              onChange([...items, structuredClone(field.newItem)])
              setOpenIndex(items.length)
            }}
          >
            Add {field.itemLabel.toLowerCase()}
          </Button>
        </span>
      </Tooltip>
    </Box>
  )
}

// Form for the selected block. onChange(changes) merges the changed fields into the block.
export default function BlockEditor({ block, onChange }) {
  const definition = BLOCK_TYPES[block.type]
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {definition.label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {definition.description}
        </Typography>
      </Box>
      {definition.fields.map((field) => (
        <Field key={field.key} field={field} value={block[field.key]} onChange={(value) => onChange({ [field.key]: value })} />
      ))}
      <Typography variant="caption" color="text.secondary">
        Tip: write {'{LibraryName}'} or {'{MonthlyFee}'} in any text to show the current values from Settings.
      </Typography>
    </Stack>
  )
}
