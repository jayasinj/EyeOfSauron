// Made by Matthew Spotten

// Jon's buttons / menu addition

let ButtonsMenu; // Dynamic support for menu / mapped buttons

// Load the module
document.addEventListener('DOMContentLoaded', () => {
    // Assuming your server is running on the same host and port 3000

    debugOut.push('DOMContentLoaded');
     // Assuming ButtonsMenu.js exports a default function or class
    import('./ButtonsMenu.js').then(module => {
      ButtonsMenu = module.default;
      // Now you can use ButtonsMenu
      ButtonsMenu.btnConnectWebSockets();
    }).catch(error => {
      console.error("Failed to load ButtonsMenu.js", error);
    });
});

// fake debug out
const debugOut = {
	push: function(message) {
	  console.log(message);
	}
  };
  
let shooter_img;
let shooter_exp = new Array(2);
let aliens = new Array(7);

let red_ship;

var red_ship_time_MIN = 10000;
var red_ship_time_MAX = 20000;

var ship_preMillis = 0;
var ship_random_time = 0;
var ship_visible = false;
var ship_X = 0;
var ship_direction = 1;

var points_earned = -1;
var points_earned_preMillis = 0;

var points_earned_disX = 0;
var points_earned_disY = 0;
//var invaders = create2dArray(11, 5, 1);

