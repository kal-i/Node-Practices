import app from './app';

const PORT = process.env.PORT || 3000;

// Start the server and listen to incoming requests on the specified port
// The callback function simply logs a message when the server is running
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});