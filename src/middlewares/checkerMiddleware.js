import jwt from "jsonwebtoken";

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalError = (err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Server xatosi"
    })
};

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "Token yo'q"})
    }
    const token = authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    }catch(err){
        return res.status(401).json({message: "Token yaroqsiz"})
    }
}

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Admin huquqi talab qilinadi" });
    }
}