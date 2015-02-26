var Game = (function() {
	//orientation of the snake. 1-4 for right, down, left, up.

	//The base width and height of a single element.
	var baseDimension = 10;

	//Number of minimum tiles per orientation (x,y).
	var minTiles = 30;

	var snake = [];

	//All Elements that are currently on the field.
	var elements = [];

	var snakeTailColor = '#39b54a';
	var snakePartColor = 'rgba(57, 181, 74, 0.57)'

	//How high the chance is that a new element wil spawn.
	var spawnChance = 0.2;

	var cv = null;

	var tickInterval = null;
	
	var gameOverCallback = null;

	function start() {
		var smallestDimension = (window.innerHeight < window.innerWidth) ? window.innerHeight : window.innerWidth;
		baseDimension = Math.floor(smallestDimension / minTiles);
		elements = [];
		snake = [];
		document.getElementById("endgame").style.display = "none";
		document.getElementById("endgame").style.opacity = "0";
		initSnake();
		initControls();
	}

	function pause() {
		clearInterval(tickInterval);
	}
	function resume() {
		tickInterval = setInterval(tick, 100);
	}


	/**
	*	Initializes the snake.
	*/
	function initSnake() {
		cv = document.getElementById("canvas");

		//Initial position of head, so that we can attach elements in every direction.
		var x = Math.floor((window.innerWidth/baseDimension)/2) * baseDimension;
		var y = Math.floor((window.innerHeight/baseDimension)/2) * baseDimension;
		var orientation = 1;
		var head = new Element('snake', x, y, '#fcd34c', orientation);
		snake.push(head);

		//Add tails
		appendToTail();
		appendToTail();

		tickInterval = setInterval(tick, 100);
	}

	/**
	*	The games tick.
	*/
	function tick() {

		moveSnake();
		spawnPart();
		collisionDetection();
		drawFrame();
	}

	/**
	*	Detects any collision.
	*	Collision is only possible with the head.
	*/
	function collisionDetection() {
		var head = snake[0];

		//Check collision with snake itself.
		for(var i = 1; i < snake.length; i++) {
			if(head.x === snake[i].x) {
				if(head.y === snake[i].y) {

					//Collision with self, die.
					gameOver();
				}
			}
		}

		//Check collision with elements.
		for(var i = 0; i < elements.length; i++) {

			//Nested ifs instead of one to improve performance a tiny bit.
			if(head.x === elements[i].x) {
				if(head.y === elements[i].y) {
					var elm = elements[i];

					//Collision is happening but multiple casses possible.
					if(elm.type === 'part') {
						elm.color = snakeTailColor;
						snake.push(elm)
						elements.splice(i,1);
					}
				}
			}
		}	
	}

	/**
	*	Ends the game.
	*/
	function gameOver() {
		clearInterval(tickInterval);
		if(gameOverCallback !== null) {
			var text = 'You collected ' + (snake.length - 3) + ' parts.';
			gameOverCallback(text);
		}
	}
	
	/**
	*	Set the callback for when game is over.
	*/
	function setGameOverCallback(func) {
		gameOverCallback = func;
	}

	/**
	*	Spawns a new Part that can become the tail fo the snake.
	*/
	function spawnPart() {

		//There is only a chance that this will happen.
		if(Math.random() > spawnChance) return false;

		var x = Math.floor(Math.random() * (window.innerWidth/baseDimension)) * baseDimension;
		var y = Math.floor(Math.random() * (window.innerHeight/baseDimension)) * baseDimension;

		var elm = new Element('part', x, y, snakePartColor);
		elements.push(elm);
	}

	/**
	*	Moves the snake along.
	*	Positions every Element at the position of the prior Element in the list.
	*/
	function moveSnake() {

		//Move the snake.
		for(var i = snake.length-1; i > 0; i--) {
			snake[i].x = snake[i-1].x;
			snake[i].y = snake[i-1].y;
			snake[i].orientation = snake[i-1].orientation;
		}

		//Move the head.
		switch(snake[0].orientation) {
			case 1:
				snake[0].x += baseDimension;
				if(snake[0].x > window.innerWidth) snake[0].x = 0;
				break;
			case 2:
				snake[0].y += baseDimension;
				if(snake[0].y > window.innerHeight) snake[0].y = 0;
				break;
			case 3:
				snake[0].x -= baseDimension;
				if(snake[0].x < 0) snake[0].x = Math.floor(window.innerWidth/baseDimension) * baseDimension;
				break;
			case 4:
				snake[0].y -= baseDimension;
				if(snake[0].y < 0) snake[0].y = Math.floor(window.innerHeight/baseDimension) * baseDimension;
				break;
		}
	}

	/**
	*	Adds an element at the end of the tail, with the same orientation.
	*/
	function appendToTail() {
		var tail = snake[snake.length-1];
		var x, y;
		switch(tail.orientation) {
			case 1:
				x = tail.x - baseDimension;
				y = tail.y;
				break;
			case 2:
				x = tail.x;
				y = tail.y - baseDimension;
				break;
			case 3:
				x = tail.x + baseDimension;
				y = tail.y;
				break;
			case 4:
				x = tail.x;
				y = tail.y + baseDimension;
				break;
		}
		var elm = new Element('snake', x, y, snakeTailColor, tail.orientation);
		snake.push(elm);
	}

	/**
	*	Constructor for a new Element.
	*/
	function Element(type, x, y, color, orientation) {
		this.type = type;
		this.y = y;
		this.x = x;
		this.color = color;
		this.orientation = orientation;
	}

	/**
	*	Draws the current frame of the game.
	*/
	function drawFrame() {
		cv.width = window.innerWidth;
		cv.height = window.innerHeight;
		var ctx = cv.getContext("2d");

		//Draw all elements.
		for(var i = 0; i < elements.length; i++) {
			ctx.fillStyle = elements[i].color;
			ctx.fillRect(elements[i].x, elements[i].y, baseDimension, baseDimension);
		}

		//Draw the sanke.
		for(var i = 0; i < snake.length; i++) {
			ctx.fillStyle = snake[i].color;
			ctx.fillRect(snake[i].x, snake[i].y, baseDimension, baseDimension);
		}
	}

	Element.prototype.setX = function(x) {
		this.x = x;
		return this;
	}

	Element.prototype.setY = function(y) {
		this.y = y;
		return this;
	}

	/**
	*	Controlling the snake.
	*/

	function initControls() {
		window.onkeydown = keyDownHandler;
		window.ontouchstart = touchStartHandler;
	}


	function keyDownHandler(e) {
		if(e.keyCode === 65 || e.keyCode === 37) {
			if(snake[0].orientation !== 1) snake[0].orientation = 3;
		}else if(e.keyCode === 68 || e.keyCode === 39) {
			if(snake[0].orientation !== 3) snake[0].orientation = 1;
		}else if(e.keyCode === 83 || e.keyCode === 40) {
			if(snake[0].orientation !== 4) snake[0].orientation = 2;
		}else if(e.keyCode === 87 || e.keyCode === 38) {
			if(snake[0].orientation !== 2) snake[0].orientation = 4;
		}
	}
	function touchStartHandler(e) {
		touching = true;
		translateTouch(e);
	}

	/**
	*	Translates touch position into left and right movement.
	*/
	function translateTouch(e) {
		var x = e.touches[0].pageX;
		var y = e.touches[0].pageY;
		head = snake[0];

		//Calculate as if in a coordinate system with head at the center
		x = x - head.x + baseDimension / 2;
		y = y - head.y + baseDimension / 2;

		if(x >= 0 && y >= 0) {
			if(x / y > 1) {

				//Move right
				if(head.orientation !== 3) head.orientation = 1;
			} else {
				if(head.orientation !== 4) head.orientation = 2;
			}
		} else if (x >= 0 && y <= 0) {
			if(x / Math.abs(y) > 1) {

				//move right
				if(head.orientation !== 3) head.orientation = 1;
			} else {
				if(head.orientation !== 2) head.orientation = 4;
			}
		} else if ( x <= 0 && y <= 0) {
			if(Math.abs(x / y) > 1) {

				//move left
				if(head.orientation !== 1) head.orientation = 3;
			} else {
				if(head.orientation !== 2) head.orientation = 4;
			}
		} else if (x <= 0 && y >= 0) {
			if(Math.abs(x) / y > 1) {

				//move left
				if(head.orientation !== 1) head.orientation = 3;
			} else {
				if(head.orientation !== 4) head.orientation = 2;
			}
		}
	}
	
	//Return an Object = set Game to this Object.
	return {
		start: start,
		pause: pause,
		resume: resume,
		setGameOverCallback: setGameOverCallback
	};
}());