var invaders = [
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

//START DEAD ARRAY ____ ONLY FOR TESTING
/*
var invaders = [
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];
*/
//END DEAD ARRAY ____ ONLY FOR TESTING

var killed_invaders = [];
var invaders_shot = []; // X, Y, visible

var invaders_shot_MIN = 1000;
var invaders_shot_MAX = 10000;

var invaders_offset = 0;
var invaders_x = 0;
var invaders_y = 50;

var invaders_preTime = 0;

var direction = 4;

var score = 0;
var lives = 3;
var theme_Color = 0;
var invaders_Time_Toggle = 500;

var add_life = false;
var kill_life = false;
var death_pre_time = 0;

const barrier = [
  0x1FFFF8,  //000111111111111111111000
  0x3FFFFC,  //001111111111111111111100
  0x7FFFFE,  //011111111111111111111110
  0xFFFFFF,  //111111111111111111111111
  0xFFFFFF,  //111111111111111111111111
  0xFFFFFF,  //111111111111111111111111
  0xFFFFFF,  //111111111111111111111111
  0xFFFFFF,  //111111111111111111111111
  0xFFC3FF,  //111111111100001111111111
  0xFF81FF,  //111111111000000111111111
  0xFF00FF,  //111111110000000011111111
  0xFE007F,  //111111100000000001111111
  0xFC003F,  //111111000000000000111111
  0xFC003F,  //111111000000000000111111
  0xFC003F,  //111111000000000000111111
  0xFC003F,  //111111000000000000111111
  0xFC003F,  //111111000000000000111111
  0xFC003F,  //111111000000000000111111
];
var shooter = 91;
var LEFT_K = false;
var RIGHT_K = false;
var SPACE_K = false;

var bullet_X = 0;
var bullet_Y = 0;
var bullet_Visible = false;

var barriers = new Array(4);

var B_pixels = 2;//number of pixles per
var y_offset = 350;//Barriers y position

var count = 0;
var SetBitsX = new Array(36);
var SetBitsY = new Array(36);

function create2dArray(w, h, fill) {
	var array = new Array(h);
	for (var i = 0; i < h; i++) {
		array[i] = new Array(w);
		for (var j = 0; j < w; j++) {
			array[i][j] = fill;
		}
	}
	return array;
}
function initBarriers() {
  for (var i = 0; i < 4; i++) {
		barriers[i] = new Array(18);
		for (var j = 0; j < 18; j++) {
    	barriers[i][j] = barrier[j];
		}
  }
}
function drawBarrier(x, y, barrier) {
  noStroke();
  for (var i = 0; i < 18; i++) {
    for (var j = 0; j < 24; j++) {
      if (getBit(i, j, barrier)) {
        fill(theme_Color);
        rect((j * B_pixels) + x, (i * B_pixels) + y, B_pixels, B_pixels);
      }
    }
  }
  
}
function getMin(barrier) {
    var BW = 24 * B_pixels;//Barrier Width
    
    var offset = (width - (BW * 4)) / 5;
    
    return round((offset * (barrier + 1)) + (BW * barrier));
}

function drawBarriers() {
  for (var i = 0; i < 4; i++) {
    
    drawBarrier(getMin(i), y_offset, i);
  }
}
var SectorX = 0;
var SectorY = 0;
var BarrierHit = 0;
function barrierShotAt(pointX, pointY) {
  if ((pointY > y_offset) && (pointY < y_offset + (18 * B_pixels))) {
    for (var i = 0; i < 4; i++) {
      if (getMin(i) < pointX && getMin(i) + 24 * B_pixels > pointX) {
        
        SectorX = pointX - getMin(i);
        SectorY = pointY - y_offset;
        SectorX = floor(SectorX / 12);
        SectorY = floor(SectorY / 12);
				
				//rect(barrier_offsetX*12 + getMin(i), barrier_offsetY*12 + y_offset, 6 * B_pixels, 6 * B_pixels);
				
				for (var y = 0; y < 6; y++) {
					for (var x = 0; x < 6; x++) {
						if (getBit(SectorY * 6 + y, SectorX * 6 + x, i) == 1) {
							fill(255);
							//rect(SectorX*12 + getMin(i), SectorY*12 + y_offset, 6 * B_pixels, 6 * B_pixels);
							
							//bullet_Visible = false;
							BarrierHit = i;
							return true;
						}
					}
				}
				
				
        
      }
    }
  }
  return false;
  
}
var Index_X;
var Index_Y;
function invadersShotAt(pointX, pointY) {
	var PointX = pointX - invaders_x;
	var PointY = pointY - invaders_y;
	Index_X = floor(PointX / 30);
	Index_Y = floor(PointY / 30);

	fill(255);
	if (Index_X >= 0 && Index_X < invaders[0].length) {
		if (Index_Y >= 0 && Index_Y < invaders.length) {
			
			var alien = invaders[Index_Y][Index_X];
			if (alien == -1 || alien == 6) {
				return false;
			}
			var width = aliens[alien].width;
			var offset_x = ((24 - aliens[alien].width) / 2);
			
			var X_MIN = Index_X * 30 + invaders_x + offset_x;
			var X_MAX = Index_X * 30 + invaders_x + offset_x + width;
			
			var Y_MIN = Index_Y * 30 + invaders_y;
			var Y_MAX = Index_Y * 30 + invaders_y + 8;
			
			if ((pointX >= X_MIN) && (pointX <= X_MAX) && (pointY >= Y_MIN) && (pointY <= Y_MAX)) {
				if (invaders[Index_Y][Index_X] != -1) {
					//rect(Index_X * 30 + invaders_x + offset_x, Index_Y * 30 + invaders_y, width, 30);
					//rect(X_MIN, Y_MIN, X_MAX - X_MIN, Y_MAX - Y_MIN);
					return true;
				}
			}
			
			
		}
	}
	return false;
}

var Pause_Index_X;
var Pause_Index_Y;
function kill_invader(pointX, pointY) {

	var alien = invaders[pointY][pointX];
	
	if (alien == 0) {score += 10;}
	if (alien == 2) {score += 20;}
	if (alien == 4) {score += 40;}
	
	invaders[pointY][pointX] = 6;
	bullet_Visible = false;
	Pause = true;
	prePause = millis();
	Pause_Index_X = pointX;
	Pause_Index_Y = pointY;
	
	killed_invaders.push([pointX, pointY, millis()]);
}

function getConstBit(array_index, bit) {
  var n = barrier[array_index];

  return (n & ( 1 << bit )) >> bit;
}

function choose_random(SetBitsX, SetBitsY, count) {
	//for (i = 0; i < count; i++) {
		var random_num = round(random(0, count));
		return random_num;
	//}
}
function getSetConstBits(SectorX, SectorY) {
	var count = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (getConstBit(SectorY * 6 + i, SectorX * 6 + j) == 1) {
				count++;
			}
		}
	}
	return count;
}
function getSetBits(SectorX, SectorY, Barrier) {
	count = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (getBit(SectorY * 6 + i, SectorX * 6 + j, Barrier) == 1) {
				SetBitsX[count] = j
				SetBitsY[count] = i;
				count++;
			}
		}
	}
}
function eraseSecter(SectorX, SectorY, Barrier, Intensity) {
	var amount = getSetConstBits(SectorX, SectorY);
	
	var erase_val = round(amount * Intensity);
	console.log(erase_val);
	for (var i = 0; i < erase_val; i++) {
		getSetBits(SectorX, SectorY, Barrier);
		
		var random_num = round(random(0, count - 1));
		clearBit(SectorY * 6 + SetBitsY[random_num], SectorX * 6 + SetBitsX[random_num], Barrier);
	}
	// Matthew Spotten the creater of this code. DO NOT DELETE THIS LINE
}

function getBit(array_index, bit_L, barrier) {
  var n = barriers[barrier][array_index];

  return (n & ( 1 << bit_L )) >> bit_L;
}

function clearBit(array_index, bit_L, barrier) {
	barriers[barrier][array_index] &= ~(1 << bit_L);
}
function drawBullet() {
	if (bullet_Visible) {
		fill(255);
		rect(bullet_X, bullet_Y, 2, 8);
	}
}
var pre_direction;
//invaders_x
//invaders_y
//direction
//get_invaders_width()

