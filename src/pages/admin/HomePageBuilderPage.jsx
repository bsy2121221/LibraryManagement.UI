import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Delete from '@mui/icons-material/Delete'
import DragIndicator from '@mui/icons-material/DragIndicator'
import History from '@mui/icons-material/History'
import Lock from '@mui/icons-material/Lock'
import OpenInNew from '@mui/icons-material/OpenInNew'
import Publish from '@mui/icons-material/Publish'
import RestartAlt from '@mui/icons-material/RestartAlt'
import Save from '@mui/icons-material/Save'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useBlocker } from 'react-router-dom'
import { adminHomePageApi } from '../../api/endpoints'
import SiteFooter from '../../components/SiteFooter'
import { HomeBlock } from '../../components/home/HomeBlocks'
import { BLOCK_TYPES, BLOCK_TYPE_KEYS, createBlock, defaultLayout, newId, normalizeLayout } from '../../components/home/blockTypes'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import BlockEditor from './home/BlockEditor'

const MAX_BLOCKS = 40

const move = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

// Short text shown under each block in the list
function blockSummary(block) {
  const text = block.title || block.eyebrow || block.text || ''
  return String(text).replace(/\s+/g, ' ').slice(0, 60)
}

// A label over the parts of the page the admin cannot change here
function FixedPartLabel({ children }) {
  return (
    <Chip
      icon={<Lock />}
      label={children}
      size="small"
      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,.95)', boxShadow: 1 }}
    />
  )
}

