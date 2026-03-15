let state = "menu";
let scans = [];
let panelOpen = false;
let selectedScan = null;
let panelAlpha = 0;
let grainDensity = 10000; // number of tiny dots per frame

// Glow colors per scan
const glowColors = ["#FF69B4", "#00BFFF", "#7FFF00"];

// Copenhagen scans
const cityScans = {
  copenhagen: [
    {img: "scans/scan1.JPG", location: "Nørrebro kiosk", date: "March 2026"},
    {img: "scans/scan2.JPG", location: "Vesterbro newsstand", date: "Feb 2026"},
    {img: "scans/scan3.JPG", location: "Central station shop", date: "Jan 2026"},
    {img: "scans/scan4.JPG", location: "Central station shop", date: "Jan 2026"},
    {img: "scans/scan5.JPG", location: "Central station shop", date: "Jan 2026"},
  ]
};

// ---- Scan class ----
class Scan {

  constructor(imgPath, location, date){

    this.img = loadImage(imgPath);

    this.x = random(window.innerWidth);
    this.y = random(window.innerHeight);

    // gentle base velocity
    this.vx = random(-0.05, 0.05);
    this.vy = random(-0.05, 0.05);

    // organic floating offsets
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);

    this.z = random(0.7, 1.3);

    this.baseSize = random(60, 90) * this.z;
    this.size = this.baseSize;

    this.location = location;
    this.date = date;

    this.glowColor = random(["#FF69B4","#00BFFF","#7FFF00"]);
  }


  move(){

    // organic floating motion
    this.x += this.vx + map(noise(this.noiseOffsetX),0,1,-0.2,0.2);
    this.y += this.vy + map(noise(this.noiseOffsetY),0,1,-0.2,0.2);

    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;

    // keep scans inside screen
    if(this.x < 0 || this.x > width){
      this.vx *= -1;
    }

    if(this.y < 0 || this.y > height){
      this.vy *= -1;
    }

  }


  display(){

    let d = dist(mouseX, mouseY, this.x, this.y);

    let targetSize =
      d < this.baseSize
      ? this.baseSize * 1.5
      : this.baseSize;

    this.size = lerp(this.size, targetSize, 0.05);

    push();

    translate(this.x, this.y);

    if(d < this.size){
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = this.glowColor;
    } else {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = "rgba(0,0,0,0.1)";
    }

    imageMode(CENTER);
    image(this.img,0,0,this.size,this.size);

    pop();

  }
}

// ---- Setup ----
function setup(){
  createCanvas(window.innerWidth, window.innerHeight);
  textAlign(CENTER, CENTER);
  textFont('Input Mono');
  textStyle(BOLD);
}
function drawGrain(){
  noStroke();
  fill(0,50); // black with very low opacity
  for(let i=0;i<grainDensity;i++){
    let gx = random(width);
    let gy = random(height);
    rect(gx, gy, 1, 1); // single pixel dot
  }
}

// ---- Draw ----
function draw(){
  background(255);

  if(state === "menu") drawMenu();
  else drawCityWorld();
}
function draw(){
  background(255);

  drawGrain(); // add subtle grain texture

  if(state === "menu") drawMenu();
  else drawCityWorld();
}

// ---- Menu ----
function drawMenu(){
  let centerY = height/2;
  textSize(80);
  fill(0);
  textStyle(BOLD);
  text("SCAN ARCHIVE", width/2, centerY-30);

  textSize(40);
  fill(dist(mouseX, mouseY, width/2, centerY+40) < 100 ? 50 : 0);
  textStyle(BOLD);
  text("Copenhagen", width/2, centerY+40);
}

// ---- Draw star shape ----
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle/2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle){
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// ---- Copenhagen scan world ----
function drawCityWorld(){
  if(scans.length===0){
    for(let s of cityScans.copenhagen){
      scans.push(new Scan(s.img, s.location, s.date));
    }
  }

  // network lines — soft, transparent blue
  stroke("rgba(0,191,255,0.25)");
  strokeWeight(1.5);
  for(let i=0;i<scans.length;i++){
    for(let j=i+1;j<scans.length;j++){
      line(scans[i].x, scans[i].y, scans[j].x, scans[j].y);
    }
  }

  for(let s of scans){
    s.move();
    s.display();
  }

  if(panelOpen){
    panelAlpha = lerp(panelAlpha, 255, 0.1);
  } else {
    panelAlpha = lerp(panelAlpha, 0, 0.1);
  }

 if(panelAlpha > 5 && selectedScan){

  let lines = [
    `Location: ${selectedScan.location}`,
    `Date: ${selectedScan.date}`
  ];

  let lineHeight = 20;

  // Panel position (lower so star doesn't get cut off)
  let panelX = width - 170;
  let panelY = 180;

  fill(255, panelAlpha);
  stroke(0, panelAlpha);
  strokeWeight(2);

  // Bigger star
  drawStar(panelX, panelY, 90, 140, 7);

  // Title
  noStroke();
  fill(0, panelAlpha);
  textStyle(BOLD);
  textSize(14);
  text("Scan Info", panelX, panelY - 30);

  // Metadata text
  textStyle(NORMAL);
  textSize(12);

  for(let i=0;i<lines.length;i++){
    text(lines[i], panelX, panelY + i * lineHeight);
  }
  }
}

// ---- Mouse click ----
function mousePressed(){
  if(state==="menu"){
    let centerY = height/2 + 40;
    if(dist(mouseX, mouseY, width/2, centerY)<100){
      state = "copenhagen";
      scans=[];
    }
  } else {
    let clickedOnScan = false;
    for(let s of scans){
      if(dist(mouseX, mouseY, s.x, s.y)<s.size){
        selectedScan = s;
        panelOpen = true;
        clickedOnScan = true;
      }
    }
    if(!clickedOnScan){
      panelOpen = false;
      selectedScan = null;
    }
  }
}

// ---- Window resize ----
function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}
