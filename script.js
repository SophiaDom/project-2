 // https://editor.p5js.org/osolis/sketches/kCmZPN53I
// "Grid + Distortion"
// By: osolis

let str = "";
let letterParts = [];
let distortions = ["Blur", "Pixelate", "Threshold", "Rotate", "Invert"];
let colsslider, rowslider, distortButton, randomizeButton;
let cols, rows, colwidth, rowheight;
let randomizeToggle = true;
let randomizeCheckbox;
let showGrid = true;



function setup() {
  createCanvas(windowWidth, windowHeight);

  colsslider = createSlider(2, 36, 8);
  colsslider.position(250, 10);
  colsslider.size(200);
  colsslider.class('colsslider');

  rowslider = createSlider(2, 36, 8);
  rowslider.position(250, 30);
  rowslider.size(200);
  rowslider.class('rowslider');

  distortButton = createButton("New");
  distortButton.position(620, 18);
  distortButton.size(75, 25);
  distortButton.mousePressed(updateTextParts);
  distortButton.class('new-btn');

  randomizeCheckbox = createCheckbox('Randomize', true); 
  randomizeCheckbox.position(490, 10);
  randomizeCheckbox.size(100, 25);
  randomizeCheckbox.changed(toggleRandomize);
  randomizeCheckbox.class('randomize-check');

  let formatSelect = createSelect();
  formatSelect.position(800, 18);
  formatSelect.size(17, 25);
  formatSelect.option('png');
  formatSelect.option('jpg');
  formatSelect.option('pdf');
  formatSelect.class('selection');

  let saveButton = createButton("Save");
  saveButton.position(725, 18);
  saveButton.size(75, 25);
  saveButton.class('save-btn');
  saveButton.mousePressed(() => {
  let format = formatSelect.value();
  if (format === 'pdf') {
    saveCanvasAsPDF(); 
  } else if (format === 'png') {
    saveTransparentPNG('distorted_text');
  } else {
    saveCanvas('distorted_text', format);
  }
});

  let gridCheckbox = createCheckbox("Grid", true);
  gridCheckbox.position(490, 30);
  gridCheckbox.class('grid-check');
  gridCheckbox.changed(() => showGrid = gridCheckbox.checked());

  textAlign(CENTER, CENTER);
  background(255);
}



function toggleRandomize() {
    randomizeToggle = randomizeCheckbox.checked(); // Get the checkbox state
  }

function saveTransparentPNG(filename) {
  let gfx = createGraphics(width, height);
  gfx.pixelDensity(1); // optional: keep same scaling

  gfx.clear(); // ensures full transparency

  for (let i = 0; i < letterParts.length; i++) {
    let x = randomizeToggle ? random(0, width - colwidth) : letterParts[i].x;
    let y = randomizeToggle ? random(0, height - rowheight) : letterParts[i].y;
    gfx.image(letterParts[i].img, x, y, colwidth, rowheight);
  }

  if (showGrid) {
    gfx.stroke(235);
    for (let x = 0; x <= cols; x++) {
      gfx.line(x * colwidth, 0, x * colwidth, height);
    }
    for (let y = 0; y <= rows; y++) {
      gfx.line(0, y * rowheight, width, y * rowheight);
    }
  }

  save(gfx, `${filename}.png`);
}

function updateTextParts() {
  cols = colsslider.value();
  rows = rowslider.value();
  colwidth = windowWidth / cols;
  rowheight = windowHeight / rows;

  letterParts = [];

  let pg = createGraphics(windowWidth, windowHeight);
  pg.textAlign(CENTER, CENTER);

  let lines = str.split('\n');
  let maxLine = lines.reduce((a, b) => a.length > b.length ? a : b);

  let maxFontSize = height * 0.9;
  pg.textSize(maxFontSize);

  while (
    pg.textWidth(maxLine) > width * 0.9 ||
    lines.length * pg.textAscent() * 1.2 > height * 0.9
  ) {
    maxFontSize *= 0.95;
    pg.textSize(maxFontSize);
  }

  let lineHeight = pg.textAscent() * 1.2;
  let yOffset = (height - (lines.length * lineHeight)) / 2;

  for (let i = 0; i < lines.length; i++) {
    pg.text(lines[i], width / 2, yOffset + i * lineHeight + lineHeight / 2);
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let part = pg.get(x * colwidth, y * rowheight, colwidth, rowheight);
      part = applyRandomDistortion(part);
      letterParts.push({ img: part, x: x * colwidth, y: y * rowheight });
    }
  }

  drawParts();
}

