import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import verifyToken from "../middleware/verfiyToken.js"
import multer from "multer"
import path from 'path'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const router = express.Router()





async function sendConfirmationEmail(destinataire, url) {

    // 1. Configuration du transporteur (le service qui va envoyer l'e-mail)
    // On utilise ici Gmail en récupérant les identifiants sécurisés depuis les variables d'environnement (.env)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Votre adresse Gmail
            pass: process.env.EMAIL_PASS  // Votre mot de passe d'application (généré dans votre compte Google)
        }
    })

    // 2. Définition du contenu et des options de l'e-mail
    const mailOptions = {
        from: process.env.EMAIL_USER, // L'expéditeur (vous)
        to: destinataire,             // Le destinataire (l'utilisateur qui s'inscrit)
        subject: 'Confirmez votre adresse mail', // Objet de l'e-mail
        html: `
            <h1>Bienvenue sur notre site</h1>
            <p>Veuillez cliquer sur le lien ci-dessous pour valider votre compte :</p>
            <p>
                <a href="${url}">Cliquez ici</a>
            </p>
        ` // Corps de l'e-mail au format HTML contenant le lien dynamique
    }

    // 3. Envoi effectif de l'e-mail avec gestion des erreurs
    try {
        // Attente de la réponse de l'envoi de l'e-mail (opération asynchrone)
        await transporter.sendMail(mailOptions)
        console.log('E-mail envoyé avec succès !')

    } catch (err) {
        // En cas d'échec (mauvais identifiants, problème réseau...), on affiche l'erreur dans la console
        console.error("Erreur lors de l'envoi de l'e-mail :", err)
    }
}



// 1. Configuration du moteur de stockage de Multer (diskStorage)
// On définit ici où et comment les fichiers téléchargés seront enregistrés sur le serveur.
const storage = multer.diskStorage({
    
    // Détermine le dossier de destination pour les fichiers téléversés
    destination: (req, file, cb) => {
        // cb(erreur, chemin_du_dossier)
        // null signifie qu'il n'y a pas d'erreur, et 'uploads/' est le dossier cible
        cb(null, 'uploads/')
    },
    
    // Détermine le nom que portera le fichier une fois enregistré
    filename: (req, file, cb) => {
        // Option commentée : générer un nom unique basé sur le timestamp actuel pour éviter les doublons
        // const uniqueName = Date.now() + path.extname(file.originalname)
        
        // Option actuelle : garde le nom d'origine exact du fichier (ex: "ma-photo.jpg")
        // Attention : si deux utilisateurs envoient un fichier avec le même nom, le second écrasera le premier.
        cb(null, file.originalname)
    }
})

// 2. Initialisation du middleware Multer
// On crée l'instance 'upload' en lui passant notre configuration de stockage.
// C'est cet objet 'upload' qui sera utilisé ensuite dans vos routes Express (ex: upload.single('image'))
const upload = multer({ storage })


