const express = require('express');
const db = require('../config/dbConnect');

exports.addBook = async (req, res) => { 
    const { title, author,genre, year_of_publication } = req.body;
    const query = 'INSERT INTO books (title, author, genre, year_of_publication) VALUES (?,?,?,?)';
    db.query(query,[title, author, genre, year_of_publication], (err) => {
        if(err){
            return res.status(400).json({
                success: false,
                message: "Failed to add book"
            });
        }
        res.status(201).json({
            success: true,
            message: "Book added successfully"
        });
    });
};

exports.updateBook = async (req, res) => {
    const { title, author, genre, year_of_publication } = req.body;
    const id = req.params.id;

    db.query('UPDATE books SET title = ?, author = ?, genre = ?, year_of_publication = ? WHERE id = ?', [title, author, genre, year_of_publication, id], 
    (err) => {
        if(err){
            return res.status(400).json({
                success: false,
                message: "Failed to update book"
            });
        }
        res.status(200).json({
            success: true,
            message: "Book updated successfully"
        });
    });
};

exports.deleteBook = async (req, res) => {  
    const query = 'delete from books where id = ?';
    db.query(query, [req.params.id], (err) => {
        if(err){
            return res.status(400).json({
                success: false,
                message: "Failed to delete book"
            });
        }
        res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });
    });
};

exports.getBooks = async (req, res) => {
    const {genre, author, page=1, limit = 10} = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM books where 1=1';
    const params = [];

    if(genre){
        query += ' AND genre = ?';
        params.push(genre);
    }

    if(author){
        query += ' AND author = ?';
        params.push(author);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.query(query, params, (err, results) => {
        if(err){
            return res.status(400).json({
                success: false,
                message: "Failed to fetch books"
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
};