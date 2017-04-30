"use strict";

class Ocean {
    constructor(gl, nRows, nCols, tileSize, options) {
        /* const */ this.wavesData = new Float32Array([
            0.504, -1.571,	0.225, 0.1,
            0.484, -1.190,	0.202, 3.21,
            0.471, -1.249,	0.237, 0.32,
            0.430, -1.571,	0.188, 0.70,
            0.405, -1.107,	0.252, 4.20,
            0.399, -1.571,	0.263, 0.37,
            0.398, -1.429,	0.265, 0.48,
            0.385, -1.893,	0.237, 0.55,
            0.381, -1.951,	0.202, 1.42,
            0.372, -1.713,	0.265, 3.17,
            0.365, -0.927,	0.180, 0.27,
            0.332, -0.983,	0.270, 0.38,
            0.327, -0.785,	0.212, 2.33,
            0.326, -1.166,	0.286, 0.21,
            0.313, -2.034,	0.252, 0.10,
            0.294, -0.785,	0.265, 3.43,
            0.278, -1.976,	0.286, 0.03,
            0.277, -1.107,	0.168, 0.12,
            0.276, -0.644,	0.187, 4.51,
            0.268, -2.214,	0.188, 1.21
        ]);

        this.nRows = nRows;
        this.nCols = nCols;
        this.tileSize = tileSize;
        this.lines = options.lines;
        this.nVertex = (nRows + 1) * (nCols + 1);
        this.gl = gl;
        this.shaderCnt = 0;
        this.ready = false;

        this.program = new WGLUProgram(gl);
        this.program.attachShaderSourceFromXHR("shaders/" + options.vertexShader + ".glslv",
            gl.VERTEX_SHADER).then(this.onCompile.bind(this));
        this.program.attachShaderSourceFromXHR("shaders/" + options.fragmentShader + ".glslf",
            gl.FRAGMENT_SHADER).then(this.onCompile.bind(this));

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        let vertexData = this.getVertexData();
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW, 0, vertexData.length * 4);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        let indexData = this.getIndexData();
        this.elements = indexData.length;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW, 0, indexData.length * 2);
    }

    onCompile() {
        this.shaderCnt++;
        if (this.shaderCnt < 2)
            return;

        this.program.link();
        this.program.use();
        this.vertexPosition = this.program.attrib["vertexPosition"];
        this.vertexUV = this.program.attrib["vertexUV"];
        this.MVP = this.program.uniform["MVP"];
        this.M = this.program.uniform["M"];
        this.V = this.program.uniform["V"];
        this.waves = this.program.uniform["waves"];
        this.time = this.program.uniform["time"];
        this.light_world = this.program.uniform["light_world"];

        this.ready = true;
    }

    getVertexData() {
        let verticesData = [];
        for (let i = 0; i <= this.nRows; i++) {
            for (let j = 0; j <= this.nCols; j++) {
                verticesData.push(this.tileSize * (i - this.nRows / 2.0));  // x
                verticesData.push(0);  // y
                verticesData.push(this.tileSize * (j - this.nCols / 2.0));  // z
                verticesData.push(i / parseFloat(this.nRows));  // u
                verticesData.push(j / parseFloat(this.nRows));  // v
            }
        }
        return new Float32Array(verticesData);
    }
    
    getIndexData() {
        let indices = [];
        for (let i = 0; i < this.nRows; i++) {
            let first = i * (this.nCols + 1);
            let firstNext = (i + 1) * (this.nCols + 1);
            for (let j = 0; j < this.nCols; j++) {
                indices.push(first + j + 1);
                indices.push(first + j);
                indices.push(firstNext + j);
                indices.push(first + j + 1);
                indices.push(firstNext + j);
                indices.push(firstNext + j + 1);
                if (this.lines) {
                    indices.push(first + j);
                    indices.push(firstNext + j);
                }
            }
        }
        return new Uint16Array(indices);
    }

    render(projectionMat, viewMat, modelMat, time) {
        if (!this.ready)
            return;
        this.program.use();
        let gl = this.gl;

        let mat = mat4.create();
        mat4.scalar.multiply(mat, projectionMat, viewMat);
        mat4.scalar.multiply(mat, mat, modelMat);
        gl.uniformMatrix4fv(this.MVP, gl.FALSE, mat);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.vertexPosition);
        gl.vertexAttribPointer(this.vertexPosition, 3, gl.FLOAT, gl.FALSE, 20, 0);
        if (this.vertexUV !== undefined) {
            gl.enableVertexAttribArray(this.vertexUV);
            gl.vertexAttribPointer(this.vertexUV, 2, gl.FLOAT, gl.FALSE, 20, 12);
        }
        if (this.M !== undefined) {
            gl.uniformMatrix4fv(this.M, gl.FALSE, modelMat);
        }
        if (this.V !== undefined) {
            gl.uniformMatrix4fv(this.V, gl.False, viewMat);
        }
        if (this.time !== undefined) {
            gl.uniform1f(this.time, time)
        }
        if (this.waves !== undefined) {
            gl.uniform4fv(this.waves, this.wavesData);
        }
        if (this.light_world !== undefined) {
            gl.uniform3f(this.light_world, 10.0, 50.0, -10.0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(this.lines ? gl.LINES : gl.TRIANGLES, this.elements, gl.UNSIGNED_SHORT, 0);
    }
}