// Définition de la route POST '/register'
// On passe le middleware Multer 'upload.single('image')' pour intercepter et gérer le téléversement d'un fichier image unique nommé 'image'
router.post('/register', upload.single('image'), async (req, res) => {
    try {
        // Récupération des informations du fichier téléchargé via Multer (si présent)
        const imageFile = req.file

        // Extraction des données textuelles envoyées dans le corps de la requête (formulaire)
        const { username, email, password, role } = req.body

        // 1. Vérifier si l'utilisateur existe déjà dans la base de données
        // On cherche un utilisateur possédant déjà cet e-mail
        const user = await User.findOne({ email })
        if (user) {
            // Si trouvé, on renvoie une erreur 400 (Bad Request) et on arrête l'exécution
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' })
        }

        // 2. Hacher le mot de passe pour des raisons de sécurité (Salt round = 10)
        // Permet de ne jamais stocker le mot de passe en clair dans la base de données
        const hash = await bcrypt.hash(password, 10)

        // Si un fichier a été téléversé, on récupère son nom généré par Multer, sinon on attribue null
        const imageName = imageFile ? imageFile.filename : null

        // Génération d'un jeton (token) unique et aléatoire de 32 octets converti en chaîne hexadécimale
        // Ce token sera utilisé pour la vérification de l'adresse e-mail
        const token = crypto.randomBytes(32).toString('hex')

        // 3. Créer et sauvegarder le nouvel utilisateur dans la base de données
        await User.create({
            username,
            email,
            password: hash, // On enregistre le mot de passe haché
            role,
            image: imageName,
            token           // Stockage du token pour pouvoir le comparer lors de la confirmation
        })

        // 4. Construction de l'URL de vérification pointant vers le front-end (ici localhost:5173 pour un projet Vite/React par exemple)
        // On y intègre le token unique en paramètre de requête (query param)
        const url = `http://localhost:5173/verify-email?token=${token}`
        
        // Appel (sans bloquer le thread avec 'await') de la fonction d'envoi de l'e-mail de confirmation
        sendConfirmationEmail(email, url)

        // 5. Réponse finale : Tout s'est bien passé, l'utilisateur est créé (Statut 201 Created)
        return res.status(201).json({ message: 'Utilisateur créé !' })

    } catch (err) {
        // Gestion des erreurs serveurs (problème de base de données, bug de hachage, etc.)
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})

// Définition de la route GET '/verify-email'
// Cette route est appelée lorsque l'utilisateur clique sur le lien reçu dans son e-mail
router.get('/verify-email', async (req, res) => {
    try {
        // 1. Récupération du token depuis les paramètres de l'URL (ex: /verify-email?token=abc123...)
        const token = req.query.token
        // Variante possible par déstructuration : const { token } = req.query

        // 2. Recherche de l'utilisateur possédant ce token unique dans la base de données
        const user = await User.findOne({ token })

        // 3. Vérification de l'existence de l'utilisateur
        if (!user) {
            // Si aucun utilisateur n'a ce token (token invalide, expiré ou déjà utilisé), on renvoie une erreur 400
            return res.status(400).json({ message: "Bad request !" })
        } else {
            // Si l'utilisateur est trouvé :
            // On passe son statut à 'true' pour activer le compte
            user.isActive = true
            
            // On peut optionnellement vider le token pour qu'il ne soit plus réutilisable :
            // user.token = null 

            // Sauvegarde des modifications dans la base de données
            await user.save()
            
            // On renvoie une réponse positive (Statut 200 par défaut)
            return res.json({ message: 'Votre compte est activé !' })
        }
    } catch (err) {
        // En cas de problème technique (ex: coupure de la base de données)
        console.error(err)
        return res.status(500).json({ message: "Erreur serveur !" })
    }
})


// Définition de la route POST '/login-localstorage'
// Cette route gère l'authentification des utilisateurs qui stockent leur token côté client (ex: dans le localStorage)
router.post('/login-localstorage', async (req, res) => {
    // Log de débogage pour voir les données brutes reçues par le serveur
    console.log(req.body)
    
    try {
        // Extraction de l'e-mail et du mot de passe envoyés par l'utilisateur
        const { email, password } = req.body
        console.log(email, password)

        // 1. Vérifier si l'utilisateur existe dans la base de données
        const user = await User.findOne({ email })
        console.log(user)
        
        // Si aucun utilisateur ne correspond à cet e-mail, on renvoie une erreur 400
        if (!user) {
            return res.status(400).json({ message: 'Identifiants invalides' })
        }

        // 2. Comparer le mot de passe saisi avec le mot de passe haché en BDD
        // bcrypt.compare prend le mot de passe en clair, le hache en interne et le compare au hash stocké
        const isMatch = await bcrypt.compare(password, user.password)
        
        // Si les mots de passe ne correspondent pas, on renvoie la même erreur 400 pour des raisons de sécurité
        // (Évite d'indiquer à un hacker si c'est l'e-mail ou le mot de passe qui est faux)
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' })
        }

        // 3. Générer le JSON Web Token (JWT)
        // Le "payload" (1er argument) contient les données non sensibles de l'utilisateur incluses dans le token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                role: user.role, 
                image: user.image 
            },
            process.env.JWT_SECRET, // Clé secrète du serveur pour signer le token et empêcher la falsification
            { expiresIn: '1h' }      // Durée de validité du jeton (ici, 1 heure)
        )

        // 4. Renvoyer le token et les infos utiles directement au client (Front-end)
        // Le front-end pourra ainsi enregistrer ce token dans le localStorage pour authentifier les futures requêtes
        return res.status(200).json({ 
            token, 
            role: user.role, 
            image: user.image 
        })

    } catch (err) {
        // Gestion des erreurs internes du serveur
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})


// Définition de la route POST '/login-cookie'
// Cette méthode est beaucoup plus sécurisée car le jeton JWT est stocké dans un cookie invisible pour le JavaScript du navigateur
router.post('/login-cookie', async (req, res) => {
    try {
        console.log(req.body)
        const { email, password } = req.body
        
        // Validation rapide : s'assurer que les deux champs obligatoires sont bien fournis
        if (!email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" })
        }

        // 1. Vérifier si l'utilisateur existe dans la base de données
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" })
        }

        // Sécurité supplémentaire : Vérifier si l'utilisateur a bien validé son compte par e-mail
        if (!user.isActive) {
            // Le statut 401 (Unauthorized) est idéal ici car l'utilisateur est reconnu mais pas autorisé à naviguer
            return res.status(401).json({ message: "Veuillez activer votre compte" })
        }

        // 2. Vérifier si le mot de passe correspond
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides" })
        }

        // Préparation des données publiques de l'utilisateur à inclure dans le token (Payload)
        const userPayload = { id: user._id, email: user.email, role: user.role, image: user.image };
        
        // Génération du JWT (ici configuré pour expirer après 1 jour '1d')
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 3. Configuration et création du Cookie sécurisé
        // Le cookie est nommé 'token' et reçoit la valeur du JWT
        res.cookie('token', token, {
            httpOnly: true, // Crucial : Empêche le JavaScript (et donc les failles XSS) d'accéder au cookie
            secure: process.env.NODE_ENV === 'production', // Le cookie ne transite qu'en HTTPS lorsqu'on est en production
            sameSite: 'lax'  // Protège contre les attaques de type CSRF en restreignant l'envoi du cookie aux requêtes intersites sécurisées
        });

        // 4. Réponse au client (ex: React)
        // Le cookie est envoyé automatiquement dans les en-têtes HTTP (Headers).
        // On renvoie séparément les infos de l'utilisateur au format JSON pour que React puisse mettre à jour son état (Context/Redux)
        return res.status(200).json({
            message: "Connexion réussie",
            user: userPayload
        });
        
    } catch (err) {
        // En cas de plantage du serveur ou de la BDD
        console.log(err)
        return res.status(500).json({ message: err.message || err })
    }
})


