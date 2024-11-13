import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(null);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [bookId, setBookId] = useState(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [genre, setGenre] = useState('');
    const [year, setYear] = useState('');
    const [file, setFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (token) fetchBooks();
    }, [token]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/v1/auth/register', { username, password });
            alert('User registered successfully');
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/v1/auth/login', { username, password });
            setToken(response.data.token);
            alert('Logged in successfully');
        } catch (err) {
            console.error(err);
            alert('Login failed');
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/v1/book/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(response.data.data);
            setFilteredBooks(response.data.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch books');
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/v1/book/add', { title, author, genre, year_of_publication: year }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBooks();
            setTitle('');
            setAuthor('');
            setGenre('');
            setYear('');
            alert('Book added successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to add book');
        }
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:4000/api/v1/book/update/${bookId}`, { title, author, genre, year_of_publication: year }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBooks();
            setBookId(null);
            setTitle('');
            setAuthor('');
            setGenre('');
            setYear('');
            alert('Book updated successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to update book');
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/v1/book/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBooks();
            alert('Book deleted successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to delete book');
        }
    };

    const selectBook = (book) => {
        setBookId(book.id);
        setTitle(book.title);
        setAuthor(book.author);
        setGenre(book.genre);
        setYear(book.year_of_publication);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post('http://localhost:4000/api/v1/files', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('File uploaded successfully');
        } catch (err) {
            console.error(err);
            alert("Failed to upload file.");
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        const query = e.target.value.toLowerCase();
        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query) ||
            book.year_of_publication.toString().includes(query)
        );
        setFilteredBooks(filtered);
    };

    return (
        <div>
            <h1>Library Management System</h1>

            {!token ? (
                <div>
                    <form onSubmit={handleRegister}>
                        <h2>Register</h2>
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">Register</button>
                    </form>

                    <form onSubmit={handleLogin}>
                        <h2>Login</h2>
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">Login</button>
                    </form>
                </div>
            ) : (
                <div>
                    <h2>Book List</h2>

                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    <form onSubmit={bookId ? handleUpdateBook : handleAddBook}>
                        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                        <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
                        <input type="number" placeholder="Year of Publication" value={year} onChange={(e) => setYear(e.target.value)} />
                        <button type="submit">{bookId ? 'Update Book' : 'Add Book'}</button>
                    </form>

                    <ul>
                        {filteredBooks.map((book) => (
                            <li key={book.id}>
                                {book.title} by {book.author} ({book.genre}, {book.year_of_publication})
                                <button onClick={() => selectBook(book)}>Edit</button>
                                <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
