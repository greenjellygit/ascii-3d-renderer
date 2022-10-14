import {Camera, Matrix4, PointLight, Vector4} from "./structures";
import {parseFileto3dObject} from "./obj-parser";

export default class Renderer {

    projection;
    light;
    camera;
    loadedObject;
    canvas;

    context;
    isMeshRender = false;
    isAnimation = false;
    initialized = false;
    rotatingInterval;

    init(canvas) {
        // get canvas element
        this.canvas = canvas;
        this.canvas.addEventListener("mousemove", (event) => this.moveLight(event))
        this.canvas.addEventListener("touchmove", (event) => this.moveLight(event))

        // get canvas context
        this.context = canvas.getContext("2d");

        // create projection matrix
        this.projection = new Matrix4(
            new Vector4(1, 0, 0, 0),
            new Vector4(0, 1, 0, 0),
            new Vector4(0, 0, 1, 0),
            new Vector4(0, 0, 0, 1)
        );

        this.projection = this.projection.rotateZ(180 * Math.PI / 180);
        this.projection = this.projection.rotateY(25 * Math.PI / 180);

        // create point light
        this.light = new PointLight(new Vector4(0, 0, 2, 1), new Vector4(1, 1, 1, 1));

        // create camera
        this.camera = new Camera(new Vector4(0, 0, 0, 1), new Vector4(0, 0, -1, 1), new Vector4(0, 1, 0, 1));

        this.initialized = true;
    }

    loadObj(content) {
        this.loadedObject = parseFileto3dObject(content)
        this.render()
    }

    // create function to draw object on canvas using screen coordinates
    render() {
        const ctx = this.context;
        const object = this.loadedObject;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const screenCoordinates = object.getScreenCoordinates(this.camera.getViewMatrix(), this.projection, this.canvas.width, this.canvas.height);
        const calculatedVertices = object.getProjectedVertices(this.camera.getViewMatrix(), this.projection);

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
            const lightIntensity = this.calculateLightIntensity(calculatedVertices, object, polygon, this.light.position, this.camera);


            // calculate ightIntensity
            const color = object.color.multiplyByVector(this.light.color).multiplyScalar(lightIntensity);

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
        const maxSquarePerLine = Math.floor(this.canvas.width / squareSize);

        // get pixel data from image
        var pixelData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

        // split pixel data into square parts 20x20, return array
        var pixelDataSquares = this.splitPixelData(pixelData, this.canvas.width, this.canvas.height, squareSize, squareSize);
        // for each square

        if (!this.isMeshRender) {
            // set black color
            this.context.fillStyle = "black";
            // fill canvas with black color
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (!this.isMeshRender) {
            this.renderAscii(squareSize, pixelDataSquares, maxSquarePerLine);
        }

    }

    // create calculateLightIntensity function
    calculateLightIntensity(calculatedVertices, object, polygon, lightPosition, camera) {
        // calculate normal vector
        const normal = this.calculateNormalVector(calculatedVertices, polygon);

        // calculate light vector
        const lightVector = lightPosition.subtract(camera.position).normalize();

        // calculate light intensity
        return Math.max(0, normal.dotProduct(lightVector));
    }

    // create calculateNormalVector function
    calculateNormalVector(calculatedVertices, polygon) {
        // calculate normal vector
        return calculatedVertices[polygon.verticesNumbers[0]].subtract(calculatedVertices[polygon.verticesNumbers[1]])
            .crossProduct(calculatedVertices[polygon.verticesNumbers[0]].subtract(calculatedVertices[polygon.verticesNumbers[2]]))
            .normalize();
    }

    // create splitPixelData function
    splitPixelData(pixelData, width, height, squareWidth, squareHeight) {
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

    printAscii(symbol, i, squareSize, maxSquarePerLine) {
        this.context.fillText(symbol, i % maxSquarePerLine * squareSize, Math.floor(i / maxSquarePerLine) * squareSize);
    }

    renderAscii(squareSize, pixelDataSquares, maxSquarePerLine) {
        // set white color
        this.context.fillStyle = `white`;
        this.context.font = `${squareSize}px`;
        // create new canvas object
        for (var i = 0; i < pixelDataSquares.length; i++) {
            // get square
            var pixelDataSquare = pixelDataSquares[i];

            var greyscale = 0;
            for (var j = 0; j < pixelDataSquare.length; j++) {
                // foreach pixel in pixelDataSquare
                var pixel = pixelDataSquare[j];
                // add pixel greyscale value to greyscale
                greyscale += (pixel.r + pixel.g + pixel.b) / 3;
            }

            const averageGray = Math.round(greyscale / pixelDataSquare.length)
            // create normalized greyscale value
            const normalizedGreyscale = averageGray / 255;


            // based on averageGray draw ascii art

            if (normalizedGreyscale < 0.1) {
                this.printAscii(" ", i, squareSize, maxSquarePerLine, averageGray);
            } else if (normalizedGreyscale < 0.2) {
                this.printAscii(".", i, squareSize, maxSquarePerLine, averageGray);
            } else if (normalizedGreyscale < 0.4) {
                this.printAscii(":", i, squareSize, maxSquarePerLine, averageGray);
            } else if (normalizedGreyscale < 0.6) {
                this.printAscii("o", i, squareSize, maxSquarePerLine, averageGray);
            } else if (normalizedGreyscale) {
                this.printAscii("O", i, squareSize, maxSquarePerLine, averageGray);
            }

        }
    }

    rotateX(value) {
        this.inAnimationFrame(() => this.projection = this.projection.rotateX(value * Math.PI / 180));
    }

    rotateY(value) {
        this.inAnimationFrame(() => this.projection = this.projection.rotateY(value * Math.PI / 180));
    }

    rotateZ(value) {
        this.inAnimationFrame(() => this.projection = this.projection.rotateZ(value * Math.PI / 180));
    }

    translateX(value) {
        this.inAnimationFrame(() => this.projection = this.projection.translateX(value / 30))
    }

    translateY(value) {
        this.inAnimationFrame(() => this.projection = this.projection.translateY(value / 30))
    }

    translateZ(value) {
        this.inAnimationFrame(() => this.projection = this.projection.translateZ(value / 30))
    }

    inAnimationFrame(callback) {
        requestAnimationFrame(() => {
            if (this.loadedObject) {
                callback();
                this.render();
            }
        });
    }

    setMeshView(isMeshView) {
        this.isMeshRender = isMeshView;
        this.render();
    }

    setAnimation() {
        if (!this.isAnimation) {
            this.rotatingInterval = setInterval(() => {
                this.projection = this.projection.rotateX(Math.PI / 180)
                this.render()
            }, 10);
            this.isAnimation = true;
        } else {
            clearInterval(this.rotatingInterval);
            this.isAnimation = false;
        }
    }

    moveLight(event) {
        requestAnimationFrame(() => {
            const pos = getMousePos(this.canvas, event);

            const screenCoordinates = new Vector4(pos.x, pos.y, 0, 1);
            const screenCoordinatesNormalized = new Vector4(
                screenCoordinates.x / this.canvas.width * 2 - 1,
                ((this.canvas.height - screenCoordinates.y) / this.canvas.height * -2 + 1),
                1,
                1
            );

            function getMousePos(canvas, evt) {
                let clientX = evt.clientX;
                let clientY = evt.clientY;
                if (event.type === 'touchmove') {
                    clientX = event.touches[0].clientX;
                    clientY = event.touches[0].clientY;
                }
                const rect = canvas.getBoundingClientRect();
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }

            // set lightObject to cursor screen coordinates
            this.light.position = screenCoordinatesNormalized;
            this.render();
        })
    }

}
