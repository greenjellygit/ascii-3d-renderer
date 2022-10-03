// parse obj from text
import {Object3D, Vector4} from "./structures";

export function parseFileto3dObject(text) {
    // create obj object
    var obj = {
        vertices: [],
        normals: [],
        polygons: [],
        lines: [],
        name: "test"
    };

    // split text by new line
    var lines = text.split("\n");
    // iterate over lines
    for (var i = 0; i < lines.length; i++) {
        // get line
        var line = lines[i];
        // split line by space
        var parts = line.split(" ");
        // check if line is vertex
        if (parts[0] === "v") {
            // add vertex to vertices array
            obj.vertices.push(new Vector4(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1));
        }
        // check if line is normal
        else if (parts[0] === "vn") {
            // add normal to normals array
            obj.normals.push(new Vector4(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1));
        }
        // check if line is polygon
        else if (parts[0] === "f") {
            // create polygon object
            var polygon = {
                verticesNumbers: [],
                normalsNumbers: []
            };
            // iterate over polygon vertices
            for (var j = 1; j < parts.length; j++) {
                // split polygon vertex by /
                var subParts = parts[j].split("/");
                // add vertex number to polygon verticesNumbers array
                polygon.verticesNumbers.push(parseInt(subParts[0]) - 1);
                // add normal number to polygon normalsNumbers array
                polygon.normalsNumbers.push(parseInt(subParts[2]));
            }
            // add polygon to polygons array
            obj.polygons.push(polygon);
        }
    }

    // for each polygon get normalNumbers
    for (var i = 0; i < obj.polygons.length; i++) {
        var polygon = obj.polygons[i];
        polygon.normals = [];
        const normalsNumbers = polygon.normalsNumbers
        // for each normalNumber get normal
        for (var j = 0; j < normalsNumbers.length; j++) {
            var normalNumber = normalsNumbers[j];
            // add normal to polygon normals array
            polygon.normals.push(obj.normals[normalNumber - 1]);
        }
        // set polygon normal
        // polygon.calculatedNormal = calculateTriangeNormal(polygon.normals);

    }

    // scale object to fit in screen
    var maxX = -Infinity;
    var maxY = -Infinity;
    var maxZ = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    var minZ = Infinity;
    for (var i = 0; i < obj.vertices.length; i++) {
        var vertex = obj.vertices[i];
        if (vertex.x > maxX) {
            maxX = vertex.x;
        }
        if (vertex.y > maxY) {
            maxY = vertex.y;
        }
        if (vertex.z > maxZ) {
            maxZ = vertex.z;
        }
        if (vertex.x < minX) {
            minX = vertex.x;
        }
        if (vertex.y < minY) {
            minY = vertex.y;
        }
        if (vertex.z < minZ) {
            minZ = vertex.z;
        }
    }

    // update origin of object to center of object
    var origin = new Vector4((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2, 1);
    for (var i = 0; i < obj.vertices.length; i++) {
        var vertex = obj.vertices[i];
        vertex.x -= origin.x;
        vertex.y -= origin.y;
        vertex.z -= origin.z;
    }

    var scale = 1 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    for (var i = 0; i < obj.vertices.length; i++) {
        var vertex = obj.vertices[i];
        vertex.x = vertex.x * scale;
        vertex.y = vertex.y * scale;
        vertex.z = vertex.z * scale;
    }

    // increase object size
    for (var i = 0; i < obj.vertices.length; i++) {
        var vertex = obj.vertices[i];
        vertex.x = vertex.x * 1.5;
        vertex.y = vertex.y * 1.5;
        vertex.z = vertex.z * 1.5;
    }


    // color orange as vector4
    var color = new Vector4(1, 0.8, 0.3, 1);
    const object = new Object3D(
        obj.name,
        color,
        obj.vertices,
        obj.normals,
        obj.lines,
        obj.polygons
    );

    return object;
}