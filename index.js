const http = require("http");
const url = require('url');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const argv = minimist(process.argv.slice(2));

const hostname = argv.hostname || '127.0.0.1';
const port = argv.port || 3000;
const wsPort = argv.wsPort || (port + 1);
const baseDirectory = __dirname + '/index';

const shell = process.env.SHELL || 'sh';
const command = argv._;
const progressPrefix = argv.prefix ?? 'Progress:\\s+';

if (command === []) {
	console.error('No command specified');
	return 1;
}

const wss = new WebSocket.Server({
	host: hostname,
	port: wsPort,
});

const server = http.createServer((request, response) => {
	try {
		const requestUrl = url.parse(request.url);
		const normReqUrl = path.normalize(requestUrl.pathname);

		/* Redirect to index. */
		if (normReqUrl === '/') {
			response.statusCode = 301;
			response.setHeader('location', `http://${hostname}:${port}/index.html`);
			response.end();
			return;
		} else if (normReqUrl === '/ws_port') {
			response.statusCode = 200;
			response.write(wsPort.toString());
			response.end();
			return;
		}

		// need to use path.normalize so people can't access directories underneath baseDirectory
		const fsPath = baseDirectory + normReqUrl;

		const fileStream = fs.createReadStream(fsPath);
		fileStream.pipe(response);
		fileStream.on('open', () => {
			response.statusCode = 200;
		});
		fileStream.on('error', () => {
			response.statusCode = 404; // assume the file doesn't exist
			fs.createReadStream('404/404.html').pipe(response);
		});
	} catch(e) {
	 	response.statusCode = 500;
		fs.createReadStream('500/500.html').pipe(response);
	 	console.log(e.stack);
	}
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

let progress = 0.0;

const worker = spawn(shell, [ '-c', command.join(' ') ]);
const progressRE = new RegExp(`${progressPrefix}(100|[1-9]?[0-9](?:\\.(?:\\d+)?)?|00?(?:\\.\\d+))%$`);

const stdout = [];
const stderr = [];

worker.stdout.on('data', (data) => {
	let str = data.toString();

	// Trim last character if it's a newline
	if (str[str.length - 1] == '\n') {
		str = str.slice(0, -1);
	}

	const lines = str.split('\n');

	lines.forEach((line) => {
		const capture = line.match(progressRE);

		if (capture) {
			progress = parseFloat(capture[1]);
		} else {
			stdout.push(line);
			console.log(line);
		}
	});
});

worker.stderr.on('data', (data) => {
	let str = data.toString();

	// Trim last character if it's a newline
	if (str[str.length - 1] == '\n') {
		str = str.slice(0, -1);
	}

	const lines = str.split('\n');

	lines.forEach((line) => {
		const capture = line.match(progressRE);

		if (capture) {
			progress = parseFloat(capture[0]);
		} else {
			stderr.push(line);
			console.error(line);
		}
	});
});

process.stdin.on('data', (data) => {
	worker.stdin.write(data);
});

wss.on('connection', (ws, req) => {
	const path = req.url;

	ws.on('message', (message) => {
		switch (path) {
			case '/progress':
				ws.send(progress.toString());
				break;
			case '/stdout':
				ws.send(stdout.join('\n'));
				break;
			case '/stderr':
				ws.send(stderr.join('\n'));
				break;
			default:
				//console.log(`received: (${req.path}) ${message}`);
		}
	});
});
