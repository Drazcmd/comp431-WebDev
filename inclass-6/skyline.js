'use strict'

var createApp = function(canvas) { 
	var c = canvas.getContext("2d");

	// Create the ground
	var floor = canvas.height/2
	var grad = c.createLinearGradient(0,floor,0,canvas.height)
	grad.addColorStop(0, "green")
	grad.addColorStop(1, "black")
	c.fillStyle=grad
	c.fillRect(0, floor, canvas.width, canvas.height)

	// common size for windows
	var windowSpacing = 2, floorSpacing = 3
	var windowHeight = 5, windowWidth = 3

	// colors of buildings
	var blgColors = [ 'red', 'blue', 'gray', 'orange'] 
	var windowColors = ["black", "yellow"]
	var existingBuildings = []

	//build a building
	var build = function() { 
		var x0 = Math.random()*canvas.width
		var blgWidth = (windowWidth+windowSpacing) * Math.floor(Math.random()*10)
		var blgHeight = Math.random()*canvas.height/2
		var blgStyleChoice = Math.floor(Math.random()*blgColors.length)
		var blgDraw = function() {
			c.fillStyle=blgColors[blgStyleChoice]
			c.fillRect(x0, floor - blgHeight, blgWidth, blgHeight)	
			for (var y = floor - floorSpacing; y > floor - blgHeight; y -= floorSpacing + windowHeight) {
				for (var x = windowSpacing; x < blgWidth - windowWidth; x += windowSpacing + windowWidth) {
					var fillInt = Math.floor(Math.random() * 2)
					c.fillStyle=windowColors[fillInt]
					c.fillRect(x0 + x, y - windowHeight, windowWidth, windowHeight)
				}
			}
		}
		setInterval(blgDraw, 100)
	}

	return {
		build: build
	}
}

window.onload = function() {
	var app = createApp(document.querySelector("canvas"))
	document.getElementById("build").onclick = app.build
}

