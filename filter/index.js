// create a simple canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const mouse = {
    x: 0,
    y: 0,
};

// define size of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// load an image for background
const background = new Image();
background.src = "./images/background.jpg";

// put the image in the canvas
ctx.drawImage(background, 0, 0);

const drawPixelate = () => {
    const width = 100;
    const height = 100;
    const pixelSize = 4;

    const startPos = { x: mouse.x - width / 2, y: mouse.y - height / 2 };
    const endPos = { x: mouse.x + width / 2, y: mouse.y + height / 2 };

    for (let x = startPos.x; x < endPos.x; x += pixelSize) {
        for (let y = startPos.y; y < endPos.y; y += pixelSize) {
            // ctx.getColorAt(x, y);
            const pixelColor = ctx.getImageData(x, y, 1, 1).data;
            ctx.fillStyle = "rgb(" + pixelColor[0] + "," + pixelColor[1] + "," + pixelColor[2] + ")";
            // console.log(ctx.getImageData(x, y, 1, 1).data);
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    ctx.fillStyle = "#f00";
    ctx.fill();
};

const drawFilter = () => {
    const width = 100;
    const height = 100;
    const pixelSize = 1;

    const startPos = { x: mouse.x - width / 2, y: mouse.y - height / 2 };
    const endPos = { x: mouse.x + width / 2, y: mouse.y + height / 2 };

    for (let x = startPos.x; x <= endPos.x; x += pixelSize) {
        for (let y = startPos.y; y <= endPos.y; y += pixelSize) {
            // ctx.getColorAt(x, y);
            const pixelColor = ctx.getImageData(x, y, 1, 1).data;
            const pixelBisColor = ctx.getImageData(x - 1, y - 1, 1, 1).data;
            const pixelBisBisColor = ctx.getImageData(x - 2, y - 2, 1, 1).data;
            const newColor = [
                (20 + pixelColor[0] + pixelBisColor[0] + pixelBisBisColor[0]) / 3,
                (20 + pixelColor[1] + pixelBisColor[1] + pixelBisBisColor[1]) / 3,
                (20 + pixelColor[2] + pixelBisColor[2] + pixelBisBisColor[2]) / 3,
            ]
            ctx.fillStyle = "rgb(" + newColor[0] + "," + newColor[1] + "," + newColor[2] + ")";

            // console.log(ctx.getImageData(x, y, 1, 1).data);
            ctx.fillRect(x - 0, y - 0, pixelSize, pixelSize);
        }
    }
    ctx.fill();
};

const animate = () => {
    // requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.drawImage(background, 0, 0);

    // draw the mouse position
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.fillText(`(${mouse.x}, ${mouse.y})`, 10, 30);

    // draw a circle at the mouse position
    drawFilter();

};

// animate();

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    animate()
    console.log(mouse.x, mouse.y)
});
