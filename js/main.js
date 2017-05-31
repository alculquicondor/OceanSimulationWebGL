"use strict";

class Scene {
    constructor(id) {
        /* const */ this.DISTANCE = 20;

        this.webglCanvas = document.getElementById(id);
        this.gl = this.webglCanvas.getContext("webgl");
        this.projectionMat = mat4.create();
        this.viewMat = mat4.create();
        this.modelViewMat = mat4.create();
        this.modelMat = mat4.create();
        let options = {
            lines: WGLUUrl.getBool("lines", false),
            vertexShader: WGLUUrl.getString("vertex", "plain"),
            fragmentShader: WGLUUrl.getString("fragment", "uniform")
        };
        this.ocean = new Ocean(this.gl, 250, 250, 2.0, options);

        this.init();
    }

    init() {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.53, 0.81, 0.98, 1.0);

        let eye = vec3.create();
        vec3.set(eye, 0, 0, 0);
        let target = vec3.create();
        vec3.set(target, 0, -this.DISTANCE, -this.DISTANCE);
        let up = vec3.create();
        vec3.set(up, 0, 1, 0);
        mat4.lookAt(this.viewMat, eye, target, up);
    }

    onResize() {
        this.webglCanvas.width = this.webglCanvas.offsetWidth * window.devicePixelRatio;
        this.webglCanvas.height = this.webglCanvas.offsetHeight * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.webglCanvas.width, this.webglCanvas.height);
        mat4.perspective(this.projectionMat, 2.0, this.webglCanvas.width / this.webglCanvas.height, 0.1, 256.0);
    }

    onAnimationFrame(time) {
        window.requestAnimationFrame(this.onAnimationFrame.bind(this));

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        mat4.identity(this.modelMat);
        mat4.translate(this.modelMat, this.modelMat, [0, -this.DISTANCE, -this.DISTANCE]);
        // mat4.rotateY(this.modelMat, this.modelMat, time / 8000.0);
        this.ocean.render(this.projectionMat, this.viewMat, this.modelMat, time / 1000.0);
    }
}

window.onload = function () {
    let scene = new Scene("webgl-canvas");
    scene.onResize();

    window.addEventListener("resize", scene.onResize.bind(scene), false);
    window.requestAnimationFrame(scene.onAnimationFrame.bind(scene));
};