// ==========================================
// 1. ROUTE : MOT DE PASSE OUBLIÉ
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body
        
        // Recherche de l'utilisateur avec son adresse e-mail
        const user = await User.findOne({ email })
        if (!user) {
            // Note de sécurité : Idéalement, on retourne un statut 200 avec le même message pour éviter "l'énumération d'e-mails" 
            // (ne pas laisser savoir à un attaquant si un e-mail existe ou non dans votre base)
            return res.json({ message: "Compte introuvable !" })
        }

        // Génération d'un token temporaire de réinitialisation sécurisé
        const token = crypto.randomBytes(32).toString('hex')
        
        // On stocke ce token chez l'utilisateur en BDD pour pouvoir le vérifier plus tard
        user.token = token
        await user.save()

        // Construction de l'URL pointant vers le formulaire de réinitialisation du Front-end (React)
        const url = `http://localhost:5173/reset-password?token=${token}`
        
        // Envoi de l'e-mail contenant le lien unique (ici, vous réutilisez votre fonction sendConfirmationEmail)
        sendConfirmationEmail(email, url)
        
        return res.status(200).json({ message: "Un email vous a été envoyé !" })

    } catch (err) {
        return res.status(500).json({ message: "Erreur Serveur !" })
    }
})

// ==========================================
// 2. ROUTE : RÉINITIALISATION DU MOT DE PASSE
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { password } = req.body // Le nouveau mot de passe saisi par l'utilisateur
        const { token } = req.query   // Récupération du token envoyé en paramètre dans l'URL (?token=...)
        
        // On cherche l'utilisateur qui possède ce token bien précis
        const user = await User.findOne({ token })
        if (!user) {
            return res.status(400).json({ message: "Token invalide" })
        }
        
        // Hachage du nouveau mot de passe avant de l'enregistrer
        user.password = await bcrypt.hash(password, 10)
        
        // TRÈS BONNE PRATIQUE : Décommentez la ligne suivante en production pour invalider le token.
        // Cela évite que le même lien de réinitialisation puisse être réutilisé plusieurs fois !
        // user.token = null 
        
        await user.save()
        return res.status(200).json({ message: "Mot de passe réinitialisé !" })
    } catch (err) {
        return res.status(500).json({ message: err.message || err })
    }
})

// ==========================================
// 3. ROUTE : DÉCONNEXION (LOGOUT)
// ==========================================
router.post('/logout', (req, res) => {
    // Pour déconnecter l'utilisateur lorsqu'on utilise les cookies httpOnly, 
    // il suffit de renvoyer un cookie vide portant le même nom et expiré.
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Assigne la date du 1er janvier 1970 (le navigateur supprime immédiatement le cookie)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })
    return res.status(200).json({ message: "Déconnecté !" })
})

// ==========================================
// 4. ROUTE : RÉCUPÉRATION DU PROFIL (PROTÉGÉE)
// ==========================================
// Le middleware 'verifyToken' extrait le JWT du cookie, le valide, et injecte les infos dans 'req.user'
router.get('/profile', verifyToken, (req, res) => {
    try {
        // 'req.user' contient le payload du JWT (id, email, role, image...) défini lors du login
        const user = req.user
        console.log(user)
        
        // On renvoie les infos au client pour qu'il puisse afficher le profil de l'utilisateur connecté
        return res.status(200).json({ user })
    } catch (err) {
        return res.status(500).json({ message: "Erreur lors de la récupération du profil" })
    }
})

// ==========================================
// 5. ROUTE : ESPACE ADMIN (PROTÉGÉE + FILTRE ROLE)
// ==========================================
router.get('/admin', verifyToken, async (req, res) => {
    // 1. Le middleware verifyToken a fait son travail.
    // 2. On effectue ici un second contrôle (Autorisation) basé sur le rôle de l'utilisateur
    if (req.user.role !== "admin") {
        // Si l'utilisateur n'est pas admin, on bloque l'accès avec un statut 403 (Forbidden)
        return res.status(403).json({ message: "Accès interdit" })
    }
    
    // Si c'est bien un admin, on récupère la liste complète de tous les utilisateurs en BDD
    const users = await User.find()
    return res.status(200).json(users)
})


export default router
