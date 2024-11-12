const express = require('express');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConnect');
require('dotenv').config();

exports.register = async (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }
    });

    const hashedPassword = await bycrypt.hash(password, 10);
    db.query('INSERT INTO users (username,password) VALUES(?,?)', [username, hashedPassword], (err) => {
        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    });
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username and password"
            });
        }

        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
            if (err || result.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                });
            }

            let user = result[0];

            const isMatch = await bycrypt.compare(password, user.password);
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
