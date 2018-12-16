var Sudoku = (function ($) {
	var gameBoard 			 //Dom element - container for the game
		, game 				 //Dom element - game table
		, timer 				 //Timer to update time
		, secondsElapsed = 0  //Time since the first click
		, keypad 			 //Dom element of the keypad with numbers
		, currentCell 		 //Dom element - currently selected cell of the game board
		, timeInput 			 //Dom element - string representation of the time i.e. 01:13
		, reset 				 //Dom element - reset button
		, gameArray  		 //JS representation of the game - 2-dimensional array 9x9
		, isFull	             //Bollean - whether the game board is full
		, isValid;			 //Boolean - if check returned any errors


	return {
		// Initiate a new game
		init: function (args) {
			var args = args || {};
			gameBoard = $('#' + args.gameBoard) || $('body');

			generateEmptyArray();
			generateInitialGame();

			createGameBoard();
			createKeypad();
			createToolbar();

			delegateEvents();
			renderGame(gameArray);
		}
	};

	/* ****************************
		Helper functions
	* ****************************/

	function createGameBoard() {
		game = createElement('table');
		addIdAttribute(game, 'game');
		for (var i = 0; i < 9; i++) {
			var row = createElement('tr');
			game.append(row);
			for (var j = 0; j < 9; j++) {
				var cell = createElement('td');
				cell.attr('id', 'cell-' + i + '-' + j);
				cell.attr('data-row', i);
				cell.attr('data-col', j);
				$('#cell-' + i + '-' + j).text('');
				row.append(cell);
			}
		}
		appendElement(gameBoard, game);
	};

	function createKeypad() {
		var number = 1;
		keypad = createElement('table');
		addIdAttribute(keypad, 'keypad');
		for (var i = 0; i < 3; i++) {
			var row = createElement('tr');
			keypad.append(row);
			for (var j = 0; j < 3; j++) {
				var cell = createElement('td').append(document.createTextNode(number));
				row.append(cell);
				number++;
			}
		}

		appendElement(gameBoard, keypad);
	};

	function createToolbar() {
		//Create toolbar container
		var toolbar = createElement('div');
		addIdAttribute(toolbar, 'toolbar');
		//Create timer label and time input
		var time = createElement('label').append(document.createTextNode('Time: '));
		toolbar.append(time);
		timeInput = createElement('span').append(document.createTextNode('00:00'));
		addIdAttribute(timeInput, 'time-input');
		toolbar.append(timeInput);
		//Create reset button
		reset = createElement('span').append(document.createTextNode('Restart'));
		addIdAttribute(reset, 'reset');
		toolbar.append(reset);

		//Add toolbar to the gameboard
		appendElement(gameBoard, toolbar);
	};

	function delegateEvents() {
		game.bind('click', cellClick);
		keypad.bind('click', keyClick);
		reset.bind('click', resetClick);
	};

	//Update dom of current cell
	function updateCurrentCell(value) {
		$(currentCell).text(value);
	};

	//Update js array after user selection
	function updateGameArray(value) {
		var position = getRowAndColOfCurrentCell();
		var newCell = cell(position.row, position.col, value);
		addValue(newCell);
	};

	//Returns row and col of currently selected cell
	function getRowAndColOfCurrentCell() {
		return {
			row: +currentCell.dataset.row,
			col: +currentCell.dataset.col
		}
	};

	function congratulate() {
		var overlay = createElement('div');
		addIdAttribute(overlay, 'overlay');

		var text = createElement('div');
		addIdAttribute(text, 'message');
		var header = createElement('h3').append(document.createTextNode('Congratulations!'));
		var message = createElement('p').append(document.createTextNode('You complete the game! Start again?'));
		text.append(header).append(message);
		overlay.append(text);

		var restart = createElement('div').append(document.createTextNode('Restart'));
		addIdAttribute(restart, 'restart');
		overlay.append(restart);
		
		gameBoard.append(overlay);

		restart.bind('click', resetClick);
	};

	/* ****************************
		Event handlers
	* ****************************/
	function cellClick(event) {
		if (!timer) {
			startTime();
		}

		$(currentCell).removeClass('active');
		currentCell = event.target;
		$(currentCell).addClass('active');

		//Ignore if locked cell or click not on the td
		if (currentCell.className.indexOf('locked') !== -1 || event.target.nodeName !== 'TD') {
			hideKeypad();
			return false;
		}

		//Calculate position for the keypad to appear
		var bottomLimit = event.currentTarget.clientHeight;
		var currentBottom = currentCell.offsetTop + currentCell.clientHeight * 4;
		var leftLimit = event.currentTarget.clientWidth;
		var currentleft = currentCell.offsetLeft + currentCell.clientWidth * 4;
		var top, left;
		if (currentBottom < bottomLimit) {
			top = currentCell.offsetTop + currentCell.clientHeight;
		} else {
			top = currentCell.offsetTop - currentCell.clientHeight * 3;
		}
		if (currentleft < leftLimit) {
			left = currentCell.offsetLeft + currentCell.clientWidth;
		} else {
			left = currentCell.offsetLeft - currentCell.clientWidth * 3;
		}
		showKeypad(top, left);
	};

	function keyClick(event) {
		$(currentCell).removeClass('active');
		if (event.target.nodeName !== 'TD') {
			hideKeypad();
			return false;
		}
		event.stopPropagation();
		var choice = event.target.innerHTML;
		hideKeypad();
		updateCurrentCell(+choice);
		updateGameArray(+choice);
		checkGame();
	};

	function showKeypad(top, left) {
		keypad.css('opacity', 0);
		keypad.css('display', 'none');
		keypad.css('top', top);
		keypad.css('left', left);
		keypad.css('display', 'block');
		keypad.animate({
			opacity: 1
		}, 200);
	};

	function hideKeypad() {
		keypad.css('display', 'none');
	}

	function resetClick(event) {
		gameBoard.find('*').remove();
		clearTime();
		Sudoku.init({
			gameBoard: 'sudoku'
		});
	};

	/* ****************************
		Create js representation of the board
	* ****************************/
	function addValue(newCell) {
		var existingCell = gameArray[newCell.row][newCell.col];
		newCell.id = existingCell.id;
		gameArray[newCell.row][newCell.col] = newCell;
	};

	function generateEmptyArray() {
		gameArray = [];
		for (var i = 0; i < 9; i++) {
			gameArray[i] = [];
			for (var j = 0; j < 9; j++) {
				gameArray[i][j] = {
					id: '' + i + j,
					value: -1
				};
			}
		}
	};

	function generateInitialGame() {
		//Row 1
		addValue(cell(0, 0, 5, true, true));
		addValue(cell(0, 1, 3, true, true));
		addValue(cell(0, 4, 7, true, true));
		//Row 2
		addValue(cell(1, 0, 6, true, true));
		addValue(cell(1, 3, 1, true, true));
		addValue(cell(1, 4, 9, true, true));
		addValue(cell(1, 5, 5, true, true));
		//Row 3
		addValue(cell(2, 1, 9, true, true));
		addValue(cell(2, 2, 8, true, true));
		addValue(cell(2, 7, 6, true, true));
		//Row 4
		addValue(cell(3, 0, 8, true, true));
		addValue(cell(3, 4, 6, true, true));
		addValue(cell(3, 8, 3, true, true));
		//Row 5
		addValue(cell(4, 0, 4, true, true));
		addValue(cell(4, 3, 8, true, true));
		addValue(cell(4, 5, 3, true, true));
		addValue(cell(4, 8, 1, true, true));
		//Row 6
		addValue(cell(5, 0, 7, true, true));
		addValue(cell(5, 4, 2, true, true));
		addValue(cell(5, 8, 6, true, true));
		//Row 7
		addValue(cell(6, 1, 6, true, true));
		addValue(cell(6, 6, 2, true, true));
		addValue(cell(6, 7, 8, true, true));
		//Row 8
		addValue(cell(7, 3, 4, true, true));
		addValue(cell(7, 4, 1, true, true));
		addValue(cell(7, 5, 9, true, true));
		addValue(cell(7, 8, 5, true, true));
		//Row 9
		addValue(cell(8, 4, 8, true, true));
		addValue(cell(8, 7, 7, true, true));
		addValue(cell(8, 8, 9, true, true));
	};

	function cell(row, col, number, valid, locked) {
		return {
			row: row,
			col: col,
			value: number,
			valid: valid || true,
			locked: locked || false
		}
	};

	/* ****************************
		Rendering 
	* ****************************/

	//Render the initial game and lock cells
	function renderGame(array) {
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var cell = array[i][j];
				var domCell = getCellById(cell.row, cell.col);
				addCellToDom(domCell, cell);
				domCell.addClass('locked');
			}
		}
	};

	function renderCell(cell) {
		var domCell = getCellById(cell.row, cell.col);
		addCellToDom(domCell, cell);
	};

	function addCellToDom(domCell, cell) {
		domCell.text(cell.value);
		domCell.attr('data-value', cell.value);
		cell.valid ? domCell.removeClass('invalid') : domCell.addClass('invalid')
	}

	function markError(rowIndex, colIndex) {
		$(currentCell).css('color', 'red');
	};

	function markOk(rowIndex, colIndex) {
		$(currentCell).css('color', 'black');
	};

	function renderNewTime(timeString) {
		timeInput.text(timeString);
	};

	/* ****************************
		Check the game 
	* ****************************/

	//Check full board
	function checkGame(argument) {
		//Remove previous validation
		$('.invalid').removeClass('invalid');
		isFull = true;
		isValid = true;
		checkAndMarkRows();
		checkAndMarkCols();
		checkSectors();
		if (isFull && isValid) {
			congratulate();
		}
	};

	//Get a single row and check
	function checkAndMarkRows() {
		var rowToCheck = [];
		for (var i = 0; i < 9; i++) {
			//Create copy of the original array to prevent sorting
			rowToCheck = gameArray[i];
			checkSingleLine(rowToCheck);
		}
	};

	//Get a single col and check
	function checkAndMarkCols() {
		//Create a column
		for (var i = 0; i < 9; i++) {
			var colToCheck = [];
			for (var j = 0; j < 9; j++) {
				colToCheck.push(gameArray[j][i]);
			}
			checkSingleLine(colToCheck);
		}
	};

	//Creates an array from the sector and checks it just like row or column
	function checkSectors() {
		for (var i = 0; i < 9; i++) {
			var sectorToCheck = createArrayForSector(i);
			checkSingleLine(sectorToCheck);
		}
	};

	//Takes an array, which is a row or a column and check for duplicates
	function checkSingleLine(array) {
		//Create a copy of the array before sorting to prevent changes to the original array
		var sortedArray = array.slice().sort(comparator('value'));
		for (var j = 0; j < 8; j++) {
			if (sortedArray[j].value !== -1 && sortedArray[j].value === sortedArray[j + 1].value) {
				isValid = false;
				markCellInvalid(sortedArray[j].id);
				markCellInvalid(sortedArray[j + 1].id);
			}
			if (sortedArray[j].value === -1) {
				isFull = false;
			}
		}
	};

	//Creates an array from the elements in a sector
	function createArrayForSector(index) {
		var array = [];
		startIndexes = getSectorStartIndexes(index),
			rowStart = startIndexes.row;
		rowEnd = rowStart + 2,
			colStart = startIndexes.col
		colEnd = colStart + 2;
		//Traverse a single sector and create an array from it's elements
		for (var i = rowStart; i <= rowEnd; i++) {
			for (var j = colStart; j <= colEnd; j++) {
				array.push(gameArray[i][j]);
			}
		}
		return array;
	}

	// Returns start indexes for the sector
	function getSectorStartIndexes(index) {
		var startIndexes = {};
		switch (index) {
			case 0:
				startIndexes = { row: 0, col: 0 };
				break;
			case 1:
				startIndexes = { row: 0, col: 3 };
				break;
			case 2:
				startIndexes = { row: 0, col: 6 };
				break;
			case 3:
				startIndexes = { row: 3, col: 0 };
				break;
			case 4:
				startIndexes = { row: 3, col: 3 };
				break;
			case 5:
				startIndexes = { row: 3, col: 6 };
				break;
			case 6:
				startIndexes = { row: 6, col: 0 };
				break;
			case 7:
				startIndexes = { row: 6, col: 3 };
				break;
			case 8:
				startIndexes = { row: 6, col: 6 };
				break;
		}

		return startIndexes;
	}

	//Finds cell by id and marks it invalid, then renders updated cell
	function markCellInvalid(id) {
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var cell = gameArray[i][j];
				if (cell.id === id) {
					cell.valid = false;
					renderCell(cell);
					break;
				}
			}
		}
	};

	/* ****************************
		Time and scoring
	* ****************************/
	function startTime() {
		timer = setInterval(function () {
			updateTimer();
		}, 1000)
	};

	function clearTime() {
		clearTimeout(timer);
		timer = undefined;
		secondsElapsed = 0;
	}

	function updateTimer() {
		secondsElapsed++;
		var timeString = getFormattedTimeString(secondsElapsed);
		renderNewTime(timeString);
	};

	function getFormattedTimeString(secondsElapsed) {
		var seconds = secondsElapsed % 60,
			minutes = Math.floor(secondsElapsed / 60),

			secondsString = seconds < 10 ? '0' + seconds : seconds,
			minutesString = minutes < 10 ? '0' + minutes : minutes;

		return minutesString + ':' + secondsString;
	};

	/* 
		Helper functions
	 */
	function createElement(element) {
		return $(document.createElement(element));
	};

	function appendElement(parent, element) {
		parent.append(element);
	};

	function addIdAttribute(container, id) {
		container.attr('id', id);
	};

	function getCellById(row, col) {
		return $('#cell-' + row + '-' + col);
	};

	function comparator(field) {
		return function (a, b) {
			return a[field] - b[field];
		}
	}

})(jQuery);