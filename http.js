const http = require('http')
const fs = require('fs')

const server = http.createServer((req,res)=>{


    const url = req.url
    const method = req.method
    if(url === '/'){
        res.write('<html>');
        res.write('<head><title>Enter a message</title></head>')
        res.write('<body> <form action="/message" method="POST"><input type="text" name="message" id=""/><button>Say Hello</button></form></body>')
        res.write('</html>')
        return res.end()
    }

    if(url === '/message' && method === 'POST'){
        fs.writeFileSync('message.txt', 'Dummy')
        res.statusCode = 302;
        res.writeHead('Location','/')
        return res.end()
    }

    // process.exit()
    res.setHeader('Content-type', 'text/html')
    res.write('<html><head><title>My first Page</title></head><body><h1>Hello from node js</h1></body></html>')
    res.end()
})

server.listen(3000)