function toggle_invaders() {
	invaders_offset =! invaders_offset;
	
	if (pre_direction != direction) {
		pre_direction = direction;
		invaders_y += 15;
	}
	else {
		pre_direction = direction;
		invaders_x += direction;
		if (get_invaders_width() + invaders_x >= width - 20) {
			direction = -4;
		}
		if (invaders_x <= 20) {
			direction = 4;
		}
	
	}
	
}

function refresh_invaders(x, y) {
	for (var i = 0; i < invaders.length; i++) {
		for (var j = 0; j < invaders[i].length; j++) {
			if (invaders[i][j] != -1) {
				var index = constrain(invaders[i][j] + invaders_offset, 0, 6);
				//print(invaders[i][j]);
				var X = x + j * 30 + ((24 - aliens[index].width) / 2);
				var Y = y + i * 30;
				fill(0);
				rect(X, Y, aliens[index].width, aliens[index].height);
				image(aliens[index], X, Y);
			}
		}
	}
}
function check_state(index) {//return true when all invaders are dead in that column
	for (var i = 0; i < 5; i++) {
		if (invaders[i][index] != -1) {
			return false;
		}
	}
	return true;
}

function pop_invaders(index) {
	for (var i = 0; i < 5; i++) {
		invaders[i].pop();
	}
}
function shift_invaders(index) {
	for (var i = 0; i < 5; i++) {
		invaders[i].shift();
	}
	invaders_x += 30; //shift takes out first column so you need to ajust by adding 30
}

function get_invaders_width() {
	var index = invaders[0].length - 1;
	while(check_state(index)) {
		pop_invaders(index);
		var index = invaders[0].length - 1;
	}
	while (check_state(0)) {
		shift_invaders(0);
		var index = invaders[0].length - 1;
	}
	return index * 30 + 24;
}



function border(c, b) {
	fill(c);
	stroke(b);
	rect(0, 0, width - 1, height - 1);
}
function init_invaders() {
	invaders_shot	= [];
	invaders_shot = create2dArray(3, 11, 0);
	
	invaders_shot_PreMillis = new Array(11);
	for (var i = 0; i < 11; i++) {
		invaders_shot_PreMillis[i] = 0;
	}
	invaders_random_interval = new Array(11);
	for (var i = 0; i < 11; i++) {
		invaders_random_interval[i] = round(random(invaders_shot_MIN, invaders_shot_MAX));
	}
}

function is_Valid(val) {
	if (val != -1 && val != 6) {
		return true;
	}
	return false;
}
function get_lowest(index) {
	if (index > invaders[0].length - 1) {
		return -1;
	}
	for (var i = invaders.length - 1; i >= 0; i--) {
		if (is_Valid(invaders[i][index])) {
			return i;
		}
	}
	return -1;
}
var invaders_shot_PreMillis = [];
var invaders_random_interval = [];
function handle_invader_bullet(i) {
	if (millis() > invaders_shot_PreMillis[i] + invaders_random_interval[i]) {
		if (invaders_shot[i][2] == false) {
			var low = get_lowest(i);
			if (low != -1) {
				invaders_shot_PreMillis[i] = millis();
				invaders_random_interval[i] = round(random(invaders_shot_MIN, invaders_shot_MAX));
				invaders_shot[i][0] = invaders_x + (30 * i) + 12;
				invaders_shot[i][1] = invaders_y + (30 * low) + 8;
				invaders_shot[i][2] = true;
			}
		}
	}
	
	if (invaders_shot[i][2] && barrierShotAt(invaders_shot[i][0], invaders_shot[i][1])) {
		eraseSecter(SectorX, SectorY, BarrierHit, 1/4);
		invaders_shot[i][2] = false;
	}
	
	if (invaders_shot[i][2]) {
		fill(255);
		invaders_shot[i][1] += 8;
		noStroke();
		rect(invaders_shot[i][0], invaders_shot[i][1], 2, 8);
	}
	if (invaders_shot[i][1] > height) {
		invaders_shot[i][2] = false;
	}
	
}
function player_is_hit() {
	for (var i = 0; i < 11; i++) {
		if (invaders_shot[i][2] == true) {
			if (invaders_shot[i][0] >= shooter && invaders_shot[i][0] <= shooter + shooter_img.width) {
				if (invaders_shot[i][1] >= height - 30 && invaders_shot[i][1] <= height - 30 + shooter_img.height) {
					invaders_shot[i][2] = false;
					return true;
				}
			}
		}
	}
	return false;
}
var _exp_frame_preMillis = 0;
var _exp_frame = false;
function toggle_exp_frame(time) {
	if (millis() > _exp_frame_preMillis + time) {
		_exp_frame = !_exp_frame;
		_exp_frame_preMillis = millis();
	}
	if (_exp_frame) {
		return 0;
	}
	else {
		return 1;
	}
	
}
function preload() {
	shooter_img = loadImage("images/shooter.png");
	aliens[0] = loadImage("images/alien_1_frame_0.png");
	aliens[1] = loadImage("images/alien_1_frame_1.png");
	aliens[2] = loadImage("images/alien_2_frame_0.png");
	aliens[3] = loadImage("images/alien_2_frame_1.png");
	aliens[4] = loadImage("images/alien_3_frame_0.png");
	aliens[5] = loadImage("images/alien_3_frame_1.png");
	aliens[6] = loadImage("images/Explosion.png");
	
	shooter_exp[0] = loadImage("images/shooter_explotion_frame_0.png");
	shooter_exp[1] = loadImage("images/shooter_explotion_frame_1.png");
	
	red_ship = loadImage("images/red_space_ship.png");
}
function setup() {
	theme_Color = color(0, 255, 0);
	
	createCanvas(600, 450);//600, 450
	
  tint(theme_Color);
	background(0);
	initBarriers();
	
	init_invaders();
	
	drawBarriers();
	invaders_x = (width - get_invaders_width()) / 2;
	
	ship_random_time = round(random(red_ship_time_MIN, red_ship_time_MAX));
	ship_preMillis = millis();
}

