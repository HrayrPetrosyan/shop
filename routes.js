const requestHandle = (req, res) => {
    const method = req.method;
    const url = req.url;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>Greeting!</title></head>');
        res.write('<body>');
        res.write('<h1>Welcome, Sir ))</h1>');
        res.write('<form action="/create-users" method="POST" ><input type="text" name="message"><button type="submit">Send</button></form>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
        
    }

    if (url === '/users') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>My First Page</title></head>');
        res.write('<body>');
        res.write('<ul><li>User1</li><li>User2</li><li>User3</li></ul>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/create-users' && method === 'POST') {
        body = [];
        req.on('data', (chunk) => {
            body.push(chunk)
        });
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            console.log(message);
            return res.end();
        })
    }
}

exports.handle = requestHandle;