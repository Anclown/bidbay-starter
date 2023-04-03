import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId
  const user = await User.findOne({
    include: [{
      model: Product,
      as: 'products',
      attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'date'],
      include: {
        model: Product,
        as: 'product',
        attributes: ['id', 'name']
      }
    }],
    where: { id: userId }
  })
  if (user === null) {
    res.status(404).send('Erreur : produit non trouvé')
  } else {
    res.status(200).send(user)
  }
})

export default router
