var app = function (conf) {
	// Object to be returned
	var instance = Object.create(app.prototype);

	instance.board = conf.elm;
		instance.board.width = window.innerWidth;
		instance.board.height = window.innerHeight;
		instance.board.name = conf.board.name || 'Black';
		instance.board.color = conf.board.color || '#000';
		instance.board.style.backgroundColor = instance.board.color;


	instance.ctx = instance.board.getContext('2d');
	instance.ongoingTouches = []; // touches in-progress
	instance.lineThickness = conf.lineThickness || 4;
	instance.colorNameInLogo = document.getElementById(conf.colorBoard || 'color-board');

	instance.board.addEventListener('touchstart', instance.handleTStart.bind(instance), false);
	// instance.board.addEventListener('touchcancel', instance.handleTCancel, false);
	instance.board.addEventListener('touchmove', instance.handleTMove.bind(instance), false);
	instance.board.addEventListener('touchend', instance.handleTEnd.bind(instance), false);
	instance.board.addEventListener('touchleave', instance.handleTEnd.bind(instance), false);

	instance.colors();
	instance.manageLineThickness();
	instance.boardNameColor();

	instance.lineColor = conf.lineColor || '#fff';
	return instance;
};

app.prototype = {
	// The ongoingTouchIndexById() function scans through the ongoingTouches array to find the touch matching the given identifier, then returns that touch's index into the array.
	ongoingTouchIndexById: function (idToFind) {
		var i = 0;
		var len = this.ongoingTouches.length;

		for(; i < len; i++) {
			var id = this.ongoingTouches[i].identifier;

			if (id == idToFind) {
				return i;
			}
		}
		return -1; // not found
	},

	// Initialize each color according to what is defined in its data-color attribute, and add touch event listener to change the line color and the color name in logo.
	colors: function () {
		var colors = document.getElementById('colors');
		var color;
		var li = colors.getElementsByTagName('li');
		var $this = this;

		var i = 0;
		var len = li.length;

		for(; i < len; i++) {
			color = li[i].getAttribute('data-color');

			li[i].style.backgroundColor = color;
		}

		colors.addEventListener('click', function (evt) {
			if (evt.target.tagName === 'LI') {
				$this.board.name = evt.target.getAttribute('data-name');
				$this.board.color = evt.target.getAttribute('data-color');

				$this.boardNameColor();
			}
		});
	},

	boardNameColor: function () {
		this.colorNameInLogo.innerHTML = this.board.name;
		this.colorNameInLogo.style.color = this.board.color;
		this.lineColor = this.board.color;
	},

	// Increase and decrease line thickness
	manageLineThickness: function () {
		var plusBtn = document.getElementById('thicker-line');
		var lessBtn = document.getElementById('thinner-line');
		var $this = this;

		plusBtn.addEventListener('click', function (evt) {
			// console.log('+1');
			$this.lineThickness += 1;
		});

		lessBtn.addEventListener('click', function (evt) {
			if ($this.lineThickness > 1) {
				// console.log('-1');
				$this.lineThickness -= 1;
			}
		});
	},

	handleTStart: function (evt) {
		evt.preventDefault();

		var touches = evt.changedTouches;
		var i = 0;
		var len = touches.length;

		for(; i < len; i++) {
			this.ongoingTouches.push(touches[i]);
			// console.log(this.ongoingTouches);
			this.ctx.beginPath();
			this.ctx.arc(touches[i].pageX, touches[i].pageY, this.manageLineThickness / 2, 0, 2 * Math.PI, false);  // a circle
			this.ctx.fillStyle = this.lineColor;
			this.ctx.fill();
		}
	},

	handleTMove: function (evt) {
		evt.preventDefault();

		var touches = evt.changedTouches;
		var i = 0;
		var len = touches.length;

		for(; i < len; i++) {
			var idx = this.ongoingTouchIndexById(touches[i].identifier);

			// There's a touch?
			if(idx >= 0) {
				// console.log("continuing touch " + idx + ", " + "this.ongoingTouches: " + this.ongoingTouches);
				this.ctx.beginPath();
				// console.log("this.ctx.moveTo(" + this.ongoingTouches[idx].pageX + ", " + this.ongoingTouches[idx].pageY + ");");
				this.ctx.moveTo(this.ongoingTouches[idx].pageX, this.ongoingTouches[idx].pageY);
				// console.log("this.ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
				this.ctx.lineTo(touches[i].pageX, touches[i].pageY);
				this.ctx.lineWidth = this.lineThickness;
				this.ctx.strokeStyle = this.lineColor;
				this.ctx.stroke();

				this.ongoingTouches.splice(idx, 1, touches[i]);  // swap in the new touch record
				// console.log(".");
			}
		}
	},

	handleTEnd: function (evt) {
		evt.preventDefault();

		var touches = evt.changedTouches;
		var i = 0;
		var len = touches.length;

		for(; i < len; i++) {
			var idx = this.ongoingTouchIndexById(touches[i].identifier);

			// There's a touch?
			if(idx >= 0) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.ongoingTouches[idx].pageX, this.ongoingTouches[idx].pageY);
				this.ctx.lineTo(touches[i].pageX, touches[i].pageY);
				this.ctx.arc(touches[i].pageX, touches[i].pageY, this.lineThickness / 2, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = this.lineColor;
				this.ctx.fill();
				this.ongoingTouches.splice(idx, 1);  // remove it; we're done
			}
		}
	}
};

var blackboard = {
	elm: document.getElementById('blackboard'),
	board: {name: 'Black', color: '#000'},
	lineColor: '#fff', // default values
	lineThickness: 4
};

document.addEventListener('DOMContentLoaded', app(blackboard));