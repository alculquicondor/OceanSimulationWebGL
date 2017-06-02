"use strict";

class Scene {
    constructor(canvasId, presentBtnId) {
        /* const */ this.DISTANCE = 40.0;

        this.webglCanvas = document.getElementById(canvasId);
        this.presentBtn = document.getElementById(presentBtnId);
        this.vrDisplay = null;
        this.gl = this.webglCanvas.getContext("webgl");
        this.projectionMat = mat4.create();
        this.viewMat = mat4.create();
        this.modelViewMat = mat4.create();
        this.modelMat = mat4.create();
        let options = {
            lines: WGLUUrl.getBool("lines", false),
            vertexShader: WGLUUrl.getString("vertex", "waves2"),
            fragmentShader: WGLUUrl.getString("fragment", "normal")
        };
	let rows = WGLUUrl.getInt("rows", 80);
        this.ocean = new Ocean(this.gl, rows, 100.0, options);

        this.init();
        this.initWebVr();
    }

    init() {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.53, 0.81, 0.98, 1.0);

        let eye = vec3.create();
        vec3.set(eye, 0, 0, 0);
        let target = vec3.create();
        vec3.set(target, 0, -this.DISTANCE / 2.0, -this.DISTANCE);
        let up = vec3.create();
        vec3.set(up, 0, 1, 0);
        mat4.lookAt(this.viewMat, eye, target, up);
    }

    initWebVr() {
        if (navigator.getVRDisplays) {
            this.frameData = new VRFrameData();

			navigator.getVRDisplays().then((function(displays) {
				if (displays.length > 0) {
					this.vrDisplay = displays[displays.length - 1];
					this.vrDisplay.depthNear = 0.1;
					this.vrDisplay.depthFar = 1024.0;
					if (this.vrDisplay.capabilities.canPresent) {
						this.presentBtn.style.display = "block";
						this.presentBtn.addEventListener("click",
                                this.onVrRequestPresent.bind(this));
					}
					window.addEventListener('vrdisplaypresentchange', this.onVrPresentChange.bind(this), false);
					window.addEventListener('vrdisplayactivate', this.onVrRequestPresent.bind(this), false);
					window.addEventListener('vrdisplaydeactivate', this.onVrExitPresent.bind(this), false);
				} else {
					console.log("WebVr supported, but no VRDisplays found.");
				}
			}).bind(this));
        } else {
            console.log("WebVr not supported");
        }
    }

    onVrRequestPresent() {
        this.vrDisplay.requestPresent([{source: this.webglCanvas}]).then(
                function() {},
                function (err) {
                    let errMsg = "requestPresent failed.";
                    if (err && err.message) {
                        errMsg += " " + err.message;
                    }
                    console.log(errMsg);
                });
    }

    onVrExitPresent() {
        if (!this.vrDisplay.isPresenting)
            return;
        this.vrDisplay.exitPresent().then(
                function() {},
                function (err) {
                    let errMsg = "exitPresent failed.";
                    if (err && err.message) {
                        errMsg += " " + err.message
                    }
                    console.log(errMsg);
                });
    }

    onVrPresentChange() {
        this.onResize();
        if (this.vrDisplay.isPresenting) {
            this.presentBtn.style.display = "none";
        } else {
            this.presentBtn.style.display = "block";
        }
    }

    onResize() {
        if (this.vrDisplay && this.vrDisplay.isPresenting) {
          let leftEye = this.vrDisplay.getEyeParameters("left");
          let rightEye = this.vrDisplay.getEyeParameters("right");
          this.webglCanvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
          this.webglCanvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
        } else {
            this.webglCanvas.width = this.webglCanvas.offsetWidth * window.devicePixelRatio;
            this.webglCanvas.height = this.webglCanvas.offsetHeight * window.devicePixelRatio;
        }
    }

    onAnimationFrame(time) {
        let gl = this.gl;

        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        mat4.identity(this.modelMat);
        mat4.translate(this.modelMat, this.modelMat, [0, -this.DISTANCE, 0]);

        if (this.vrDisplay) {
            this.vrDisplay.requestAnimationFrame(this.onAnimationFrame.bind(this));
            this.vrDisplay.getFrameData(this.frameData);

            if (this.vrDisplay.isPresenting) {
                gl.viewport(0, 0, this.webglCanvas.width * 0.5, this.webglCanvas.height);
                this.ocean.render(this.frameData.leftProjectionMatrix, this.frameData.leftViewMatrix,
                        this.modelMat, time / 1000.0);
                gl.viewport(this.webglCanvas.width * 0.5, 0, this.webglCanvas.width * 0.5, this.webglCanvas.height);
                this.ocean.render(this.frameData.rightProjectionMatrix, this.frameData.rightViewMatrix,
                        this.modelMat, time / 1000.0);
                this.vrDisplay.submitFrame();
            } else {
                gl.viewport(0, 0, this.webglCanvas.width, this.webglCanvas.height);
                mat4.perspective(this.projectionMat, Math.PI * 0.4,
                        this.webglCanvas.width / this.webglCanvas.height, 0.1, 1024.0);
                this.ocean.render(this.projectionMat, this.frameData.leftViewMatrix,
                        this.modelMat, time / 1000.0);
            }
        } else {
            window.requestAnimationFrame(this.onAnimationFrame.bind(this));

            gl.viewport(0, 0, this.webglCanvas.width, this.webglCanvas.height);
            mat4.perspective(this.projectionMat, Math.PI * 0.4,
                    this.webglCanvas.width / this.webglCanvas.height, 0.1, 1024.0);
            this.ocean.render(this.projectionMat, this.viewMat, this.modelMat, time / 1000.0);
        }
    }
}

window.onload = function () {
    let scene = new Scene("webgl-canvas", "present-btn");
    scene.onResize();

    window.addEventListener("resize", scene.onResize.bind(scene), false);
    window.requestAnimationFrame(scene.onAnimationFrame.bind(scene));
};