function draw() {

	if (ButtonsMenu) { if (ButtonsMenu.ShowMenu()) return; } // check to display menu
	
	if (!ship_visible) {
		if (millis() > ship_preMillis + ship_random_time) {
			ship_random_time = round(random(red_ship_time_MIN, red_ship_time_MAX));
			ship_preMillis = millis();
			ship_visible = true;
			
			var ran_val = round(random(0, 1));
			if (ran_val == 0) {
				ship_direction = -1;
				ship_X = width + 50;
			}
			if (ran_val == 1) {
				ship_direction = 1;
				ship_X = -50;
			}
		}
	}
	if (ship_visible) {
		ship_X += ship_direction * 2;
		
		if (bullet_Visible) {
			if (bullet_X > ship_X && bullet_X < ship_X + red_ship.width) {
				if (bullet_Y > 35 && bullet_Y < 35 + red_ship.height) {
					ship_visible = false;
					bullet_Visible = false;
					points_earned = floor(random(1, 6)) * 50;
					points_earned_preMillis = millis();
					
					var points = points_earned.toString();
					points_earned_disX = ship_X + (16 - points.length * 3);
					points_earned_disY = 32;
				
					score += points_earned;
				}
			}
		}
	}
	if (ship_X < 0 - 100) {
		ship_visible = false;
	}
	if (ship_X > width + 100) {
		ship_visible = false;
	}

	
	if (killed_invaders.length > 0) {
		if (millis() - killed_invaders[0][2] > invaders_Time_Toggle / 2) { // barly above 500 to avoid conflict
			Pause = false;
			invaders[killed_invaders[0][1]][killed_invaders[0][0]] = -1;
			killed_invaders.shift([]);
			return;
		}
	}
	
	if (LEFT_K && !kill_life) {
		shooter = constrain(shooter - 6, 0, width);
	}
	if (RIGHT_K && !kill_life) {
		shooter = constrain(shooter + 6, 0, width - shooter_img.width);
	}
	//border(0, color(0, 255, 0));
	background(0);
	//border(0, 255);
	
	tint(255);
	//image(aliens[0], 50, 100);
	//printl(aliens[0].height);
	
	//tint(theme_Color);
	//===================================
	if (bullet_Visible) {
		fill(255);
		bullet_Y-=8;
		noStroke();
		rect(bullet_X, bullet_Y, 2, 8);
	}
	if (bullet_Y < 0) {
		bullet_Visible = false;
	}
	//println(kill_life);
	if (SPACE_K && !bullet_Visible && !kill_life) {
		//println(kill_life);
		bullet_X = shooter + shooter_img.width / 2;
		bullet_Y = height - 25;
		bullet_Visible = true;
	}
	//===================================
	
	if (ship_visible) {
		tint(255, 0, 0);
		image(red_ship, ship_X, 35);
	}
	if (points_earned > 0) {
		if (millis() < points_earned_preMillis + 1000) {
			var points = points_earned.toString();
			Pixel_text(points, points_earned_disX, points_earned_disY);
		}
		else {
			points_earned = -1;
		}
	}
	
	fill(theme_Color);
	tint(theme_Color);
	if (!kill_life) {
		image(shooter_img, shooter, height - 30);
	}
	else {
		var frame = toggle_exp_frame(75);
		image(shooter_exp[frame], shooter, height - 30);
		if (millis() > death_pre_time + 1750) {
			kill_life = false;
			lives--;
			shooter = 91;
		}
	}
	rect(0, height - 2, width - 1, 2);
	fill(255);
  drawBarriers();
	
	if (bullet_Visible && barrierShotAt(bullet_X, bullet_Y)) {
		bullet_Visible = false;
		eraseSecter(SectorX, SectorY, BarrierHit, 1/4);
	}
	if (bullet_Visible && invadersShotAt(bullet_X, bullet_Y)) {
		kill_invader(Index_X, Index_Y);
	}
	
		for (var i = 0; i < 11; i++) {
			handle_invader_bullet(i);//TEST ZONE===================================
		}
		if (player_is_hit() && !kill_life) {
			death_pre_time = millis();
			kill_life = true;
		}
	
	
	tint(255);
	refresh_invaders(invaders_x, invaders_y);
	
	if (millis() - invaders_preTime > invaders_Time_Toggle) {
		toggle_invaders();
		invaders_preTime = millis();
	}
	
	tint(theme_Color);
	
	
	setTextColor(color(255));
	setTextSize(2);
	var n = score.toString();
	setCursor(2, 2);
	
	Print("SCORE ");
	setTextColor(theme_Color);
	Print(n);
	
	
	setTextColor(color(255));
	setCursor(width - (shooter_img.width + ((shooter_img.width + 12) * lives)) - 42, 2);
	Print("LIVES  ");
	//println(CurX);
	
	for (var i = 0; i < lives; i++) {
		image(shooter_img, width - (shooter_img.width + ((shooter_img.width + 12) * i)), 2);
	}
	
	//Pixel_text("SCORE: ", 2, 2);
	//Pixel_text(n, 2, 2);
	
	
	if (lives <= 0) {
		//lives--;
		background(0);
		setCursor((width - 108) / 2, (height - 20) / 2);
		Print("GAME OVER");
	}
}
function keyPressed() {
	if (ButtonsMenu) { if (ButtonsMenu.menuKeyPressed(keyCode)) return; } // Give menu a change to capture

	if (keyCode == LEFT_ARROW) {
		LEFT_K = true;
	}
	if (keyCode == RIGHT_ARROW) {
		RIGHT_K = true;
	}
	if (key == ' ') {
		SPACE_K = true;
		//if (bullet_Visible == false) {
			//bullet_X = shooter + shooter_img.width / 2;
			//bullet_Y = height - 25;
			//bullet_Visible = true;
		//}
	}

	if (key == 'H') {
		window.location.assign('./Launch.html')
	}
}
function keyReleased() {
	if (keyCode == LEFT_ARROW) {
		LEFT_K = false;
	}
	if (keyCode == RIGHT_ARROW) {
		RIGHT_K = false;
	}
	if (key == ' ') {
		SPACE_K = false;
	}
}


