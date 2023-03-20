import express from 'express'
import dotenv from 'dotenv'
import stripe from 'stripe'
import cors from 'cors'


dotenv.config()
const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5500"
}))

const stripe_access = stripe(process.env.STRIP_PRIVATE_KEY)

// Example items
const storeItems = new Map([
    [1, { priceInCents: 20000, name: 'Piano Lesson [Monthly Subscription]'}],
    [2, { priceInCents: 200000, name: "Piano Lesson [Yearly Subscription]"}]
])

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe_access.checkout.sessions.create({
            payment_method_types: ['card'], 
            mode: 'payment', //Subscription is also option
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.CLIENT_URL}/sucess.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`

        })
        
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json( { error: e.message })
    }
})

app.listen(3000)