function applyRandomDistortion(part) {
  let first = random(distortions);
  part = applySpecificDistortion(part, first);

  if (random() < 0.5) {
    let second;
    do {
      second = random(distortions);
    } while (second === first);
    part = applySpecificDistortion(part, second);
  }

  return part;
}

function applySpecificDistortion(part, type) {
  if (type === "Blur") {
    part.filter(BLUR, random(1, 5));
  } else if (type === "Pixelate") {
    part.loadPixels();
    let pixelSize = int(random(5, 20));
    for (let y = 0; y < part.height; y += pixelSize) {
      for (let x = 0; x < part.width; x += pixelSize) {
        let i = (y * part.width + x) * 4;
        let r = part.pixels[i];
        let g = part.pixels[i + 1];
        let b = part.pixels[i + 2];
        for (let dy = 0; dy < pixelSize; dy++) {
          for (let dx = 0; dx < pixelSize; dx++) {
            let j = ((y + dy) * part.width + (x + dx)) * 4;
            if (j < part.pixels.length - 4) {
              part.pixels[j] = r;
              part.pixels[j + 1] = g;
              part.pixels[j + 2] = b;
            }
          }
        }
      }
    }
    part.updatePixels();
    part.filter(GRAY);
  } else if (type === "Threshold") {
    part.filter(THRESHOLD, random(0.3, 0.7));
  } else if (type === "Invert") {
    part.filter(INVERT);
  } else if (type === "Rotate") {
    let angle = random([PI / 2, PI, (3 * PI) / 2]);
    let pg = createGraphics(part.width, part.height);
    pg.translate(pg.width / 2, pg.height / 2);
    pg.rotate(angle);
    pg.image(part, -part.width / 2, -part.height / 2);
    part = pg;
  }

  return part;
}

function startEffect() {
    const input = document.getElementById('userInput').value;
    if (input) {
      let formatted = '';
      let currentLine = '';
      let maxLineLength = 8; // Set the maximum line length to 8 characters
      let words = input.split(' '); // Split the input by spaces
      
      for (let i = 0; i < words.length; i++) {
        // Check if adding the next word exceeds the maximum line length
        if ((currentLine + words[i]).length <= maxLineLength) {
          currentLine += words[i] + ' '; // Add the word to the current line
        } else {
          formatted += currentLine.trim() + '\n'; // Start a new line
          currentLine = words[i] + ' '; // Start the new line with the current word
        }
      }
      formatted += currentLine.trim();
      
      // Now `formatted` contains the input split by spaces with no word exceeding 8 characters
      str = formatted.trim();
      updateTextParts();
    }
  }

function drawParts() {
  background(255);

  for (let i = 0; i < letterParts.length; i++) {
    let randomX = randomizeToggle ? random(0, width - colwidth) : letterParts[i].x;
    let randomY = randomizeToggle ? random(0, height - rowheight) : letterParts[i].y;
    image(letterParts[i].img, randomX, randomY, colwidth, rowheight);
  }

  if (showGrid) {
    stroke(235);
    for (let x = 0; x <= cols; x++) {
      line(x * colwidth, 0, x * colwidth, height);
    }
    for (let y = 0; y <= rows; y++) {
      line(0, y * rowheight, width, y * rowheight);
    }
  }
}

function saveCanvasAsPDF() {
  let pdfGraphics = createGraphics(width, height);
  pdfGraphics.background(255);

  for (let i = 0; i < letterParts.length; i++) {
    let x = randomizeToggle ? random(0, width - colwidth) : letterParts[i].x;
    let y = randomizeToggle ? random(0, height - rowheight) : letterParts[i].y;
    pdfGraphics.image(letterParts[i].img, x, y, colwidth, rowheight);
  }

  if (showGrid) {
    pdfGraphics.stroke(235);
    for (let x = 0; x <= cols; x++) {
      pdfGraphics.line(x * colwidth, 0, x * colwidth, height);
    }
    for (let y = 0; y <= rows; y++) {
      pdfGraphics.line(0, y * rowheight, width, y * rowheight);
    }
  }

  save(pdfGraphics, 'distorted_text.pdf');
}
