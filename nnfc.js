var gl;
var canvas;
var screenRatio;
var crabs = [{}, {}];

function initGL() {
	try {
		gl = canvas.getContext("experimental-webgl", { antialias: true });
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function initCrabs() {
	screenRatio = canvas.width / canvas.height;
	crabs[0].x = randomIntFromInterval(-15, 200 * screenRatio + 15);
	crabs[1].x = randomIntFromInterval(-15, 200 * screenRatio + 15);
	crabs[0].y = randomIntFromInterval(0, 9) * 20;
	crabs[1].y = randomIntFromInterval(0, 9) * 20;
	while (crabs[0].y == crabs[1].y) {
		crabs[1].y = randomIntFromInterval(0, 9) * 20;
	}
	crabs[0].flip = -1;
	crabs[1].flip = 1;
}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

function initBuffers() {
	crabVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, crabVertexPositionBuffer);
	var vertices = [
		4.0, 0.0, 0.0,
		5.5, 4.5, 0.0,
		6.5, 3.5, 0.0,
		9.0, 4.0, 0.0,
		0.5, 4.5, 0.0,
		4.5, 8.0, 0.0,
		4.5, 6.5, 0.0,
		8.0, 6.0, 0.0,
		0.0, 6.5, 0.0,
		3.5, 10.0, 0.0,
		4.0, 8.5, 0.0,
		8.0, 8.0, 0.0,
		3.5, 15.0, 0.0,
		3.5, 12.0, 0.0,
		5.0, 10.5, 0.0,
		7.5, 10.5, 0.0,
		9.5, 12.0, 0.0,
		9.5, 15.0, 0.0,
		8.0, 16.5, 0.0,
		6.0, 13.0, 0.0,
		5.0, 16.5, 0.0,
		12.0, 1.0, 0.0,
		9.0, 7.0, 0.0,
		11.0, 11.0, 0.0,
		11.0, 14.0, 0.0,
		10.0, 15.0, 0.0,
		11.0, 16.0, 0.0,
		12.0, 16.0, 0.0,
		13.0, 15.0, 0.0,
		12.0, 14.0, 0.0,
		12.0, 11.0, 0.0,
		19.0, 11.0, 0.0,
		19.0, 14.0, 0.0,
		18.0, 15.0, 0.0,
		19.0, 16.0, 0.0,
		20.0, 16.0, 0.0,
		21.0, 15.0, 0.0,
		20.0, 14.0, 0.0,
		20.0, 11.0, 0.0,
		22.0, 7.0, 0.0,
		19.0, 1.0, 0.0,
		12.0, 7.0, 0.0,
		11.0, 7.0, 0.0,
		19.0, 7.0, 0.0,
		20.0, 7.0, 0.0,
		23.0, 16.5, 0.0,
		21.5, 15.0, 0.0,
		21.5, 12.0, 0.0,
		23.5, 10.5, 0.0,
		26.0, 10.5, 0.0,
		27.5, 12.0, 0.0,
		27.5, 15.0, 0.0,
		25.0, 13.0, 0.0,
		26.0, 16.5, 0.0,
		23.0, 8.0, 0.0,
		27.0, 8.0, 0.0,
		28.0, 9.5, 0.0,
		31.0, 5.5, 0.0,
		23.0, 6.0, 0.0,
		26.0, 4.5, 0.0,
		27.0, 5.5, 0.0,
		28.0, 1.0, 0.0,
		22.0, 4.0, 0.0,
		24.5, 3.0, 0.0,
		25.5, 4.0, 0.0,
		26.0, 0.0, 0.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	crabVerticesIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, crabVerticesIndexBuffer);
	var triangles = [
		0, 2, 1,
		1, 2, 3,
		4, 6, 5,
		5, 6, 7,
		8, 10, 9,
		9, 10, 11,
		12, 13, 19,
		13, 14, 19,
		14, 15, 19,
		15, 16, 19,
		16, 17, 19,
		17, 18, 19,
		25, 24, 26,
		27, 29, 28,
		26, 42, 27,
		42, 41, 27,
		22, 42, 23,
		22, 21, 41,
		21, 31, 30,
		31, 21, 40,
		40, 39, 43,
		39, 38, 44,
		34, 43, 35,
		43, 44, 35,
		32, 34, 33,
		35, 37, 36,
		45, 46, 52,
		46, 47, 52,
		47, 48, 52,
		48, 49, 52,
		49, 50, 52,
		50, 51, 52,
		54, 55, 56,
		55, 57, 56,
		58, 59, 60,
		59, 61, 60,
		62, 63, 64,
		63, 65, 64,
		12, 19, 20,
		18, 20, 19,
		45, 52, 53,
		53, 52, 51,
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), gl.STATIC_DRAW);
}

function resize() {
	// change the size of the canvas's backing store to match the size it is displayed.
	if (canvas.clientWidth == canvas.width && canvas.clientHeight == canvas.height) {
		return;
	} else {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
	}
	screenRatio = canvas.width / canvas.height;
}

function animate() {
	crabs[0].x += 1;
	crabs[1].x -= 1;

	for (var i = 0; i < 2; i++) {
		if (crabs[i].x % 4 == 0) {
			crabs[i].flip *= -1;
		}
		if (crabs[i].x > (200 * screenRatio + 15)) {
			crabs[i].x = -15;
			crabs[i].y = randomIntFromInterval(0, 9) * 20;
			if (i == 0) {
				while (crabs[0].y == crabs[1].y) {
					crabs[0].y = randomIntFromInterval(0, 9) * 20;
				}
			}
		}
		if (crabs[i].x < -15) {
			crabs[i].x = Math.floor(200 * screenRatio + 15);
			crabs[i].y = randomIntFromInterval(0, 9) * 20;
			if (i == 1) {
				while (crabs[1].y == crabs[0].y) {
					crabs[1].y = randomIntFromInterval(0, 9) * 20;
				}
			}
		}
	}
}

var fps = 24;
function drawScene() {
	setTimeout(function () {
		resize();
		requestAnimationFrame(drawScene);

		paint();
		animate();
	}, 1000 / fps);
}

function resizeAndPaint() {
	resize();
	paint();
}

function paint() {
	// Set the viewport and projection matrix for the scene
	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.ortho(0, 200 * screenRatio, 0, 200, 1, 10, pMatrix);
	mat4.lookAt(pMatrix, [5, 5, 10], [0, 0, 0], [0, 1, 0])

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for (var crab = 0; crab < crabs.length; crab++) {
		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, [crabs[crab].x, crabs[crab].y, -7.0]);
		mat4.scale(mvMatrix, [crabs[crab].flip, 1, 1]);
		mat4.translate(mvMatrix, [-15.5, 0, 0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, crabVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, crabVerticesIndexBuffer);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, 126, gl.UNSIGNED_SHORT, 0);

		gl.disable(gl.CULL_FACE);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, crabVerticesIndexBuffer);
		gl.drawElements(gl.TRIANGLES, 114, gl.UNSIGNED_SHORT, 0);
		gl.enable(gl.CULL_FACE);
	}
}

function webGLStart() {
	canvas = document.getElementById("glcanvas");
	initGL();
	initShaders();
	initBuffers();
	initCrabs();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	drawScene();
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}