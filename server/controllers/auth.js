import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Registering User
export async function register(req, res) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body

        // Encryption
        const salt = await bcrypt.genSalt() 
        const passwordHash = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
        })
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
}

// Basic Login User
export async function login(req, res) {
    try {
        const {email, password} = req.body
        const user = await User.findOne({ email: email})
        if (! user) return res.status(400).json( {msg: "User does not exist. "})

        // Use same salt
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json( {msg: "Invalid credentials. "})

        // If success
        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)
        delete user.password  // Don't send back password to front-end
        res.status(200).json({ token, user})

    } catch (e) {
        res.status(500).json({ error: e.message })
    }
}