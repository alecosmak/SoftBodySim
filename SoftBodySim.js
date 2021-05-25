/* jshint -W069, esversion:6 */

/** @type {HTMLCanvasElement} */
let canvas =
	/** @type {HTMLCanvasElement} */ document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let height = window.innerHeight;
let width = window.innerWidth;
canvas.width = width;
canvas.height = height;

// make bottom left canvas origin
ctx.translate(0, height);
ctx.scale(1, -1);

// game variables
ctx.fillStyle = "white";
ctx.strokeStyle = "red";
const animationSpeed = 0.1;
const g = 1;
const k = 1;
const radius = 10;
const linkWidth = radius / 2;
const pointSpeed = 1;
const pointAccel = 0.1;

function unitVec1To2(p1, p2, s) {
	let dx = (p2.x - p1.x) / s;
	let dy = (p2.y - p1.y) / s;
	return [dx, dy];
}

function calcLinkForces(point) {
	point.links.forEach((link) => {
		link.s = linkLength(point, link.p);
		// console.log(link.s);
		// solve for all links in a system of eqns
		// F=ma
		// F_s / m = a_s
		// F_s = kx
		let Fs = k * (link.s - link.sIni);
		Fs = Fs <= 0.000001 ? 0 : Fs; // corrects floating errors
		if (Fs != 0) {
			let [dx, dy] = unitVec1To2(point, link.p, link.s);
			let FsX = Fs*dx;
			let FsY = Fs*dy;

			let asX = FsX / point.m;
			let asY = FsY / point.m;
			point.ax += asX * dx;
			point.ay += asY * dy;
		}
	});
}

function pointStuff(point, delta) {
	ctx.save();
	ctx.fillStyle = "#b33";
	ctx.beginPath();
	ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	if (point.x - radius <= 0 || point.x + radius >= width) {
		// left/right walls
		point.vx = 0;
		point.ax = 0;
	}
	if (point.y - radius <= 0) {
		// bottom
		point.y = radius;
		point.vy = 0;
		point.ay = 0;
	}

	
	point.x += delta * pointSpeed * point.vx;
	point.y += delta * pointSpeed * point.vy;
	
	point.vx += delta * pointAccel * point.ax;
	point.vy += delta * pointAccel * point.ay;
	
	calcLinkForces(point);
}

function drawLines() {
	ctx.save();
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = linkWidth;
	lines.forEach((line) => {
		ctx.beginPath();
		ctx.moveTo(line.p1.x, line.p1.y);
		ctx.lineTo(line.p2.x, line.p2.y);
		ctx.closePath();
		ctx.stroke();
	});
	ctx.restore();
}

function linkLength(p1, p2) {
	return Math.sqrt(
		(p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
	);
}

function addLink(p1, p2, p3) {
	lines.push({ p1: p1, p2: p2 });

	p1.links.push({ p: p2, sIni: linkLength(p1, p2), s: linkLength(p1, p2) });
	p2.links.push({ p: p1, sIni: linkLength(p2, p1), s: linkLength(p2, p1) });

	if (p3) {
		lines.push({ p1: p1, p2: p3 }, { p1: p2, p2: p3 });

		p1.links.push({
			p: p3,
			sIni: linkLength(p1, p3),
			s: linkLength(p1, p3),
		});
		p2.links.push({
			p: p3,
			sIni: linkLength(p2, p3),
			s: linkLength(p2, p3),
		});
		p3.links.push({
			p: p1,
			sIni: linkLength(p3, p1),
			s: linkLength(p3, p1),
		});
		p3.links.push({
			p: p2,
			sIni: linkLength(p3, p2),
			s: linkLength(p3, p2),
		});
	}
}

// creates and stores points
let points = [];
let lines = [];
let p1 = {
	x: width / 2,
	y: height / 2,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: -g,
	m: 1,
	links: [],
};
let p2 = {
	x: width / 2 + 80,
	y: height / 2 + 40,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: -g,
	m: 1,
	links: [],
};
/*let p3 = {
	x: width / 2,
	y: height / 2 + 80,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: -g,
	m: 1,
	links: [],
};
addLink(p1, p2, p3);
points.push(p1, p2, p3);*/
addLink(p1, p2);
points.push(p1, p2);

let prevTime;

function animate(timestamp) {
	ctx.clearRect(0, 0, width, height);
	if (!timestamp) timestamp = 0;
	if (!prevTime) prevTime = timestamp;
	let delta = (animationSpeed * (timestamp - prevTime)) / 10.0;

	drawLines();
	points.forEach((point) => {
		pointStuff(point, delta);
	});

	prevTime = timestamp;
	window.requestAnimationFrame(animate);
}
animate();
