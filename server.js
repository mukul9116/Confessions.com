const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create directories
const confessionDir = './confession';
const mainDir = path.join(confessionDir, 'main');
const usersDir = path.join(confessionDir, 'users');

if (!fs.existsSync(confessionDir)) fs.mkdirSync(confessionDir);
if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir);
if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir);

const indexFile = path.join(mainDir, 'index.json');
if (!fs.existsSync(indexFile)) fs.writeFileSync(indexFile, '[]');

app.post('/save-confession', (req, res) => {
    try {
        const data = req.body;
        const timestamp = Date.now();
        const filename = `confession_${timestamp}.json`;
        
        // Save individual user file
        const userFilePath = path.join(usersDir, filename);
        fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2));
        
        // Update main index
        const summaryData = {
            timestamp: data.timestamp,
            userName: data.userName,
            recipientName: data.recipientName,
            confessionType: data.confessionType,
            filename: filename
        };
        
        let indexData = [];
        if (fs.existsSync(indexFile)) {
            indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        }
        indexData.push(summaryData);
        fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});