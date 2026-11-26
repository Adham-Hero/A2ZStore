import { Router } from 'express'
import { requireOwner } from '../middleware/auth.js'
import { seedDemo } from '../seed.js'

const router = Router()

// Owner only: replace all products & categories with the demo content.
router.post('/reset-demo', requireOwner, async (_req, res) => {
  await seedDemo({ force: true })
  res.json({ ok: true })
})

export default router
