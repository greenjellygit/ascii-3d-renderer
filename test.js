// create Vector4 class as function with constructor
import {parseFileto3dObject} from "./objParser.js";
import {Camera, Matrix4, Object3D, Vector4} from "./structures.js";

let loadedObject;

// get canvas element
var canvas = document.getElementById("canvas");

// get canvas context
var context = canvas.getContext("2d");

// create projection matrix
var projection = new Matrix4(
    new Vector4(1, 0, 0, 0),
    new Vector4(0, 1, 0, 0),
    new Vector4(0, 0, 1, 0),
    new Vector4(0, 0, 0, 1)
);



projection = projection.rotateZ(180 * Math.PI / 180);
projection = projection.rotateY(25 * Math.PI / 180);

let meshRender = false;

// listen file input change event
document.getElementById("file").addEventListener("change", function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function (event) {
        // get file content
        var content = event.target.result;
        // parse obj from text
        var obj = parseFileto3dObject(content);

        loadedObject = obj
        objects = [loadedObject]
        drawScene()
    })
    // read file as text
    reader.readAsText(file);
});


// add point light class
class PointLight {
    constructor(position, color) {
        this.position = position;
        this.color = color;
    }
}

// create point light
const light = new PointLight(new Vector4(0, 0, 2, 1), new Vector4(1, 1, 1, 1));

const lightObject = new Object3D(
    "light",
    new Vector4(0, 1, 1, 1),
    [new Vector4(0, 0, 0, 1)],
    [],
    [],
    []
);

// create camera
const camera2 = new Camera(new Vector4(0, 0, 0, 1), new Vector4(0, 0, -1, 1), new Vector4(0, 1, 0, 1));

function printAscii(symbol, i, squareSize, maxSquarePerLine) {
    context.fillText(symbol, i % maxSquarePerLine * squareSize, Math.floor(i / maxSquarePerLine) * squareSize);
}

function asciiRender(squareSize, pixelDataSquares, maxSquarePerLine) {
    // set white color
    context.fillStyle = `white`;
    context.font = `${squareSize}px`;
    // create new canvas object
    for (var i = 0; i < pixelDataSquares.length; i++) {
        // get square
        var pixelDataSquare = pixelDataSquares[i];

        // invert colors inside square pixels
        for (var j = 0; j < pixelDataSquare.length; j++) {
            // foreach pixel in pixelDataSquare
            var pixel = pixelDataSquare[j];
            // invert color
            pixel.r = 255 - pixel.r;
            pixel.g = 255 - pixel.g;
            pixel.b = 255 - pixel.b;
        }

        // concert pixelDataSquare to Uint8ClampedArray
        var pixelDataSquareArray = new Uint8ClampedArray(pixelDataSquare.length * 4);
        for (var j = 0; j < pixelDataSquare.length; j++) {
            // foreach pixel in pixelDataSquare
            var pixel = pixelDataSquare[j];
            // set pixel data to array
            pixelDataSquareArray[j * 4] = pixel.r;
            pixelDataSquareArray[j * 4 + 1] = pixel.g;
            pixelDataSquareArray[j * 4 + 2] = pixel.b;
            pixelDataSquareArray[j * 4 + 3] = pixel.a;
        }

        // flip square

        // var imageData = new ImageData(pixelDataSquareArray, 20, 20);
        // create new context
        // context.putImageData(imageData, i % 18 * 20, Math.floor(i / 18) * 20);

        // calculate average grey color of square
        var greyscale = 0;
        for (var j = 0; j < pixelDataSquare.length; j++) {
            // foreach pixel in pixelDataSquare
            var pixel = pixelDataSquare[j];
            // add pixel greyscale value to greyscale
            greyscale += (pixel.r + pixel.g + pixel.b) / 3;
        }

        const averageGray = 255 - Math.round(greyscale / pixelDataSquare.length)
        // create normalized greyscale value
        const normalizedGreyscale = averageGray / 255;


        // based on averageGray draw ascii art

        if (normalizedGreyscale < 0.1) {
            printAscii(" ", i, squareSize, maxSquarePerLine, averageGray);
        } else if (normalizedGreyscale < 0.2) {
            printAscii(".", i, squareSize, maxSquarePerLine, averageGray);
        } else if (normalizedGreyscale < 0.4) {
            printAscii(":", i, squareSize, maxSquarePerLine, averageGray);
        } else if (normalizedGreyscale < 0.6) {
            printAscii("o", i, squareSize, maxSquarePerLine, averageGray);
        } else if (normalizedGreyscale) {
            printAscii("O", i, squareSize, maxSquarePerLine, averageGray);
        }

    }
}

