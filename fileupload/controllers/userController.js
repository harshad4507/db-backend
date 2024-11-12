const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConnect');
require('dotenv').config();

exports.register = async (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide a user and password"
        });
    }
    db.query('SELECT * FROM users WHERE user = ?', [user], async (err, result) => {
        console.log(err);
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (result && result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "user already exists"
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query('INSERT INTO users (user, password) VALUES (?, ?)', [user, hashedPassword], (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Error registering user"
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: "User registered successfully"
                });
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error while hashing the password"
            });
        }
    });
};

exports.login = async (req, res) => {
    const { user, password } = req.body;

    try {
        if (!user || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide user and password"
            });
        }

        db.query('SELECT * FROM users WHERE user = ?', [user], async (err, result) => {
            if (err || result.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                });
            }

            let user = result[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            user.password = undefined;
            const options = {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
                httpOnly: true,
            };

            res.cookie('token', token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User logged in successfully"
            });
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
