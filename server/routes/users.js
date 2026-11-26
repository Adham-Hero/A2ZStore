import { Router } from 'express'
import { ROLES } from '../config.js'
import { User } from '../models/index.js'
import { requireOwner, requireStaff } from '../middleware/auth.js'
import { fail, oneOf } from '../utils/validate.js'
import { objectId, outUser } from '../utils/helpers.js'

const router = Router()

router.get('/', requireStaff, async (_req, res) => {
  res.json((await User.find().sort({ createdAt: 1 })).map(outUser))
})

router.patch('/:id/role', requireOwner, async (req, res) => {
  const id = objectId(req.params.id)
  if (id === String(req.user._id)) throw fail('err.denied', 403) // owners cannot change their own role
  const role = oneOf(req.body?.role, ROLES)
  const user = await User.findByIdAndUpdate(id, { role }, { returnDocument: 'after' })
  if (!user) throw fail('err.notFound', 404)
  res.json(outUser(user))
})

router.delete('/:id', requireOwner, async (req, res) => {
  const id = objectId(req.params.id)
  if (id === String(req.user._id)) throw fail('err.denied', 403)
  await User.findByIdAndDelete(id)
  res.json({ ok: true })
})

export default router
