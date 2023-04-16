import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'
import product from "../orm/models/product.js";

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  const product = await Product.findAll({
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'productId', 'date']
    }]
  })
  if (product === null) {
    res.status(404).send('Erreur : produit non trouvé')
  } else {
    res.status(200).send(product)
  }
})

router.get('/api/products/:userId', async (req, res, next) => {
  const products = await Product.findAll({
    where: { sellerId: req.params.userId },
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'productId', 'date']
    }]
  })
  if (products.length === 0) {
    res.status(404).send('Erreur : produits non trouvés')
  } else {
    res.status(200).send(products)
  }
})
router.get('/api/products/:productId', async (req, res) => {
  const productId = req.params.productId
  const product = await Product.findOne({
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price'],
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username']
      }]
    }],
    where: { id: productId }
  })
  if (product === null) {
    res.status(404).send('Erreur : produit non trouvé')
  } else {
    res.status(200).send(product)
  }
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

router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId // Récupération de l'ID du produit depuis les paramètres de la requête
    const productToUpdate = await Product.findByPk(productId) // Recherche du produit dans la base de données
    if (!productToUpdate) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    if (productToUpdate.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }
    productToUpdate.name = req.body.name
    productToUpdate.description = req.body.description
    productToUpdate.price = req.body.price
    productToUpdate.category = req.body.category
    productToUpdate.originalPrice = req.body.originalPrice
    productToUpdate.pictureUrl = req.body.pictureUrl
    productToUpdate.endDate = req.body.endDate
    const updatedProduct = await productToUpdate.save()
    res.status(200).json(updatedProduct)
  } catch (err) {
    res.status(403).json({ message: err.message })
  }
})

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId // Récupération de l'ID du produit depuis les paramètres de la requête
    const productToDestroy = await Product.findByPk(productId) // Recherche du produit dans la base de données
    if (!productToDestroy) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    if (productToDestroy.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }
    await productToDestroy.destroy()
    res.status(204).json()
  } catch (err) {
    res.status(403).json({ message: err.message })
  }
})

export default router
