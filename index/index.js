function onWSInit(port) {
	const progressSock = new WebSocket(`ws://${location.hostname}:${port}/progress`);
	const stderrSock = new WebSocket(`ws://${location.hostname}:${port}/stderr`);
	const stdoutSock = new WebSocket(`ws://${location.hostname}:${port}/stdout`);
	const refreshInterval = 2000;

	function escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\n/g, "<br />");
	}

	stderrSock.onopen = () => {
		stderrSock.send('ping');
	};

	stderrSock.onmessage = (event) => {
		document.getElementById('stderr').innerHTML = escapeHtml(event.data);
	};

	stdoutSock.onopen = () => {
		stdoutSock.send('ping');
	};

	stdoutSock.onmessage = (event) => {
		document.getElementById('stdout').innerHTML = escapeHtml(event.data);
	};

	progressSock.onopen = () => {
		progressSock.send('ping');
	};

	progressSock.onmessage = (event) => {
		const progressBar = document.getElementById('progress');
		progressBar.innerHTML = `${escapeHtml(event.data)}%`;
		progressBar.style.width = `${parseFloat(event.data)}%`;
	};

	function updateData() {
		stderrSock.send('');
		stdoutSock.send('');
		progressSock.send('');

		window.setTimeout(updateData, refreshInterval);
	}

	window.setTimeout(updateData, refreshInterval);
}

const wsPortReq = new XMLHttpRequest();

wsPortReq.onreadystatechange = () => {
	if (wsPortReq.readyState === 4 && wsPortReq.status === 200) {
		onWSInit(parseInt(wsPortReq.responseText))
	}
};

wsPortReq.open("GET", `http://${location.host}/ws_port`, true);
wsPortReq.send(null);
