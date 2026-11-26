import { Router } from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { Image } from '../models/index.js'
import { requireStaff } from '../middleware/auth.js'
import { fail } from '../utils/validate.js'

export const uploads = Router()
export const images = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })

// Never trust the browser's mime type: read the real file signature. (SVG is refused on purpose.)
function sniff(buf) {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  return null
}

uploads.post('/', requireStaff, upload.single('file'), async (req, res) => {
  if (!req.file) throw fail('err.image')
  const contentType = sniff(req.file.buffer)
  if (!contentType) throw fail('err.image')
  const doc = await Image.create({ data: req.file.buffer, contentType })
  res.status(201).json({ url: `/api/images/${doc._id}` })
})

images.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || !/^[0-9a-f]{24}$/i.test(req.params.id)) throw fail('err.notFound', 404)
  const doc = await Image.findById(req.params.id)
  if (!doc) throw fail('err.notFound', 404)
  res.set({ 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' })
  res.send(doc.data)
})
