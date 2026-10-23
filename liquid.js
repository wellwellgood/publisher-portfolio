// Local WebGL effect: preserves the original video as a fallback.
(() => {
  const hero = document.querySelector('.hero-frame');
  const video = hero?.querySelector('.background-video');
  if (!video) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid-background';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, video.nextSibling);
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
  if (!gl) { canvas.remove(); return; }
  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec2 uv;
    uniform sampler2D image;
    uniform vec2 viewSize;
    uniform vec2 imageSize;
    uniform float time;
    uniform vec3 drops[8];
    void main() {
      float aspect = viewSize.x / viewSize.y;
      vec2 offset = vec2(0.);
      for (int i = 0; i < 8; i++) {
        float age = time - drops[i].z;
        vec2 delta = (uv - drops[i].xy) * vec2(aspect, 1.);
        float distance = length(delta);
        float radius = age * .16;
        float envelope = exp(-pow((distance - radius) / .055, 2.));
        float life = max(0., 1. - age / 1.8);
        float wave = sin((distance - radius) * 85.) * envelope * life;
        offset += delta / max(distance, .001) / vec2(aspect, 1.) * wave * .004;
      }
      float imageAspect = imageSize.x / imageSize.y;
      vec2 cover = vec2(min(1., aspect / imageAspect), min(1., imageAspect / aspect));
      vec2 sampleUV = ((uv + offset) - .5) * cover + .5;
      gl_FragColor = texture2D(image, clamp(sampleUV, .001, .999));
    }
  `;
  let program;
  const shaders = [];
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error('Shader unavailable');
      return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('WebGL unavailable');
  } catch (_) {
    shaders.forEach(shader => gl.deleteShader(shader));
    if (program) gl.deleteProgram(program);
    canvas.remove();
    return;
  }
  shaders.forEach(shader => gl.deleteShader(shader));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniforms = Object.fromEntries(['image','viewSize','imageSize','time','drops[0]'].map(name => [name, gl.getUniformLocation(program, name)]));
  gl.uniform1i(uniforms.image, 0);
  const drops = new Float32Array(24);
  const origin = performance.now();
  const now = () => (performance.now() - origin) / 1000;
  const clearDrops = () => { for (let i = 0; i < 8; i++) drops[i * 3 + 2] = -100; };
  clearDrops();
  let index = 0, lastDrop = -1, frame = 0, previousFrame = -100, inView = true, failed = false;
  const enabled = () => !failed && !motion.matches && mouse.matches && !document.hidden && inView;
  hero.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType === 'touch') return;
    const time = now();
    if (time - lastDrop < .065) return;
    const rect = hero.getBoundingClientRect();
    drops[index * 3] = (event.clientX - rect.left) / rect.width;
    drops[index * 3 + 1] = 1 - (event.clientY - rect.top) / rect.height;
    drops[index * 3 + 2] = time;
    index = (index + 1) % 8;
    lastDrop = time;
  }, { passive: true });
  const draw = timestamp => {
    frame = 0;
    if (!enabled()) return;
    frame = requestAnimationFrame(draw);
    if (timestamp - previousFrame < 1000 / 30 || video.readyState < 2 || !video.videoWidth) return;
    previousFrame = timestamp;
    const rect = hero.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(rect.width, 1));
    const width = Math.max(1, Math.round(rect.width * scale));
    const height = Math.max(1, Math.round(rect.height * scale));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.uniform2f(uniforms.viewSize, rect.width, rect.height);
      gl.uniform2f(uniforms.imageSize, video.videoWidth, video.videoHeight);
      gl.uniform1f(uniforms.time, now());
      gl.uniform3fv(uniforms['drops[0]'], drops);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.classList.add('is-ready');
    } catch (_) { failed = true; sync(); }
  };
  const sync = () => {
    if (!enabled()) {
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.classList.remove('is-ready');
      clearDrops();
    } else if (!frame) frame = requestAnimationFrame(draw);
  };
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); failed = true; sync(); });
  motion.addEventListener('change', sync);
  mouse.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    sync();
  }).observe(hero);
  sync();
})();
