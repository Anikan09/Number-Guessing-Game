let numberToGuess = Math.round(Math.random() * 100);
let tries = 0; 

function guessTheNumber() {
    tries = tries + 1;
    displayTries.innerHTML = 'Tries: ' + tries;

    if(numberToGuess == myNumber.value) {
        headline.innerHTML = 'You won !!! 🥳';
        let jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();

    }


    if(numberToGuess > myNumber.value) {
        headline.innerHTML = 'Higher! 📈';
    } else {
        headline.innerHTML = 'Lower! 📉';
    }

    myNumber.value = '';

    const JSConfetti = (function () {
  "use strict";

  // === Utility Functions ===
  function toNumber(pxString) {
    return +pxString.replace(/px/, "");
  }

  function randomBetween(min, max, decimals = 0) {
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(decimals));
  }

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function screenScale(width) {
    return Math.log(width) / Math.log(1920);
  }

  const DEFAULT_COLORS = [
    "#fcf403", "#62fc03", "#f4fc03", "#03e7fc",
    "#03fca5", "#a503fc", "#fc03ad", "#fc03c2"
  ];

  // === Confetti Particle ===
  class ConfettiShape {
    constructor({ initialPosition, direction, confettiRadius, confettiColors, emojis, emojiSize, canvasWidth }) {
      const scale = screenScale(canvasWidth);
      const speed = randomBetween(0.9, 1.7, 3) * scale;

      this.confettiSpeed = { x: speed, y: speed };
      this.finalSpeedX = randomBetween(0.2, 0.6, 3);
      this.rotationSpeed = emojis.length ? 0.01 : randomBetween(0.03, 0.07, 3) * scale;
      this.drag = randomBetween(0.0005, 0.0009, 6);
      this.radius = { x: confettiRadius, y: confettiRadius };
      this.initialRadius = confettiRadius;
      this.rotationAngle = direction === "left" ? randomBetween(0, 0.2, 3) : randomBetween(-0.2, 0, 3);
      this.emojiSize = emojiSize;
      this.emojiRotation = randomBetween(0, 2 * Math.PI);
      this.radiusYDirection = "down";

      const angle = direction === "left"
        ? randomBetween(15, 82) * Math.PI / 180
        : randomBetween(-82, -15) * Math.PI / 180;

      this.absCos = Math.abs(Math.cos(angle));
      this.absSin = Math.abs(Math.sin(angle));

      const verticalOffset = randomBetween(-150, 0);
      const position = {
        x: initialPosition.x + (direction === "left" ? -verticalOffset : verticalOffset) * this.absCos,
        y: initialPosition.y + verticalOffset * this.absSin
      };

      this.currentPosition = { ...position };
      this.initialPosition = { ...position };
      this.color = emojis.length ? null : randomChoice(confettiColors);
      this.emoji = emojis.length ? randomChoice(emojis) : null;
      this.createdAt = Date.now();
      this.direction = direction;
    }

    draw(ctx) {
      const { x, y } = this.currentPosition;
      const { x: rx, y: ry } = this.radius;
      const scale = window.devicePixelRatio;

      if (this.color) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x * scale, y * scale, rx * scale, ry * scale, this.rotationAngle, 0, 2 * Math.PI);
        ctx.fill();
      } else if (this.emoji) {
        ctx.font = `${this.emojiSize}px serif`;
        ctx.save();
        ctx.translate(x * scale, y * scale);
        ctx.rotate(this.emojiRotation);
        ctx.textAlign = "center";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
      }
    }

    updatePosition(deltaTime, currentTime) {
      if (this.confettiSpeed.x > this.finalSpeedX) {
        this.confettiSpeed.x -= this.drag * deltaTime;
      }

      const timeSinceStart = currentTime - this.createdAt;

      const dx = this.confettiSpeed.x * (this.direction === "left" ? -this.absCos : this.absCos);
      const dy = this.initialPosition.y - this.confettiSpeed.y * this.absSin * timeSinceStart + 0.00125 * Math.pow(timeSinceStart, 2) / 2;

      this.currentPosition.x += dx * deltaTime;
      this.currentPosition.y = dy;

      // Update rotation
      this.rotationSpeed = Math.max(0, this.rotationSpeed - (this.emoji ? 1e-4 : 1e-5 * deltaTime));
      if (this.emoji) {
        this.emojiRotation = (this.emojiRotation + this.rotationSpeed * deltaTime) % (2 * Math.PI);
      } else {
        if (this.radiusYDirection === "down") {
          this.radius.y -= this.rotationSpeed * deltaTime;
          if (this.radius.y <= 0) {
            this.radius.y = 0;
            this.radiusYDirection = "up";
          }
        } else {
          this.radius.y += this.rotationSpeed * deltaTime;
          if (this.radius.y >= this.initialRadius) {
            this.radius.y = this.initialRadius;
            this.radiusYDirection = "down";
          }
        }
      }
    }

    isVisible(canvasHeight) {
      return this.currentPosition.y < canvasHeight + 100;
    }
  }

  // === Confetti Batch ===
  class ConfettiBatch {
    constructor(ctx) {
      this.ctx = ctx;
      this.shapes = [];
      this.resolvePromise = null;
      this.promise = new Promise(res => this.resolvePromise = res);
    }

    getPromise() {
      return this.promise;
    }

    addShapes(...newShapes) {
      this.shapes.push(...newShapes);
    }

    isComplete() {
      if (!this.shapes.length && this.resolvePromise) {
        this.resolvePromise();
        return true;
      }
      return false;
    }

    process({ timeDelta, currentTime }, canvasHeight, visibilityCheck) {
      this.shapes = this.shapes.filter(shape => {
        shape.updatePosition(timeDelta, currentTime);
        shape.draw(this.ctx);
        return !visibilityCheck || shape.isVisible(canvasHeight);
      });
    }
  }

  // === Canvas Handling ===
  function createCanvas() {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "fixed",
      width: "100%",
      height: "100%",
      top: "0",
      left: "0",
      zIndex: "1000",
      pointerEvents: "none"
    });
    document.body.appendChild(canvas);
    return canvas;
  }

  function normalizeSettings(options) {
    const {
      confettiRadius = 6,
      confettiNumber = options.confettiesNumber || (options.emojis ? 40 : 250),
      confettiColors = DEFAULT_COLORS,
      emojis = options.emojies || [],
      emojiSize = 80
    } = options;

    if (options.emojies) console.error("Use `emojis` instead of `emojies`");
    if (options.confettiesNumber) console.error("Use `confettiNumber` instead of `confettiesNumber`");

    return { confettiRadius, confettiNumber, confettiColors, emojis, emojiSize };
  }

  // === JSConfetti Main Class ===
  class JSConfetti {
    constructor(options = {}) {
      this.canvas = options.canvas || createCanvas();
      this.ctx = this.canvas.getContext("2d");
      this.activeBatches = [];
      this.lastUpdate = Date.now();
      this.rafRequested = false;
      this.iteration = 0;
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    loop() {
      this.rafRequested = false;

      const scale = window.devicePixelRatio;
      const style = getComputedStyle(this.canvas);
      const width = toNumber(style.getPropertyValue("width"));
      const height = toNumber(style.getPropertyValue("height"));

      this.canvas.width = width * scale;
      this.canvas.height = height * scale;

      const now = Date.now();
      const delta = now - this.lastUpdate;
      const canvasHeight = this.canvas.offsetHeight;
      const visibilityCheck = this.iteration++ % 10 === 0;

      this.activeBatches = this.activeBatches.filter(batch => {
        batch.process({ timeDelta: delta, currentTime: now }, canvasHeight, visibilityCheck);
        return !visibilityCheck || !batch.isComplete();
      });

      this.queueNextFrame(now);
    }

    queueNextFrame(timestamp) {
      if (!this.rafRequested && this.activeBatches.length) {
        this.rafRequested = true;
        this.lastUpdate = timestamp || Date.now();
        requestAnimationFrame(this.loop);
      }
    }

    addConfetti(options = {}) {
      const settings = normalizeSettings(options);
      const { confettiRadius, confettiNumber, confettiColors, emojis, emojiSize } = settings;

      const { width, height } = this.canvas.getBoundingClientRect();
      const launchY = height * 5 / 7;

      const leftPos = { x: 0, y: launchY };
      const rightPos = { x: width, y: launchY };

      const batch = new ConfettiBatch(this.ctx);

      for (let i = 0; i < confettiNumber / 2; i++) {
        const shapeRight = new ConfettiShape({ initialPosition: leftPos, direction: "right", confettiRadius, confettiColors, emojis, emojiSize, canvasWidth: width });
        const shapeLeft = new ConfettiShape({ initialPosition: rightPos, direction: "left", confettiRadius, confettiColors, emojis, emojiSize, canvasWidth: width });
        batch.addShapes(shapeRight, shapeLeft);
      }

      this.activeBatches.push(batch);
      this.queueNextFrame();

      return batch.getPromise();
    }

    clearCanvas() {
      this.activeBatches = [];
    }

    destroyCanvas() {
      this.canvas.remove();
    }
  }

  return JSConfetti;
  
  let correctGuess(userGuess, correctNumber) {
    if (userGuess === correctNumber) {
      correctGuesses++;
      localStorage.setItem("correctGuesses", correctGuesses);
      console.log("Correct! You already have" + correctGuesses + "right");
      } else {
        console.log("Wrong.");
      }
  }
})();    
}

// localStorage.removeItem("correctGuesses");