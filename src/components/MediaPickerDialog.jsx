import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Delete from '@mui/icons-material/Delete'
import Upload from '@mui/icons-material/Upload'
import { useEffect, useRef, useState } from 'react'
import { mediaApi } from '../api/endpoints'
import { safeImage } from './home/blockTypes'
import { getErrorMessage } from '../utils/errors'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

// Image library: upload new pictures, pick one (onSelect(url)) or delete unused ones.
export default function MediaPickerDialog({ open, onClose, onSelect, selectedUrl }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const fileInput = useRef(null)

  useEffect(() => {
    if (!open) return
    setError('')
    mediaApi
      .getAll()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
  }, [open])

  const handleFiles = async (files) => {
    setError('')
    for (const file of files) {
      setProgress(0)
      try {
        const asset = await mediaApi.upload(file, setProgress)
        setItems((list) => [asset, ...(list ?? [])])
      } catch (err) {
        setError(`${file.name}: ${getErrorMessage(err)}`)
      }
    }
    setProgress(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.fileName}"? This cannot be undone.`)) return
    setDeletingId(asset.id)
    setError('')
    try {
      await mediaApi.remove(asset.id)
      setItems((list) => list.filter((a) => a.id !== asset.id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Pictures</span>
          <Button variant="contained" startIcon={<Upload />} onClick={() => fileInput.current?.click()} disabled={progress !== null}>
            Upload
          </Button>
        </Stack>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => e.target.files?.length && handleFiles([...e.target.files])}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          JPG, PNG, WEBP or GIF, up to 5 MB. Wide photos (about 1600 × 900) look best in banners.
        </Typography>
        {progress !== null && <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!items ? (
          !error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )
        ) : items.length === 0 ? (
          <Box
            onClick={() => fileInput.current?.click()}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 2,
              py: 8,
              textAlign: 'center',
              color: 'text.secondary',
              cursor: 'pointer',
            }}
          >
            <Upload fontSize="large" />
            <Typography>No pictures yet. Click to upload your first one.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {items.map((asset) => {
              const selected = asset.url === selectedUrl
              return (
                <Box
                  key={asset.id}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: 2,
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: 'background.default',
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onSelect?.(asset.url)}
                    disabled={!onSelect}
                    sx={{ p: 0, border: 0, display: 'block', width: '100%', cursor: onSelect ? 'pointer' : 'default', bgcolor: 'transparent' }}
                  >
                    <Box component="img" src={safeImage(asset.url) || asset.url} alt={asset.fileName} loading="lazy" sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
                  </Box>
                  <Stack direction="row" sx={{ alignItems: 'center', px: 1, py: 0.5 }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="caption" noWrap component="div" title={asset.fileName}>
                        {asset.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(asset.sizeBytes)}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton size="small" onClick={() => handleDelete(asset)} disabled={deletingId === asset.id}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  {selected && <CheckCircle color="primary" sx={{ position: 'absolute', top: 6, right: 6, bgcolor: '#fff', borderRadius: '50%' }} />}
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
