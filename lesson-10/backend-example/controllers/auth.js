const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const { HttpError, ctrlWrapper, createTokens } = require("../helpers");

const { REFRESH_SECRET_KEY } = process.env;

const register = async (req, res) => {
    const { email, name, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpError(409, `${email} is already exist`)
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await User.create({ name, email, password: hashPassword });

    res.json({
        email: result.email,
        name: result.name,
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Email invalid");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Password invalid");
    }

    const tokens = createTokens(user._id);
    await User.findByIdAndUpdate(user._id, { ...tokens });

    res.json({
        ...tokens,
    })
}

const refresh = async (req, res, next) => {
    const { refreshToken: token } = req.body;
    let tokens = {};
    let userId = "";
    try {
        const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
        userId = id;
        tokens = createTokens(id);
    }
    catch (error) {
        next(HttpError(403, error.message));
    }
    await User.findByIdAndUpdate(userId, { ...tokens });

    res.json({
        ...tokens,
    })
}

const getCurrent = async (req, res) => {
    const { name, email } = req.user;

    res.json({
        name,
        email,
    })
}

const logout = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { token: "" });

    res.json({
        message: "Logout success"
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    refresh: ctrlWrapper(refresh),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
}