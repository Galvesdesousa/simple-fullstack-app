const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define API endpoint
app.get('/api/data', (req, res) => {
    // Sample data for demonstration
    const data = {
        message: 'This is data from the server!'
    };
    res.json(data);
});

// Catch-all route for serving the front-end
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});