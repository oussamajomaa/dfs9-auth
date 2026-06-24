import jwt from 'jsonwebtoken'

export default function verifyToken(req, res, next) {
    try {
        // const authHeaders = req.headers.authorization
        // const token = authHeaders.split(' ')[1]
        const token = req.cookies.token
        if (!token) {
            return res.status(403).json({ message: "token manquant !" })
        }
        console.log("token   ".token)
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('decode '.decode)
        req.user = decode

        next()
    } catch (err) {
        res.status(500).json({ message: err })
    }
}