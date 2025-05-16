const ERR_INVALID_INPUT = "Invalid input";
const BOARD_SIZE = 8 * 16;
const BOARD_ROW_SIZE = 16;

const BOARD = [
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
	0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 99, 99, 99, 99, 99, 99,
];

const KNIGHT = 1;
const MOVE_OFFSETS = [
	14, -14, 18, -18, 31, -31, 33, -33, 	/* knight 		  */
];

class Node {
	children;
	constructor(data = 0) {
		this.data = data;
	}
}

function isNewRow(i) {
	return (((i + 1) % BOARD_ROW_SIZE == 0) && i);
}

function isInBoard(i) {
	return (!(i & 0x88));
}

function printBoard() {
	let str = "";
	let i = 0;
	while (i < BOARD_SIZE) {
		if (isInBoard(i)) {
			if (BOARD[i] === KNIGHT)
				str += "\x1b[41m" + BOARD[i] + "\x1b[0m" + "\t";
			else
				str += BOARD[i] + "\t";
			i++;
		}
		else {
			str += "\n";
			i += 8;
		}
	}
	console.log(str);
}

function generateLegalMoves(coord) {
	const res = [];
	let i = -1;
	let legal;

	while (++i < MOVE_OFFSETS.length) {
		legal = (coord + MOVE_OFFSETS[i]);
		if (isInBoard(legal))
			res.push(new Node(legal));
	}
	return (res);
}

function placeKnight(coord) {
	BOARD[coord] = KNIGHT;
}

function clearBoard() {
	let i = -1;

	while (++i < BOARD_SIZE) {
		if (isInBoard(i))
			BOARD[i] = 0;
		else
			BOARD[i] = 99;
	}
}

function convertTo1D(coord) {
	return (coord[0] + BOARD_ROW_SIZE * coord[1]);
}

function convertTo2D(coord) {
	const x = coord % BOARD_ROW_SIZE;
	const y = Math.floor(coord / BOARD_ROW_SIZE);
	return ([x, y]);
}

function isOutOfBoundary(coord) {
	return (coord < 0 || coord > 7);
}

function knightMoves(start, end) {
	if (!Array.isArray(start) || !Array.isArray(end))
		throw new Error(ERR_INVALID_INPUT);
	if (start.length !== 2 || end.length !== 2)
		throw new Error(ERR_INVALID_INPUT);
	if (start.some(element => typeof element !== "number") ||
		end.some(element => typeof element !== "number"))
		throw new Error(ERR_INVALID_INPUT);
	if (start.some(element => isOutOfBoundary(element)) ||
		end.some(element => isOutOfBoundary(element)))
		throw new Error(ERR_INVALID_INPUT);

	const start1D = convertTo1D(start);
	const path = breadthFirstSearch(new Node(start1D), convertTo1D(end));

	placeKnight(start1D);
	console.log(`> knightMoves([${start}], [${end}])`);
	if (path.length >= 1)
		console.log(`=> You made it in \x1b[32m${path.length - 1}\x1b[0m moves! Here's your path:`);
	path.forEach(coord => {
		console.log(convertTo2D(coord));
		clearBoard();
		placeKnight(coord);
		printBoard();
	});
}

function breadthFirstSearch(root, toFind) {
	const result = []
	const queue = [root];
	const visited = [];
	let current;

	while (queue.length > 0 && !visited.includes(toFind)) {
		current = queue.shift();
		visited.push(current.data);
		if (current === null)
			continue;
		current.children = generateLegalMoves(current.data);
		result.push(current);
		if (!current.children)
			continue;
		for (const child of (current.children)) {
			if (visited.includes(child.data))
				continue;
			queue.push(child);
		}
	}
	if (visited.includes(toFind))
		return (cleanPath(result));
	return ([]);
};

function cleanPath(node) {
	let current;
	const path = [];

	let childNode = node.pop();
	path.unshift(childNode.data);
	while (node.length > 0) {
		current = node.pop();
		for (const child of current.children) {
			if (child.data !== childNode.data)
				continue;
			path.unshift(current.data);
			childNode = current;
		}
	}
	return (path);
}

knightMoves([0, 0], [2, 1]);
knightMoves([0, 0], [3, 1]);
knightMoves([3, 3], [0, 0]);
knightMoves([0, 0], [0, 0]);
knightMoves([1, 7], [0, 0]);
// knightMoves([0, 0], [7, 7]);
