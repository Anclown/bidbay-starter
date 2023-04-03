import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'
import product from "../orm/models/product.js";

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  const product = await Product.findAll()
  res.status(200).send(product)
})

router.get('/api/products/:productId', async (req, res) => {
  const productId = req.params.productId
  const product = await Product.findByPk(productId)
  res.status(600).send(product)
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body
    const sellerId = req.user.id

    // Check if the required fields are present
    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: 'Missing required fields' })
    }

    // Check if the original price is a valid number
    if (isNaN(originalPrice)) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: 'Original price must be a number' })
    }

    const product = await Product.create({ name, description, category, originalPrice, pictureUrl, endDate, sellerId })
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