//Font tab========================================


var textCol = 255;
var textSizeInv = 2; // Had to fix this because it overrides the p5 function textSize - muppets...
var CurX, CurY;

function setTextColor(Color) {
  textSizeInv = Color;
}
function setTextSize(size) {
	textSizeInv = size;
}

function isKthBitSet(n, k)
{
  if (n & (1 << (k - 1))) {
    return true;
  }
  else {
    return false;
  }
}
function drawChar(x, y, Char, color, Size) {
	fill(textCol);
  var c = Char.charCodeAt(0);
  c = c - 32;
  for (var j = 0; j < 5; j++) {  // x advance
    var Line = font[c * 5 + j];
    for (var i = 1; i < 10; i++) {  // y advance
      if (isKthBitSet(Line, i)) {
        rect(x + (j * Size), y + (i * Size), Size, Size);
      }
    }
  }

}
function Pixel_text(text, x, y) {
	for (var i = 0; i < text.length; i++) {
		drawChar(x + i * textSizeInv * 6, y, text[i], textCol, textSizeInv);
	}
}
function setCursor(x, y) {
	CurX = x;
	CurY = y;
}
function Print(text) {
	for (var i = 0; i < text.length; i++) {
		CurX += textSizeInv * 6;
		drawChar(CurX, CurY, text[i], textCol, textSizeInv);
	}
}