// create function to draw object on canvas using screen coordinates
function drawObject(object) {
    const ctx = context;

    const screenCoordinates = object.getScreenCoordinates(camera2.getViewMatrix(), projection, canvas.width, canvas.height);
    const calculatedVertices = object.getProjectedVertices(camera2.getViewMatrix(), projection);

    // sort triangles back to front
    const sortedTriangles = [];
    for (let i = 0; i < object.triangles.length; i++) {
        const polygon = object.triangles[i];
        const vertices = polygon.verticesNumbers.map((index) => calculatedVertices[index]);

        // sum z coordinates of vertices
        let z = 0;
        for (let j = 0; j < vertices.length; j++) {
            z += vertices[j].z;
        }
        sortedTriangles.push({
            z: z,
            polygon: polygon
        });
    }
    // sort triangles by using z coordinates and quick sort
    sortedTriangles.sort((a, b) => {
        return a.z - b.z;
    });

    // draw triangles using painter's algorithm
    for (let i = 0; i < object.triangles.length; i++) {
        const polygon = sortedTriangles[i].polygon;
        const verticesNumbers = polygon.verticesNumbers;

        // calculate light intensity
        const lightIntensity = calculateLightIntensity(calculatedVertices, object, polygon, light.position, camera2);



        // calculate ightIntensity
        const color = object.color.multiplyByVector(light.color).multiplyScalar(lightIntensity);

        // draw in loop
        ctx.beginPath();
        ctx.moveTo(screenCoordinates[verticesNumbers[0]].x, screenCoordinates[verticesNumbers[0]].y);
        for (let j = 1; j < verticesNumbers.length; j++) {
            ctx.lineTo(screenCoordinates[verticesNumbers[j]].x, screenCoordinates[verticesNumbers[j]].y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgb(${color.x * 255}, ${color.y * 255}, ${color.z * 255})`;
        ctx.fill();
    }

    const squareSize = 10;
    // calculate maxSquarePerLine
    const maxSquarePerLine = Math.floor(canvas.width / squareSize);

    // get pixel data from image
    var pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // split pixel data into square parts 20x20, return array
    var pixelDataSquares = splitPixelData(pixelData, canvas.width, canvas.height, squareSize, squareSize);
    // for each square

    if (!meshRender) {
        // set black color
        context.fillStyle = "black";
        // fill canvas with black color
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!meshRender) {
        asciiRender(squareSize, pixelDataSquares, maxSquarePerLine);
    }

}

// create calculateLightIntensity function
function calculateLightIntensity(calculatedVertices, object, polygon, lightPosition, camera) {
    // calculate normal vector
    const normal = calculateNormalVector(calculatedVertices, polygon);

    // calculate light vector
    const lightVector = lightPosition.subtract(camera.position).normalize();

    // calculate light intensity
    return Math.max(0, normal.dotProduct(lightVector));
}

// create calculateNormalVector function
function calculateNormalVector(calculatedVertices, polygon, ) {
    // calculate normal vector
    const normal = calculatedVertices[polygon.verticesNumbers[0]].subtract(calculatedVertices[polygon.verticesNumbers[1]])
        .crossProduct(calculatedVertices[polygon.verticesNumbers[0]].subtract(calculatedVertices[polygon.verticesNumbers[2]]))
        .normalize();

    return normal;
}

// create splitPixelData function
function splitPixelData(pixelData, width, height, squareWidth, squareHeight) {
    // create array to store square pixels
    var pixelDataSquares = [];
    // for each square
    for (var j = 0; j < height / squareHeight; j++) {
    for (var i = 0; i < width / squareWidth; i++) {
            // create array to store square pixels
            var pixelDataSquare = [];
            // for each pixel in square
            for (var k = 0; k < squareWidth; k++) {
                for (var l = 0; l < squareHeight; l++) {
                    // get pixel data
                    var pixel = {
                        r: pixelData[((j * squareHeight + k) * width + i * squareWidth + l) * 4],
                        g: pixelData[((j * squareHeight + k) * width + i * squareWidth + l) * 4 + 1],
                        b: pixelData[((j * squareHeight + k) * width + i * squareWidth + l) * 4 + 2],
                        a: pixelData[((j * squareHeight + k) * width + i * squareWidth + l) * 4 + 3]
                    };
                    // add pixel to square pixels at the start
                    pixelDataSquare.push(pixel);
                }
            }
            // add square pixels to squares
            pixelDataSquares.push(pixelDataSquare);
        }
    }
    // return squares array
    return pixelDataSquares;
}

let objects = [lightObject];

// create draw scene function
function drawScene() {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw objects
    for (var i = 0; i < objects.length; i++) {
        drawObject(objects[i]);
    }

}

drawScene();

document.addEventListener("mousemove", function (event) {
    requestAnimationFrame(function () {
        var pos = getMousePos(canvas, event);

        const screenCoordinates = new Vector4(pos.x, pos.y, 0, 1);
        const screenCoordinatesNormalized = new Vector4(
            screenCoordinates.x / canvas.width * 2 - 1,
            ((canvas.height - screenCoordinates.y) / canvas.height * -2 + 1),
            1,
            1
        );

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        // set lightObject to cursor screen coordinates
        lightObject.vertices = [screenCoordinatesNormalized];
        light.position = screenCoordinatesNormalized;

        drawScene();
    });
}, false);

function createListener(sliderId, eventType, initial, action) {
    let previousRotation = initial
    document.getElementById(sliderId).addEventListener(eventType, function (event) {
        requestAnimationFrame(function () {
            if (loadedObject) {
                // rotate cube
                let value = previousRotation - event.target.value;
                previousRotation = event.target.value;
                action(value);
                drawScene()
            }
        });
    });
}

createListener("rotateX", "input", 180, (value) => projection = projection.rotateX(value * Math.PI / 180));
createListener("rotateY", "input", 180, (value) => projection = projection.rotateY(value * Math.PI / 180));
createListener("rotateZ", "input", 180, (value) => projection = projection.rotateZ(value * Math.PI / 180));

createListener("translateX", "input", 50, (value) => projection = projection.translateX(value / 30));
createListener("translateY", "input", 50, (value) => projection = projection.translateY(value / 30));
createListener("translateZ", "input", 50, (value) => projection = projection.translateZ(value / 30));

let rotating;
document.getElementById("play").addEventListener("click", function (event) {
    requestAnimationFrame(function () {
        if (loadedObject) {
            // change value of button
            document.getElementById("play").value = rotating ? "▶" : "II";
            if (!rotating) {
                rotating = setInterval(() => {
                    projection = projection.rotateX(Math.PI / 180)
                    drawScene()
                }, 10);
            } else {
                clearInterval(rotating);
                rotating = undefined;
            }
        }
    });
});

document.getElementById("meshView").addEventListener("click", function (event) {
    // change caption of button
    document.getElementById("meshView").value = meshRender ? "Mesh View" : "Ascii View";
    meshRender = !meshRender;
    drawScene();
});

document.getElementById("loadTorus").addEventListener("click", function (event) {


    var obj = parseFileto3dObject(content);

    loadedObject = obj
    objects = [loadedObject]
    drawScene()
});