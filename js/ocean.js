"use strict";

class Ocean {
    constructor(gl, nRows, nCols, lines) {
        this.nRows = nRows;
        this.nCols = nCols;
        this.lines = lines;
        this.nVertex = (nRows + 1) * (nCols + 1);
        this.gl = gl;
        this.shaderCnt = 0;
        this.ready = false;

        this.program = new WGLUProgram(gl);
        this.program.attachShaderSourceFromXHR("shaders/plain.glslv", gl.VERTEX_SHADER)
            .then(this.onCompile.bind(this));
        this.program.attachShaderSourceFromXHR("shaders/uniform.glslf", gl.FRAGMENT_SHADER)
            .then(this.onCompile.bind(this));

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
        this.mvp = this.program.uniform["mvp"];

        this.ready = true;
    }

    getVertexData() {
        let verticesData = [];
        for (let i = 0; i <= this.nRows; i++) {
            for (let j = 0; j <= this.nCols; j++) {
                verticesData.push(i - this.nRows / 2.0);  // x
                verticesData.push(0);  // y
                verticesData.push(j - this.nCols / 2.0);  // z
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

    render(projectionMat, modelViewMat) {
        if (!this.ready)
            return;
        this.program.use();
        let gl = this.gl;

        let mat = mat4.create();
        mat4.scalar.multiply(mat, projectionMat, modelViewMat);
        gl.uniformMatrix4fv(this.mvp, gl.FALSE, mat);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.vertexPosition);
        gl.vertexAttribPointer(this.vertexPosition, 3, gl.FLOAT, gl.FALSE, 20, 0);
        if (this.vertexUV !== undefined) {
            gl.enableVertexAttribArray(this.vertexUV);
            gl.vertexAttribPointer(this.vertexUV, 2, gl.FLOAT, gl.FALSE, 20, 12);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(this.lines ? gl.LINES : gl.TRIANGLES, this.elements, gl.UNSIGNED_SHORT, 0);
    }
}