var font = [
  0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x5F, 0x00, 0x00,
  0x00, 0x07, 0x00, 0x07, 0x00,
  0x14, 0x7F, 0x14, 0x7F, 0x14,
  0x24, 0x2A, 0x7F, 0x2A, 0x12,
  0x23, 0x13, 0x08, 0x64, 0x62,
  0x36, 0x49, 0x56, 0x20, 0x50,
  0x00, 0x08, 0x07, 0x03, 0x00,
  0x00, 0x1C, 0x22, 0x41, 0x00,
  0x00, 0x41, 0x22, 0x1C, 0x00,
  0x2A, 0x1C, 0x7F, 0x1C, 0x2A,
  0x08, 0x08, 0x3E, 0x08, 0x08,
  0x00, 0x80, 0x70, 0x30, 0x00,
  0x08, 0x08, 0x08, 0x08, 0x08,
  0x00, 0x00, 0x60, 0x60, 0x00,
  0x20, 0x10, 0x08, 0x04, 0x02,
  0x3E, 0x51, 0x49, 0x45, 0x3E,
  0x00, 0x42, 0x7F, 0x40, 0x00,
  0x72, 0x49, 0x49, 0x49, 0x46,
  0x21, 0x41, 0x49, 0x4D, 0x33,
  0x18, 0x14, 0x12, 0x7F, 0x10,
  0x27, 0x45, 0x45, 0x45, 0x39,
  0x3C, 0x4A, 0x49, 0x49, 0x31,
  0x41, 0x21, 0x11, 0x09, 0x07,
  0x36, 0x49, 0x49, 0x49, 0x36,
  0x46, 0x49, 0x49, 0x29, 0x1E,
  0x00, 0x00, 0x14, 0x00, 0x00,
  0x00, 0x40, 0x34, 0x00, 0x00,
  0x00, 0x08, 0x14, 0x22, 0x41,
  0x14, 0x14, 0x14, 0x14, 0x14,
  0x00, 0x41, 0x22, 0x14, 0x08,
  0x02, 0x01, 0x59, 0x09, 0x06,
  0x3E, 0x41, 0x5D, 0x59, 0x4E,
  0x7C, 0x12, 0x11, 0x12, 0x7C,
  0x7F, 0x49, 0x49, 0x49, 0x36,
  0x3E, 0x41, 0x41, 0x41, 0x22,
  0x7F, 0x41, 0x41, 0x41, 0x3E,
  0x7F, 0x49, 0x49, 0x49, 0x41,
  0x7F, 0x09, 0x09, 0x09, 0x01,
  0x3E, 0x41, 0x41, 0x51, 0x73,
  0x7F, 0x08, 0x08, 0x08, 0x7F,
  0x00, 0x41, 0x7F, 0x41, 0x00,
  0x20, 0x40, 0x41, 0x3F, 0x01,
  0x7F, 0x08, 0x14, 0x22, 0x41,
  0x7F, 0x40, 0x40, 0x40, 0x40,
  0x7F, 0x02, 0x1C, 0x02, 0x7F,
  0x7F, 0x04, 0x08, 0x10, 0x7F,
  0x3E, 0x41, 0x41, 0x41, 0x3E,
  0x7F, 0x09, 0x09, 0x09, 0x06,
  0x3E, 0x41, 0x51, 0x21, 0x5E,
  0x7F, 0x09, 0x19, 0x29, 0x46,
  0x26, 0x49, 0x49, 0x49, 0x32,
  0x03, 0x01, 0x7F, 0x01, 0x03,
  0x3F, 0x40, 0x40, 0x40, 0x3F,
  0x1F, 0x20, 0x40, 0x20, 0x1F,
  0x3F, 0x40, 0x38, 0x40, 0x3F,
  0x63, 0x14, 0x08, 0x14, 0x63,
  0x03, 0x04, 0x78, 0x04, 0x03,
  0x61, 0x59, 0x49, 0x4D, 0x43,
  0x00, 0x7F, 0x41, 0x41, 0x41,
  0x02, 0x04, 0x08, 0x10, 0x20,
  0x00, 0x41, 0x41, 0x41, 0x7F,
  0x04, 0x02, 0x01, 0x02, 0x04,
  0x40, 0x40, 0x40, 0x40, 0x40,
  0x00, 0x03, 0x07, 0x08, 0x00,
  0x20, 0x54, 0x54, 0x78, 0x40,
  0x7F, 0x28, 0x44, 0x44, 0x38,
  0x38, 0x44, 0x44, 0x44, 0x28,
  0x38, 0x44, 0x44, 0x28, 0x7F,
  0x38, 0x54, 0x54, 0x54, 0x18,
  0x00, 0x08, 0x7E, 0x09, 0x02,
  0x18, 0xA4, 0xA4, 0x9C, 0x78,
  0x7F, 0x08, 0x04, 0x04, 0x78,
  0x00, 0x44, 0x7D, 0x40, 0x00,
  0x20, 0x40, 0x40, 0x3D, 0x00,
  0x7F, 0x10, 0x28, 0x44, 0x00,
  0x00, 0x41, 0x7F, 0x40, 0x00,
  0x7C, 0x04, 0x78, 0x04, 0x78,
  0x7C, 0x08, 0x04, 0x04, 0x78,
  0x38, 0x44, 0x44, 0x44, 0x38,
  0xFC, 0x18, 0x24, 0x24, 0x18,
  0x18, 0x24, 0x24, 0x18, 0xFC,
  0x7C, 0x08, 0x04, 0x04, 0x08,
  0x48, 0x54, 0x54, 0x54, 0x24,
  0x04, 0x04, 0x3F, 0x44, 0x24,
  0x3C, 0x40, 0x40, 0x20, 0x7C,
  0x1C, 0x20, 0x40, 0x20, 0x1C,
  0x3C, 0x40, 0x30, 0x40, 0x3C,
  0x44, 0x28, 0x10, 0x28, 0x44,
  0x4C, 0x90, 0x90, 0x90, 0x7C,
  0x44, 0x64, 0x54, 0x4C, 0x44,
  0x00, 0x08, 0x36, 0x41, 0x00,
  0x00, 0x00, 0x77, 0x00, 0x00,
  0x00, 0x41, 0x36, 0x08, 0x00,
  0x02, 0x01, 0x02, 0x04, 0x02,
  0x3C, 0x26, 0x23, 0x26, 0x3C,
  0x1E, 0xA1, 0xA1, 0x61, 0x12,
  0x3A, 0x40, 0x40, 0x20, 0x7A,
  0x38, 0x54, 0x54, 0x55, 0x59,
  0x21, 0x55, 0x55, 0x79, 0x41,
  0x22, 0x54, 0x54, 0x78, 0x42, // a-umlaut
  0x21, 0x55, 0x54, 0x78, 0x40,
  0x20, 0x54, 0x55, 0x79, 0x40,
  0x0C, 0x1E, 0x52, 0x72, 0x12,
  0x39, 0x55, 0x55, 0x55, 0x59,
  0x39, 0x54, 0x54, 0x54, 0x59,
  0x39, 0x55, 0x54, 0x54, 0x58,
  0x00, 0x00, 0x45, 0x7C, 0x41,
  0x00, 0x02, 0x45, 0x7D, 0x42,
  0x00, 0x01, 0x45, 0x7C, 0x40,
  0x7D, 0x12, 0x11, 0x12, 0x7D, // A-umlaut
  0xF0, 0x28, 0x25, 0x28, 0xF0,
  0x7C, 0x54, 0x55, 0x45, 0x00,
  0x20, 0x54, 0x54, 0x7C, 0x54,
  0x7C, 0x0A, 0x09, 0x7F, 0x49,
  0x32, 0x49, 0x49, 0x49, 0x32,
  0x3A, 0x44, 0x44, 0x44, 0x3A, // o-umlaut
  0x32, 0x4A, 0x48, 0x48, 0x30,
  0x3A, 0x41, 0x41, 0x21, 0x7A,
  0x3A, 0x42, 0x40, 0x20, 0x78,
  0x00, 0x9D, 0xA0, 0xA0, 0x7D,
  0x3D, 0x42, 0x42, 0x42, 0x3D, // O-umlaut
  0x3D, 0x40, 0x40, 0x40, 0x3D,
  0x3C, 0x24, 0xFF, 0x24, 0x24,
  0x48, 0x7E, 0x49, 0x43, 0x66,
  0x2B, 0x2F, 0xFC, 0x2F, 0x2B,
  0xFF, 0x09, 0x29, 0xF6, 0x20,
  0xC0, 0x88, 0x7E, 0x09, 0x03,
  0x20, 0x54, 0x54, 0x79, 0x41,
  0x00, 0x00, 0x44, 0x7D, 0x41,
  0x30, 0x48, 0x48, 0x4A, 0x32,
  0x38, 0x40, 0x40, 0x22, 0x7A,
  0x00, 0x7A, 0x0A, 0x0A, 0x72,
  0x7D, 0x0D, 0x19, 0x31, 0x7D,
  0x26, 0x29, 0x29, 0x2F, 0x28,
  0x26, 0x29, 0x29, 0x29, 0x26,
  0x30, 0x48, 0x4D, 0x40, 0x20,
  0x38, 0x08, 0x08, 0x08, 0x08,
  0x08, 0x08, 0x08, 0x08, 0x38,
  0x2F, 0x10, 0xC8, 0xAC, 0xBA,
  0x2F, 0x10, 0x28, 0x34, 0xFA,
  0x00, 0x00, 0x7B, 0x00, 0x00,
  0x08, 0x14, 0x2A, 0x14, 0x22,
  0x22, 0x14, 0x2A, 0x14, 0x08,
  0x55, 0x00, 0x55, 0x00, 0x55, // #176 (25% block) missing in old code
  0xAA, 0x55, 0xAA, 0x55, 0xAA, // 50% block
  0xFF, 0x55, 0xFF, 0x55, 0xFF, // 75% block
  0x00, 0x00, 0x00, 0xFF, 0x00,
  0x10, 0x10, 0x10, 0xFF, 0x00,
  0x14, 0x14, 0x14, 0xFF, 0x00,
  0x10, 0x10, 0xFF, 0x00, 0xFF,
  0x10, 0x10, 0xF0, 0x10, 0xF0,
  0x14, 0x14, 0x14, 0xFC, 0x00,
  0x14, 0x14, 0xF7, 0x00, 0xFF,
  0x00, 0x00, 0xFF, 0x00, 0xFF,
  0x14, 0x14, 0xF4, 0x04, 0xFC,
  0x14, 0x14, 0x17, 0x10, 0x1F,
  0x10, 0x10, 0x1F, 0x10, 0x1F,
  0x14, 0x14, 0x14, 0x1F, 0x00,
  0x10, 0x10, 0x10, 0xF0, 0x00,
  0x00, 0x00, 0x00, 0x1F, 0x10,
  0x10, 0x10, 0x10, 0x1F, 0x10,
  0x10, 0x10, 0x10, 0xF0, 0x10,
  0x00, 0x00, 0x00, 0xFF, 0x10,
  0x10, 0x10, 0x10, 0x10, 0x10,
  0x10, 0x10, 0x10, 0xFF, 0x10,
  0x00, 0x00, 0x00, 0xFF, 0x14,
  0x00, 0x00, 0xFF, 0x00, 0xFF,
  0x00, 0x00, 0x1F, 0x10, 0x17,
  0x00, 0x00, 0xFC, 0x04, 0xF4,
  0x14, 0x14, 0x17, 0x10, 0x17,
  0x14, 0x14, 0xF4, 0x04, 0xF4,
  0x00, 0x00, 0xFF, 0x00, 0xF7,
  0x14, 0x14, 0x14, 0x14, 0x14,
  0x14, 0x14, 0xF7, 0x00, 0xF7,
  0x14, 0x14, 0x14, 0x17, 0x14,
  0x10, 0x10, 0x1F, 0x10, 0x1F,
  0x14, 0x14, 0x14, 0xF4, 0x14,
  0x10, 0x10, 0xF0, 0x10, 0xF0,
  0x00, 0x00, 0x1F, 0x10, 0x1F,
  0x00, 0x00, 0x00, 0x1F, 0x14,
  0x00, 0x00, 0x00, 0xFC, 0x14,
  0x00, 0x00, 0xF0, 0x10, 0xF0,
  0x10, 0x10, 0xFF, 0x10, 0xFF,
  0x14, 0x14, 0x14, 0xFF, 0x14,
  0x10, 0x10, 0x10, 0x1F, 0x00,
  0x00, 0x00, 0x00, 0xF0, 0x10,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
  0xF0, 0xF0, 0xF0, 0xF0, 0xF0,
  0xFF, 0xFF, 0xFF, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xFF, 0xFF,
  0x0F, 0x0F, 0x0F, 0x0F, 0x0F,
  0x38, 0x44, 0x44, 0x38, 0x44,
  0xFC, 0x4A, 0x4A, 0x4A, 0x34, // sharp-s or beta
  0x7E, 0x02, 0x02, 0x06, 0x06,
  0x02, 0x7E, 0x02, 0x7E, 0x02,
  0x63, 0x55, 0x49, 0x41, 0x63,
  0x38, 0x44, 0x44, 0x3C, 0x04,
  0x40, 0x7E, 0x20, 0x1E, 0x20,
  0x06, 0x02, 0x7E, 0x02, 0x02,
  0x99, 0xA5, 0xE7, 0xA5, 0x99,
  0x1C, 0x2A, 0x49, 0x2A, 0x1C,
  0x4C, 0x72, 0x01, 0x72, 0x4C,
  0x30, 0x4A, 0x4D, 0x4D, 0x30,
  0x30, 0x48, 0x78, 0x48, 0x30,
  0xBC, 0x62, 0x5A, 0x46, 0x3D,
  0x3E, 0x49, 0x49, 0x49, 0x00,
  0x7E, 0x01, 0x01, 0x01, 0x7E,
  0x2A, 0x2A, 0x2A, 0x2A, 0x2A,
  0x44, 0x44, 0x5F, 0x44, 0x44,
  0x40, 0x51, 0x4A, 0x44, 0x40,
  0x40, 0x44, 0x4A, 0x51, 0x40,
  0x00, 0x00, 0xFF, 0x01, 0x03,
  0xE0, 0x80, 0xFF, 0x00, 0x00,
  0x08, 0x08, 0x6B, 0x6B, 0x08,
  0x36, 0x12, 0x36, 0x24, 0x36,
  0x06, 0x0F, 0x09, 0x0F, 0x06,
  0x00, 0x00, 0x18, 0x18, 0x00,
  0x00, 0x00, 0x10, 0x10, 0x00,
  0x30, 0x40, 0xFF, 0x01, 0x01,
  0x00, 0x1F, 0x01, 0x01, 0x1E,
  0x00, 0x19, 0x1D, 0x17, 0x12,
  0x00, 0x3C, 0x3C, 0x3C, 0x3C,
  0x00, 0x00, 0x00, 0x00, 0x00  // #255 NBSP
];