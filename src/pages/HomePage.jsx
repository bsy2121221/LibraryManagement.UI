import { Box, CircularProgress } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { homePageApi } from '../api/endpoints'
import HomeBlocks from '../components/home/HomeBlocks'
import { defaultLayout, normalizeLayout } from '../components/home/blockTypes'
import { usePublicSettings } from '../hooks/usePublicSettings'

// The home page the admin designed in Admin -> Home page (header and footer come from PublicLayout).
// Until something is published, or if the API cannot be reached, the built-in default design is shown.
export default function HomePage() {
  const settings = usePublicSettings()
  const [layout, setLayout] = useState(undefined)

  useEffect(() => {
    let active = true
    homePageApi
      .get()
      .then((page) => active && setLayout(page ? normalizeLayout(page.layout) : null))
      .catch(() => active && setLayout(null))
    return () => {
      active = false
    }
  }, [])

  const fallback = useMemo(() => defaultLayout(), [])

  if (layout === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 16 }}>
        <CircularProgress />
      </Box>
    )
  }

  const blocks = layout?.blocks?.length ? layout : fallback
  return <HomeBlocks layout={blocks} ctx={settings} />
}
