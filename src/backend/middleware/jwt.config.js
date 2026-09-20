import { sign, verify } from 'hono/jwt'

const secretKey = (env) => env.JWT_SECRET

export async function generateToken(payload, env) {
    const secret = secretKey(env);

    const exp = Math.floor(Date.now()/1000) + (60*60*24)

    return await sign({ ...payload, exp }, secret, 'HS256')
}

export async function verifyToken(token, env) {
    const secret = secretKey(env);
    return await verify(token, secret, 'HS256')
}

// const AuthMiddleware = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader) {
//         res.json({ message: "Missing Credential"});
//         return;
//     }

//     const parts = authHeader.split(" ");
//     if (parts.length !== 2 || parts[0] !== "Bearer") {
//         res.status(401).json({ message: "Invalid Token Format" });
//         return;
//     }

//     const token = parts[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         req.user = decoded;

//         next();
//     } catch(err) {
//         console.error(err);
//         res.status(403).json({ message: "Token Invalid" })
//     }
// }

// export default AuthMiddleware;