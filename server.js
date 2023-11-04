require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./src/config/db');
const cloudinary = require('./src/config/cloudinary');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/meeting', multer({ dest: 'uploads/' }).single('image'), async (req, res) => {
    try {
        // Mendapatkan ekstensi file
        const extension = path.extname(req.file.originalname).toLowerCase();

        // Mengecek apakah ekstensi file adalah .webp atau .svg
        if (extension === '.webp' || extension === '.svg') {
            return res.status(400).send('File format .webp and .svg are not allowed');
        }

        const result = await cloudinary.uploader.upload(req.file.path);
        const sql = 'INSERT INTO meetings SET ?';
        const values = {
            title: req.body.title,
            location: req.body.location,
            notes: req.body.notes,
            participants: req.body.participants,
            longitude: req.body.longitude || '0',
            latitude: req.body.latitude,
            image_url: result.secure_url
        };

        db.query(sql, values, (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

app.get('/meetings', (req, res) => {
    const sql = 'SELECT * FROM meetings';

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});