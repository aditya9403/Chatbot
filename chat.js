const http = require('http');
const fs = require('fs').promises;
const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatbot1'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('chatt.html')
      .then(data => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      })
      .catch(err => {
        console.error('Error reading file:', err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
      });
  } else if (req.url === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const message = decodeURIComponent(body.replace('message=', ''));
      if (!message.trim()) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Message is required');
        return;
      }

 
      handleChatMessage(message, (response) => {
        if (response) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(': ' + response);
        } else {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Sorry, I didn\'t understand that. I will try to improve my performance');
        }
      });
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
  }
});

function handleChatMessage(message, callback) {

  const sql = 'SELECT response_text FROM question q JOIN response r ON q.id = r.question_id WHERE q.question_text = ?';
  connection.query(sql, [message], (err, result) => {
    if (err) {
      console.error('Error retrieving response:', err);
      callback(null);
    } else {
      if (result.length > 0) {
        callback(result[0].response_text);
      } else {
        callback(null);
      }
    }
  });
}

server.listen(2906, () => {
  console.log('Server is running on http://localhost:2906');
});
