const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const {nanoid} = require("nanoid");

const {User} = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");

const {SECRET_KEY, BASE_URL} = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async(req, res)=> {
    const {email, name, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, `${email} is already exist`)
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationCode = nanoid();

    const result = await User.create({name, email, password: hashPassword, avatarURL, verificationCode});

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);

    res.json({
        email: result.email,
        name: result.name,
    })
}

const verify = async(req, res) => {
    const {verificationCode} = req.params;
    const user = await User.findOne({verificationCode});
    if(!user) {
        throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, {verify: true, verificationCode: ""});

    res.json({
        message: "Verify success"
    })
}

const resendVerifyEmail = async(req, res)=> {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(404, "Email not found");
    }

    if(user.verify) {
        throw HttpError(404, "Email already verify");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);

    res.json({
        message: "Email send success"
    })
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Email invalid");
    }

    if(!user.verify) {
        throw HttpError(401, "Email not verify"); 
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Password invalid");
    }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
    await User.findByIdAndUpdate(user._id, {token});

    res.json({
        token,
    })
}

const updateAvatar = async(req, res)=> {
    if(!req.file) {
        throw HttpError("400", "avatar must be exist")
    }

    const {path: tempUpload, originalname} = req.file;
    const {_id} = req.user;
    const extenstion = originalname.split(".").pop();
    const filename = `${_id}_avatar.${extenstion}`;
    const resultUpload = path.join(avatarDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, {avatarURL});

    res.json({
        avatarURL,
    })
}

const getCurrent = async(req, res) => {
    const {name, email} = req.user;

    res.json({
        name,
        email,
    })
}

const logout = async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, {token: ""});

    res.json({
        message: "Logout success"
    })
}

module.exports = {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}