import mongoose from 'mongoose'
import { ORDER_STATUSES, ROLES } from '../config.js'

const { Schema, model } = mongoose
const text = { en: { type: String, default: '', trim: true, maxlength: 200 }, ar: { type: String, default: '', trim: true, maxlength: 200 } }
const longText = { en: { type: String, default: '', trim: true, maxlength: 3000 }, ar: { type: String, default: '', trim: true, maxlength: 3000 } }

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, default: 'user' },
}, { timestamps: { createdAt: true, updatedAt: false } }))

export const Category = model('Category', new Schema({
  name: text,
  image: { type: String, default: '' }, // /api/images/<id>
}, { timestamps: { createdAt: true, updatedAt: false } }))

export const Product = model('Product', new Schema({
  name: text,
  description: longText,
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: null, min: 0 }, // price before discount
  stock: { type: Number, required: true, min: 0, default: 0 },
  available: { type: Boolean, default: true },
  image: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } }))

export const Order = model('Order', new Schema({
  seq: { type: Number, required: true, unique: true },
  number: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customer: {
    name: String, phone: String, city: String, address: String, notes: { type: String, default: '' },
  },
  items: [{
    _id: false,
    product: { type: Schema.Types.ObjectId },
    name: text,        // snapshot: later edits never change old orders
    price: Number,
    qty: Number,
  }],
  total: { type: Number, required: true },
  payment: { type: String, default: 'cod' },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
}, { timestamps: { createdAt: true, updatedAt: false } }))

export const Image = model('Image', new Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } }))

export const Counter = model('Counter', new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
}))
