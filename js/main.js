"use strict";

class Scene {
    constructor(id) {
        /* const */ this.DISTANCE = 5;

        this.webglCanvas = document.getElementById(id);
        this.gl = this.webglCanvas.getContext("webgl");
        this.projectionMat = mat4.create();
        this.viewMat = mat4.create();
        this.modelViewMat = mat4.create();
        this.stats = new WGLUStats(this.gl);
        this.ocean = new Ocean(this.gl, 200, 200, WGLUUrl.getBool('lines', false));

        this.init();
    }

    init() {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0, 0, 0, 1);

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
        mat4.perspective(this.projectionMat, 2., this.webglCanvas.width / this.webglCanvas.height, 0.1, 256.0);
    }

    onAnimationFrame(time) {
        window.requestAnimationFrame(this.onAnimationFrame.bind(this));

        this.stats.begin();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        mat4.identity(this.modelViewMat);
        mat4.translate(this.modelViewMat, this.modelViewMat, [-1.8, 0.8, -1]);
        mat4.rotateY(this.modelViewMat, this.modelViewMat, 1.0);
        let scale = vec3.create();
        vec3.set(scale, 0.5, 0.5, 0.5);
        mat4.scale(this.modelViewMat, this.modelViewMat, scale);
        this.stats.render(this.projectionMat, this.modelViewMat);

        mat4.identity(this.modelViewMat);
        mat4.translate(this.modelViewMat, this.modelViewMat, [0, -this.DISTANCE, -this.DISTANCE]);
        mat4.rotateY(this.modelViewMat, this.modelViewMat, time / 4000.0);
        mat4.scalar.multiply(this.modelViewMat, this.viewMat, this.modelViewMat);
        this.ocean.render(this.projectionMat, this.modelViewMat);
        this.stats.end();
    }
}

window.onload = function () {
    let scene = new Scene("webgl-canvas");
    scene.onResize();

    window.addEventListener("resize", scene.onResize.bind(scene), false);
    window.requestAnimationFrame(scene.onAnimationFrame.bind(scene));
};
