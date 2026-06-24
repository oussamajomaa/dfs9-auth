import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import verifyToken from "../middleware/verfiyToken.js"
import multer from "multer"
import path from 'path'
import nodemailer from 'nodemailer'

const router = express.Router()

// Configurer un Transporteur



async function sendConfirmationEmail(destinataire) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: destinataire,
        subject: 'Confirmez votre adress mail',
        html: `
            <h1>Bienvenu sur notre site</h1>
            <p>Veuillez clique sur le lien
                <a href="http://localhost:5173">Clicquez ici</a>
            </p>
        `
    }
    try {
        await transporter.sendMail(mailOptions)
        console.log('email envoyé')

    } catch (err) {
        console.log(err)
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        // const uniqueName = Date.now() + path.extname(file.originalname)
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })


/**
 * @route   POST /register
 * @desc    Inscription d'un nouvel utilisateur
 */
router.post('/register', upload.single('image'), async (req, res) => {
    try {
        const imageFile = req.file


        const { username, email, password, role } = req.body


        // 1. Vérifier si l'utilisateur existe déjà dans la base de données
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' })
        }

        // 2. Hacher le mot de passe pour des raisons de sécurité (Salt round = 10)
        const hash = await bcrypt.hash(password, 10)

        const imageName = imageFile ? imageFile.filename : null

        // 3. Créer l'utilisateur avec le mot de passe haché
        await User.create({
            username,
            email,
            password: hash,
            role,
            image: imageName
        })

        sendConfirmationEmail(email)

        return res.status(201).json({ message: 'Utilisateur créé !' })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})

/**
 * @route   POST /login-localstorage
 * @desc    Connexion classique renvoyant le token dans le corps de la réponse JSON (pour stockage dans le LocalStorage)
 */
router.post('/login-localstorage', async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body
        console.log(email, password)

        // 1. Vérifier si l'utilisateur existe
        const user = await User.findOne({ email })
        console.log(user)
        if (!user) {
            return res.status(400).json({ message: 'Invalides identifiants' })
        }

        // 2. Comparer le mot de passe saisi avec le mot de passe haché en BDD
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalides identifiants' })
        }

        // 3. Générer le JWT (valable 1 heure)
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, image: user.image },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        // 4. Renvoyer le token directement au client
        return res.status(200).json({ token, role: user.role, image: user.image })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})

/**
 * @route   POST /login-cookie
 * @desc    Connexion sécurisée injectant le token directement dans un Cookie HTTP-Only
 */
router.post('/login-cookie', async (req, res) => {
    try {
        console.log(req.body)
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Les champs sont requis" })
        }

        // 1. Vérifier si l'utilisateur existe
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "invalides identifiants" })
        }

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "invalides identifiants" })
        }

        const userPayload = { id: user._id, email: user.email, role: user.role, image: user.image };
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 1. On crée le cookie httpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        // 2. TRÈS IMPORTANT : On renvoie l'objet 'user' à React !
        return res.status(200).json({
            message: "Connexion réussie",
            user: userPayload
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})



router.get('/admin', verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Accès interdit" })
    }
    const users = await User.find()
    return res.status(200).json(users)
})



router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Date dans le passé (1er janvier 1970) pour forcer la suppression

    })
    return res.status(200).json({ message: "Déconnecté !" })
})


router.get('/profile', verifyToken, (req, res) => {
    try {
        const user = req.user
        console.log(user)
        return res.status(200).json({ user })
    } catch (err) {
        return res.status(500).json({ message: "Erreur lors de la récupération du profil" })
    }
})

export default router
