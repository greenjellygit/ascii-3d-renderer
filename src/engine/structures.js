var Vector4 = function (x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    // create multiply by Matrix4 function
    this.multiply = function (matrix) {
        var result = new Vector4(0, 0, 0, 0);
        result.x = this.x * matrix.v1.x + this.y * matrix.v2.x + this.z * matrix.v3.x + this.w * matrix.v4.x;
        result.y = this.x * matrix.v1.y + this.y * matrix.v2.y + this.z * matrix.v3.y + this.w * matrix.v4.y;
        result.z = this.x * matrix.v1.z + this.y * matrix.v2.z + this.z * matrix.v3.z + this.w * matrix.v4.z;
        result.w = this.x * matrix.v1.w + this.y * matrix.v2.w + this.z * matrix.v3.w + this.w * matrix.v4.w;
        return result;
    }

    // create multiplyByVector function, return vector
    this.multiplyByVector = function (vector) {
        var result = new Vector4(0, 0, 0, 0);
        result.x = this.x * vector.x;
        result.y = this.y * vector.y;
        result.z = this.z * vector.z;
        result.w = this.w * vector.w;
        return result;
    }

    // create add function
    this.add = function (vector) {
        return new Vector4(this.x + vector.x, this.y + vector.y, this.z + vector.z, this.w + vector.w);
    }

    // create multiply by scalar function
    this.multiplyScalar = function (scalar) {
        return new Vector4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    // add subtract function
    this.subtract = function (vector) {
        return new Vector4(this.x - vector.x, this.y - vector.y, this.z - vector.z, this.w - vector.w);
    }

    // add crossProduct function
    this.crossProduct = function (vector) {
        return new Vector4(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x,
            1
        );
    }

    // add dotProduct function
    this.dotProduct = function (vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    // add normalize function not returning NaN or Infinity
    this.normalize = function () {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length === 0) {
            return new Vector4(0, 0, 0, 0);
        }
        return new Vector4(this.x / length, this.y / length, this.z / length, 0);
    }
}

// create Matrix4 class with Vector4 as constructor parameters
var Matrix4 = function (v1, v2, v3, v4) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.v4 = v4;

    // create multiply function using members of Matrix4 class
    this.multiply = function (matrix) {
        // create result matrix using Vector4 class
        var result = new Matrix4(
            new Vector4(0, 0, 0, 0),
            new Vector4(0, 0, 0, 0),
            new Vector4(0, 0, 0, 0),
            new Vector4(0, 0, 0, 0)
        );

        result.v1 = this.v1.multiply(matrix);
        result.v2 = this.v2.multiply(matrix);
        result.v3 = this.v3.multiply(matrix);
        result.v4 = this.v4.multiply(matrix);

        return result;
    }

    // create rotateX function to rotate around x-axis
    this.rotateX = function (angle, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(Math.cos(angle), 0, Math.sin(angle), 0),
            new Vector4(0, 1, 0, 0),
            new Vector4(-Math.sin(angle), 0, Math.cos(angle), 0),
            new Vector4(0, 0, 0, 1)
        ));
    }

    // create translateX function
    this.translateX = function (distance, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(1, 0, 0, 0),
            new Vector4(0, 1, 0, 0),
            new Vector4(0, 0, 1, 0),
            new Vector4(distance, 0, 0, 1)
        ));
    }

    // create translateY function
    this.translateY = function (distance, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(1, 0, 0, 0),
            new Vector4(0, 1, 0, 0),
            new Vector4(0, 0, 1, 0),
            new Vector4(0, distance, 0, 1)
        ));
    }

    // create translateZ function
    this.translateZ = function (distance, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(1, 0, 0, 0),
            new Vector4(0, 1, 0, 0),
            new Vector4(0, 0, 1, 0),
            new Vector4(0, 0, distance, 1)
        ));
    }

    // create rotateX function to rotate around x-axis

    this.rotateY = function (angle, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(1, 0, 0, 0),
            new Vector4(0, Math.cos(angle), -Math.sin(angle), 0),
            new Vector4(0, Math.sin(angle), Math.cos(angle), 0),
            new Vector4(0, 0, 0, 1)
        ));
    }

    // create rotateZ function in above style
    this.rotateZ = function (angle, matrix = this) {
        return matrix.multiply(new Matrix4(
            new Vector4(Math.cos(angle), -Math.sin(angle), 0, 0),
            new Vector4(Math.sin(angle), Math.cos(angle), 0, 0),
            new Vector4(0, 0, 1, 0),
            new Vector4(0, 0, 0, 1)
        ));
    }

}

// create function to generate identity matrix
function identity() {
    return new Matrix4(
        new Vector4(1, 0, 0, 0),
        new Vector4(0, 1, 0, 0),
        new Vector4(0, 0, 1, 0),
        new Vector4(0, 0, 0, 1)
    );
}

// create Line3D class using start and end vertices numbers
var Line3D = function (start, end) {
    this.start = start;
    this.end = end;
}

// create Polygon class using verticesNumbers array
var Polygon = function (verticesNumbers) {
    this.calculatedNormal = new Vector4(0, 0, 0, 0);
    this.verticesNumbers = verticesNumbers;
    // substract 1 from each element of verticesNumbers array
    for (var i = 0; i < this.verticesNumbers.length; i++) {
        this.verticesNumbers[i]--;
    }
}