function VersionsDialog({ open, onClose, onLoad, onPublish, busy }) {
  const [versions, setVersions] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setVersions(null)
    setError('')
    adminHomePageApi
      .versions()
      .then(setVersions)
      .catch((err) => setError(getErrorMessage(err)))
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Saved versions</DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>
          Every save is kept. Open an older version to edit it, or publish it to roll the website back.
        </DialogContentText>
        {error && <Alert severity="error">{error}</Alert>}
        {!versions && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {versions?.length === 0 && <Typography color="text.secondary">Nothing saved yet.</Typography>}
        {versions?.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Saved</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>v{v.version}</TableCell>
                  <TableCell>
                    {v.isLive ? (
                      <Chip size="small" color="success" label="Live" />
                    ) : (
                      <Chip size="small" variant="outlined" label={v.status === 'Published' ? 'Published before' : 'Draft'} />
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(v.createdAt)}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      by {v.createdByName}
                    </Typography>
                  </TableCell>
                  <TableCell>{v.publishedAt ? formatDateTime(v.publishedAt) : '—'}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" onClick={() => onLoad(v.id)} disabled={busy}>
                      Open
                    </Button>
                    {!v.isLive && (
                      <Button size="small" onClick={() => onPublish(v.id)} disabled={busy}>
                        Publish
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// Admin: design the home page from blocks. The header and footer are fixed (footer details come from Settings).
export default function HomePageBuilderPage() {
  const settings = usePublicSettings()
  const [layout, setLayout] = useState(null)
  // The saved version shown in the editor: { id, version, status, isLive } or null (not saved yet)
  const [current, setCurrent] = useState(null)
  const [savedJson, setSavedJson] = useState('')
  const [liveVersion, setLiveVersion] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [addMenu, setAddMenu] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const applyVersion = useCallback((version) => {
    const next = version?.layout ? normalizeLayout(version.layout) : defaultLayout()
    setLayout(next)
    setSavedJson(JSON.stringify(next))
    setCurrent(version ? { id: version.id, version: version.version, status: version.status, isLive: version.isLive } : null)
    setSelectedId(next.blocks[0]?.id ?? null)
  }, [])

  useEffect(() => {
    adminHomePageApi
      .get()
      .then((data) => {
        applyVersion(data.latest)
        setLiveVersion(data.liveVersion ?? null)
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [applyVersion])

  const layoutJson = useMemo(() => (layout ? JSON.stringify(layout) : ''), [layout])
  const isDirty = !!layout && layoutJson !== savedJson

  useEffect(() => {
    if (!isDirty) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname)

  if (!layout) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const blocks = layout.blocks
  const selected = blocks.find((b) => b.id === selectedId) ?? null
  const setBlocks = (updater) => setLayout((l) => ({ ...l, blocks: typeof updater === 'function' ? updater(l.blocks) : updater }))

  const updateBlock = (id, changes) => setBlocks((list) => list.map((b) => (b.id === id ? { ...b, ...changes } : b)))

  const addBlock = (type) => {
    const block = createBlock(type)
    const index = selected ? blocks.indexOf(selected) + 1 : blocks.length
    setBlocks((list) => [...list.slice(0, index), block, ...list.slice(index)])
    setSelectedId(block.id)
    setAddMenu(null)
  }

  const duplicateBlock = (block) => {
    const copy = { ...structuredClone(block), id: newId() }
    setBlocks((list) => {
      const index = list.findIndex((b) => b.id === block.id)
      return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)]
    })
    setSelectedId(copy.id)
  }

  const removeBlock = (block) => {
    const index = blocks.indexOf(block)
    setBlocks((list) => list.filter((b) => b.id !== block.id))
    setSelectedId(blocks[index + 1]?.id ?? blocks[index - 1]?.id ?? null)
  }

  const run = async (action, message) => {
    setBusy(true)
    setError('')
    try {
      const version = await action()
      applyVersion(version)
      if (version.isLive) setLiveVersion(version.version)
      setToast(message)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleSaveDraft = () => run(() => adminHomePageApi.save(layout, false), 'Draft saved. Visitors still see the live version.')

  const handlePublish = () => {
    if (isDirty || !current) return run(() => adminHomePageApi.save(layout, true), 'Published. The website now shows this design.')
    return run(() => adminHomePageApi.publish(current.id), 'Published. The website now shows this design.')
  }

  const handleLoadVersion = async (id) => {
    if (isDirty && !window.confirm('Your unsaved changes will be lost. Open this version?')) return
    setBusy(true)
    try {
      applyVersion(await adminHomePageApi.version(id))
      setHistoryOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handlePublishVersion = async (id) => {
    if (isDirty && !window.confirm('Your unsaved changes will be lost. Publish this version?')) return
    if (await run(() => adminHomePageApi.publish(id), 'Published. The website now shows this version.')) setHistoryOpen(false)
  }

  const handleReset = () => {
    if (!window.confirm('Replace the page in the editor with the default design? Nothing changes on the website until you publish.')) return
    const next = defaultLayout()
    setLayout(next)
    setSelectedId(next.blocks[0]?.id ?? null)
  }

  const handleDrop = (index) => {
    if (dragIndex !== null) setBlocks((list) => move(list, dragIndex, index))
    setDragIndex(null)
  }

  const alreadyLive = !isDirty && current?.isLive
  const status = !current
    ? 'Not saved yet — the website shows the default design.'
    : `Editing v${current.version} (${current.isLive ? 'live' : current.status === 'Published' ? 'published before' : 'draft'})` +
      (liveVersion && !current.isLive ? ` · Live on the website: v${liveVersion}` : '') +
      (isDirty ? ' · Unsaved changes' : '')

  return (
    <>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { lg: 'center' }, mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Home page
          </Typography>
          <Typography color={isDirty ? 'warning.main' : 'text.secondary'}>{status}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Button component={RouterLink} to="/" target="_blank" startIcon={<OpenInNew />}>
            View website
          </Button>
          <Button startIcon={<History />} onClick={() => setHistoryOpen(true)} disabled={busy}>
            Versions
          </Button>
          <Button startIcon={<RestartAlt />} onClick={handleReset} disabled={busy}>
            Default design
          </Button>
          <Button variant="outlined" startIcon={<Save />} onClick={handleSaveDraft} disabled={busy || !isDirty}>
            Save draft
          </Button>
          <Button variant="contained" startIcon={<Publish />} onClick={handlePublish} disabled={busy || alreadyLive}>
            {alreadyLive ? 'Live' : 'Publish'}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '380px minmax(0, 1fr)' }, alignItems: 'start' }}>
        {/* Left: block list + editor */}
        <Stack spacing={2}>
          <Paper variant="outlined">
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1.5, pb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Blocks
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={(e) => setAddMenu(e.currentTarget)}
                disabled={blocks.length >= MAX_BLOCKS}
              >
                Add block
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block' }}>
              Drag to reorder. Header and footer are fixed and always shown.
            </Typography>
            <List dense sx={{ pb: 1 }}>
              {blocks.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                  The page is empty. Add a block to start.
                </Typography>
              )}
              {blocks.map((block, index) => (
                <ListItemButton
                  key={block.id}
                  selected={block.id === selectedId}
                  onClick={() => setSelectedId(block.id)}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  sx={{ pr: 0.5, opacity: dragIndex === index ? 0.4 : 1 }}
                >
                  <DragIndicator fontSize="small" sx={{ color: 'text.disabled', mr: 1, cursor: 'grab' }} />
                  <ListItemText
                    primary={`${index + 1}. ${BLOCK_TYPES[block.type].label}`}
                    secondary={blockSummary(block) || ' '}
                    slotProps={{ secondary: { noWrap: true } }}
                    sx={{ minWidth: 0 }}
                  />
                  <Stack direction="row" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => setBlocks((l) => move(l, index, index - 1))} disabled={index === 0} aria-label="Move up">
                      <ArrowUpward fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setBlocks((l) => move(l, index, index + 1))}
                      disabled={index === blocks.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDownward fontSize="inherit" />
                    </IconButton>
                    <Tooltip title="Duplicate">
                      <span>
                        <IconButton size="small" onClick={() => duplicateBlock(block)} disabled={blocks.length >= MAX_BLOCKS}>
                          <ContentCopy fontSize="inherit" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => removeBlock(block)}>
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {selected && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <BlockEditor key={selected.id} block={selected} onChange={(changes) => updateBlock(selected.id, changes)} />
            </Paper>
          )}
        </Stack>

        {/* Right: live preview */}
        <Paper
          variant="outlined"
          sx={{ overflow: 'auto', maxHeight: { lg: 'calc(100vh - 180px)' }, position: { lg: 'sticky' }, top: { lg: 80 } }}
          // Links do nothing inside the preview, so clicking a block only selects it
          onClickCapture={(e) => {
            if (e.target.closest('a') && !e.target.closest('[data-allow-link]')) e.preventDefault()
          }}
        >
          <Box sx={{ position: 'relative', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography sx={{ fontWeight: 700 }}>{settings.libraryName}</Typography>
            <FixedPartLabel>Header — fixed</FixedPartLabel>
          </Box>

          {blocks.map((block) => {
            const isSelected = block.id === selectedId
            return (
              <Box
                key={block.id}
                onClick={() => setSelectedId(block.id)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  outline: isSelected ? '3px solid' : '0 solid transparent',
                  outlineColor: 'primary.main',
                  outlineOffset: -3,
                  '&:hover': { outline: isSelected ? undefined : '2px dashed', outlineColor: 'primary.light', outlineOffset: -2 },
                }}
              >
                {isSelected && (
                  <Chip
                    label={BLOCK_TYPES[block.type].label}
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
                  />
                )}
                <HomeBlock block={block} ctx={settings} preview />
              </Box>
            )
          })}

          {blocks.length === 0 && (
            <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>Empty page. Visitors will see the default design until you add blocks.</Typography>
            </Box>
          )}

          <Box sx={{ position: 'relative' }}>
            <Chip
              icon={<Lock />}
              label="Footer — fixed design. Edit its details in Settings → Website footer"
              size="small"
              component={RouterLink}
              to="/admin/settings"
              clickable
              data-allow-link
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,.95)', boxShadow: 1 }}
            />
            <Box sx={{ pointerEvents: 'none' }}>
              <SiteFooter />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Menu anchorEl={addMenu} open={!!addMenu} onClose={() => setAddMenu(null)}>
        {BLOCK_TYPE_KEYS.map((type) => (
          <MenuItem key={type} onClick={() => addBlock(type)} sx={{ maxWidth: 360, whiteSpace: 'normal' }}>
            <ListItemText primary={BLOCK_TYPES[type].label} secondary={BLOCK_TYPES[type].description} />
          </MenuItem>
        ))}
      </Menu>

      <VersionsDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadVersion}
        onPublish={handlePublishVersion}
        busy={busy}
      />

      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()}>
        <DialogTitle>Leave without saving?</DialogTitle>
        <DialogContent>
          <DialogContentText>Your home page changes have not been saved.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>Stay</Button>
          <Button color="error" onClick={() => blocker.proceed?.()}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} />
    </>
  )
}
