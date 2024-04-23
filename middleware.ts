const isUserLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You are unauthorized for this action" })
    }
    next()
}

export { isUserLoggedIn }