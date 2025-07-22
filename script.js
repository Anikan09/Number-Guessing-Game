let numberToGuess = Math.round(Math.random() * 100);
let tries = 0;
let correct = 0;

const myNumber = document.getElementById("myNumber");
const headline = document.getElementById("headline");
const displayTries = document.getElementById("displayTries");
const correctDisplay = document.getElementById("correct");

function guessTheNumber() {
    tries = tries + 1;
    displayTries.innerHTML = 'Tries: ' + tries;

    const userGuess = parseInt(myNumber.value);

    if (numberToGuess === userGuess) {
        correct = correct + 1;
        headline.innerHTML = 'You won!!! 🥳🎉';
        correctDisplay.innerHTML = 'Correct: ' + correct;

        const correctList = document.getElementById("correctList");
        const listItem = document.createElement("li");
        listItem.textContent = userGuess;
        correctList.appendChild(listItem);

        let jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();

        numberToGuess = Math.round(Math.random() * 100);
    }
    else if (numberToGuess > userGuess) {
        headline.innerHTML = 'The number is higher! 😃';
    }
    else {
        headline.innerHTML = 'The number is lower! 😢';
    }

    myNumber.value = '';
}

var JSConfetti = (function () {
  "use strict";

  function assertInstance(instance, constructor) {
    if (!(instance instanceof constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      const descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function createClass(constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(constructor.prototype, protoProps);
    if (staticProps) defineProperties(constructor, staticProps);
    return constructor;
  }

  function parsePx(value) {
    return +value.replace(/px/, "");
  }

  function randomBetween(min, max, precision = 0) {
    const rand = Math.random() * (max - min) + min;
    return Math.floor(rand * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  function randomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  const defaultColors = [
    "#fcf403", "#62fc03", "#f4fc03",
    "#03e7fc", "#03fca5", "#a503fc",
    "#fc03ad", "#fc03c2"
  ];

  function scalingFactor(width) {
    return Math.log(width) / Math.log(1920);
  }

  const ConfettiShape = createClass(function ConfettiShape(options) {
    assertInstance(this, ConfettiShape);

    const {
      initialPosition,
      direction,
      confettiRadius,
      confettiColors,
      emojis,
      emojiSize,
      canvasWidth
    } = options;

    const velocity = randomBetween(0.9, 1.7, 3) * scalingFactor(canvasWidth);

    this.confettiSpeed = { x: velocity, y: velocity };
    this.finalConfettiSpeedX = randomBetween(0.2, 0.6, 3);
    this.rotationSpeed = emojis.length ? 0.01 : randomBetween(0.03, 0.07, 3) * scalingFactor(canvasWidth);
    this.dragForceCoefficient = randomBetween(0.0005, 0.0009, 6);
    this.radius = { x: confettiRadius, y: confettiRadius };
    this.initialRadius = confettiRadius;

    this.rotationAngle = direction === "left"
      ? randomBetween(0, 0.2, 3)
      : randomBetween(-0.2, 0, 3);

    this.emojiSize = emojiSize;
    this.emojiRotationAngle = randomBetween(0, 2 * Math.PI);
    this.radiusYUpdateDirection = "down";

    const angle = direction === "left"
      ? randomBetween(15, 82) * Math.PI / 180
      : randomBetween(-82, -15) * Math.PI / 180;

    this.absCos = Math.abs(Math.cos(angle));
    this.absSin = Math.abs(Math.sin(angle));

    const yOffset = randomBetween(-150, 0);
    const startPos = {
      x: initialPosition.x + (direction === "left" ? -yOffset : yOffset) * this.absCos,
      y: initialPosition.y - yOffset * this.absSin
    };

    this.currentPosition = { ...startPos };
    this.initialPosition = { ...startPos };
    this.color = emojis.length ? null : randomArrayItem(confettiColors);
    this.emoji = emojis.length ? randomArrayItem(emojis) : null;
    this.createdAt = Date.now();
    this.direction = direction;
  }, [
    {
      key: "draw",
      value: function (ctx) {
        const { x, y } = this.currentPosition;
        const { x: rx, y: ry } = this.radius;
        const ratio = window.devicePixelRatio;

        if (this.color) {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(x * ratio, y * ratio, rx * ratio, ry * ratio, this.rotationAngle, 0, 2 * Math.PI);
          ctx.fill();
        } else if (this.emoji) {
          ctx.font = `${this.emojiSize}px serif`;
          ctx.save();
          ctx.translate(x * ratio, y * ratio);
          ctx.rotate(this.emojiRotationAngle);
          ctx.textAlign = "center";
          ctx.fillText(this.emoji, 0, 0);
          ctx.restore();
        }
      }
    },
    {
      key: "updatePosition",
      value: function (deltaTime, currentTime) {
        const timeElapsed = currentTime - this.createdAt;

        if (this.confettiSpeed.x > this.finalConfettiSpeedX) {
          this.confettiSpeed.x -= this.dragForceCoefficient * deltaTime;
        }

        this.currentPosition.x += this.confettiSpeed.x * this.absCos * (this.direction === "left" ? -1 : 1) * deltaTime;
        this.currentPosition.y = this.initialPosition.y - this.confettiSpeed.y * this.absSin * timeElapsed
          + 0.00125 * Math.pow(timeElapsed, 2) / 2;

        this.rotationSpeed = Math.max(0, this.rotationSpeed - (this.emoji ? 0.0001 : 0.00001 * deltaTime));

        if (this.emoji) {
          this.emojiRotationAngle = (this.emojiRotationAngle + this.rotationSpeed * deltaTime) % (2 * Math.PI);
        } else {
          if (this.radiusYUpdateDirection === "down") {
            this.radius.y -= deltaTime * this.rotationSpeed;
            if (this.radius.y <= 0) {
              this.radius.y = 0;
              this.radiusYUpdateDirection = "up";
            }
          } else {
            this.radius.y += deltaTime * this.rotationSpeed;
            if (this.radius.y >= this.initialRadius) {
              this.radius.y = this.initialRadius;
              this.radiusYUpdateDirection = "down";
            }
          }
        }
      }
    },
    {
      key: "getIsVisibleOnCanvas",
      value: function (canvasHeight) {
        return this.currentPosition.y < canvasHeight + 100;
      }
    }
  ]);

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

  function parseConfig(config) {
    const {
      confettiRadius = 6,
      confettiNumber = config.confettiesNumber || (config.emojis ? 40 : 250),
      confettiColors = defaultColors,
      emojis = config.emojies || [],
      emojiSize = 80
    } = config;

    if (config.emojies) console.error("`emojies` is deprecated. Use `emojis`.");
    if (config.confettiesNumber) console.error("`confettiesNumber` is deprecated. Use `confettiNumber`.");

    return { confettiRadius, confettiNumber, confettiColors, emojis, emojiSize };
  }

  const ConfettiBatch = createClass(function ConfettiBatch(ctx) {
    assertInstance(this, ConfettiBatch);
    this.canvasContext = ctx;
    this.shapes = [];
    this.promise = new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }, [
    {
      key: "getBatchCompletePromise",
      value: function () {
        return this.promise;
      }
    },
    {
      key: "addShapes",
      value: function (...shapes) {
        this.shapes.push(...shapes);
      }
    },
    {
      key: "complete",
      value: function () {
        if (this.shapes.length === 0) {
          this.resolvePromise?.();
          return true;
        }
        return false;
      }
    },
    {
      key: "processShapes",
      value: function ({ timeDelta, currentTime }, canvasHeight, cull) {
        this.shapes = this.shapes.filter(shape => {
          shape.updatePosition(timeDelta, currentTime);
          shape.draw(this.canvasContext);
          return !cull || shape.getIsVisibleOnCanvas(canvasHeight);
        });
      }
    }
  ]);

  return createClass(function JSConfetti(config = {}) {
    assertInstance(this, JSConfetti);

    this.canvas = config.canvas || createCanvas();
    this.canvasContext = this.canvas.getContext("2d");

    this.activeConfettiBatches = [];
    this.requestAnimationFrameRequested = false;
    this.lastUpdated = Date.now();
    this.iterationIndex = 0;

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }, [
    {
      key: "loop",
      value: function () {
        this.requestAnimationFrameRequested = false;

        const canvas = this.canvas;
        const ratio = window.devicePixelRatio;
        const style = getComputedStyle(canvas);
        const width = parsePx(style.getPropertyValue("width"));
        const height = parsePx(style.getPropertyValue("height"));

        canvas.setAttribute("width", (width * ratio).toString());
        canvas.setAttribute("height", (height * ratio).toString());

        const now = Date.now();
        const delta = now - this.lastUpdated;
        const shouldCull = this.iterationIndex % 10 === 0;

        this.activeConfettiBatches = this.activeConfettiBatches.filter(batch => {
          batch.processShapes({ timeDelta: delta, currentTime: now }, canvas.offsetHeight, shouldCull);
          return !shouldCull || !batch.complete();
        });

        this.iterationIndex++;
        this.queueAnimationFrameIfNeeded(now);
      }
    },
    {
      key: "queueAnimationFrameIfNeeded",
      value: function (now) {
        if (!this.requestAnimationFrameRequested && this.activeConfettiBatches.length > 0) {
          this.requestAnimationFrameRequested = true;
          this.lastUpdated = now || Date.now();
          requestAnimationFrame(this.loop);
        }
      }
    },
    {
      key: "addConfetti",
      value: function (config = {}) {
        const {
          confettiRadius,
          confettiNumber,
          confettiColors,
          emojis,
          emojiSize
        } = parseConfig(config);

        const { width, height } = this.canvas.getBoundingClientRect();
        const y = (5 * height) / 7;

        const leftOrigin = { x: 0, y };
        const rightOrigin = { x: width, y };

        const batch = new ConfettiBatch(this.canvasContext);

        for (let i = 0; i < confettiNumber / 2; i++) {
          const rightConfetti = new ConfettiShape({
            initialPosition: leftOrigin,
            direction: "right",
            confettiRadius,
            confettiColors,
            emojis,
            emojiSize,
            canvasWidth: width
          });

          const leftConfetti = new ConfettiShape({
            initialPosition: rightOrigin,
            direction: "left",
            confettiRadius,
            confettiColors,
            emojis,
            emojiSize,
            canvasWidth: width
          });

          batch.addShapes(rightConfetti, leftConfetti);
        }

        this.activeConfettiBatches.push(batch);
        this.queueAnimationFrameIfNeeded();
        return batch.getBatchCompletePromise();
      }
    },
    {
      key: "clearCanvas",
      value: function () {
        this.activeConfettiBatches = [];
      }
    },
    {
      key: "destroyCanvas",
      value: function () {
        this.canvas.remove();
      }
    }
  ]);
})();