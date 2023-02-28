const jwt = require("jsonwebtoken");

const {User} = require("../models/user");

const {HttpError} = require("../helpers");

const {ACCESS_SECRET_KEY} = process.env;

const authenticate = async(req, res, next) => {
    const {authorization = ""} = req.headers;
    const [bearer, accessToken] = authorization.split(" ");
    if(bearer !== "Bearer") {
        next(HttpError(401))
    }
    try {
        const {id} = jwt.verify(accessToken, ACCESS_SECRET_KEY);
        const user = await User.findById(id);
        if(!user || !user.accessToken || user.accessToken !== accessToken) {
            next(HttpError(401));
        }
        req.user = user;
        next();
    }
    catch(error) {
        next(HttpError(401, error.message))
    }
}

module.exports = authenticate;