import { Message } from "../models/MessageModel.js";

// Message Yaratish 
const createMessage = async (req, res, next) => {
    try {
        const message = new Message({
            user: req.body.user,
            sendername: req.body.sendername,
            contactlink: req.body.contactlink,
            messagetext: req.body.messagetext,
            read: req.body.read || false
        })

        await message.save();
        res.json(message)
    } catch (err) {
        next(err)
    }
}

// Messagelarni olish
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ user: req.user.id }).sort({ sendtime: -1 })
        res.json(messages)
    } catch (err) {
        next(err)
    }
}

// Bitta Messageni olish
const getOneMessage = async (req, res, next) => {
    try {
        const message = await Message.findOne({ _id: req.params.id, user: req.user.id })
        if (!message) return next(new Error("Xabar topilmadi"));
        res.json(message)
    } catch (err) {
        next(err)
    }
}

// Messageni yangilash
const updateMessage = async (req, res, next) => {
    try {
        const message = await Message.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!message) return next(new Error("Xabar topilmadi"));
        res.json(message);
    } catch (err) {
        next(err);
    }
}

// Messageni o'chirish
const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findOneAndDelete({ _id: req.params.id, user: req.user.id })
        if (!message) {
            return next(new Error("Message not found"))
        }

        res.json({ message: "Message deleted!" })
    } catch (err) {
        next(err)
    }
}

export { createMessage, getMessages, getOneMessage, updateMessage, deleteMessage }