// create a Object3D class with translation, rotation and scale matrices as members
var Object3D = function (name, color, vertices, normals, lines, polygons) {
    this.name = name;
    this.color = color;
    this.vertices = vertices;
    this.normals = normals;
    this.lines = lines;
    this.triangles = polygons;

    // create line array

    this.translation = new Matrix4(
        new Vector4(1, 0, 0, 0),
        new Vector4(0, 1, 0, 0),
        new Vector4(0, 0, 1, 0),
        new Vector4(0, 0, 0, 1)
    );
    this.rotation = new Matrix4(
        new Vector4(1, 0, 0, 0),
        new Vector4(0, 1, 0, 0),
        new Vector4(0, 0, 1, 0),
        new Vector4(0, 0, 0, 1)
    );
    this.scale = new Matrix4(
        new Vector4(1, 0, 0, 0),
        new Vector4(0, 1, 0, 0),
        new Vector4(0, 0, 1, 0),
        new Vector4(0, 0, 0, 1)
    );

    // create function to scale object
    this.scaleObject = function (x, y, z) {
        this.scale = new Matrix4(
            new Vector4(x, 0, 0, 0),
            new Vector4(0, y, 0, 0),
            new Vector4(0, 0, z, 0),
            new Vector4(0, 0, 0, 1)
        );
    }


    // create rotateY function
    this.setRotationX = function (angle) {
        this.rotation = this.rotation.rotateX(angle, identity());
    }

    // create rotateZ function
    this.setRotationZ = function (angle) {
        this.rotation = this.rotation.rotateZ(angle, identity());
    }

    // create rotateY function
    this.setRotationY = function (angle) {
        this.rotation = this.rotation.rotateY(angle, identity());
    }

    // create rotateX function
    this.rotateX = function (angle) {
        this.rotation = this.rotation.rotateX(angle);
    }

    // create rotateX function
    this.rotateY = function (angle) {
        this.rotation = this.rotation.rotateY(angle);
    }

    // create rotateX function
    this.rotateZ = function (angle) {
        this.rotation = this.rotation.rotateZ(angle);
    }

    // create rotateX function
    this.translateX = function (distance) {
        this.translation = this.translation.translateX(distance);
    }

    // create rotateX function
    this.translateY = function (distance) {
        this.translation = this.translation.translateY(distance);
    }

    // create rotateX function
    this.translateZ = function (distance) {
        this.translation = this.translation.translateZ(distance);
    }

    // create function to create object view matrix using translation, rotation and scale matrices
    this.getModelMatrix = function () {

        // multiply translation, rotation and scale matrices
        return this.translation.multiply(this.rotation).multiply(this.scale);
    }

    // create function to calculate vertices of object using model matrix, camera matrix and projection matrix
    this.getProjectedVertices = function (cameraMatrix, projectionMatrix) {
        var result = [];

        // multiply model matrix, camera matrix and projection matrix
        var matrix = this.getModelMatrix().multiply(cameraMatrix).multiply(projectionMatrix);

        // multiply vertices of object by matrix
        for (var i = 0; i < this.vertices.length; i++) {
            result.push(this.vertices[i].multiply(matrix));
        }

        return result;
    }

    // convert vertices to screen coordinates
    this.getScreenCoordinates = function (cameraMatrix, projectionMatrix, width, height) {
        var result = [];

        const projectedVertices = this.getProjectedVertices(cameraMatrix, projectionMatrix);
        // convert projectedVertices to screen coordinates
        for (var i = 0; i < projectedVertices.length; i++) {
            result.push({
                x: (projectedVertices[i].x / projectedVertices[i].w + 1) * width / 2,
                y: (projectedVertices[i].y / projectedVertices[i].w + 1) * height / 2
            });
        }

        return result;
    }

}

function calculateTriangeNormal(polygonNormals) {
    // sum normal vectors
    let normal = new Vector4(0, 0, 0, 0);
    for (let j = 0; j < polygonNormals.length; j++) {
        normal = normal.add(polygonNormals[j]);
    }
    return normal.normalize();
}



// create camera class
class Camera {
    constructor(position, target, up) {
        this.position = position;
        this.target = target;
        this.up = up;
    }

    // get camera view matrix
    getViewMatrix() {
        const zAxis = this.position.subtract(this.target).normalize();
        const xAxis = this.up.crossProduct(zAxis).normalize();
        const yAxis = zAxis.crossProduct(xAxis).normalize();
        return new Matrix4(
            new Vector4(xAxis.x, yAxis.x, zAxis.x, 0),
            new Vector4(xAxis.y, yAxis.y, zAxis.y, 0),
            new Vector4(xAxis.z, yAxis.z, zAxis.z, 0),
            new Vector4(-xAxis.dotProduct(this.position), -yAxis.dotProduct(this.position), -zAxis.dotProduct(this.position), 1)
        );
    }
}

// add point light class
class PointLight {
    constructor(position, color) {
        this.position = position;
        this.color = color;
    }
}

export {Vector4, Matrix4, calculateTriangeNormal, Object3D, Line3D, Polygon, Camera, PointLight};
