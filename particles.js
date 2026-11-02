// Scroll-driven WebGL particles: the profile photo becomes a point cloud that
// morphs into a sphere, a ribbon and a cloud as sections pass. Content never
// depends on it; without WebGL the canvas is removed and the page stays dark.
(() => {
  const canvas = document.querySelector('.particle-scene');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const compact = matchMedia('(max-width: 767px)');
  const COUNT = compact.matches ? 14000 : 34000;
  const SHAPES = { portrait: 0, sphere: 1, wave: 2, cloud: 3 };

  const vertexSource = `
    attribute vec3 aPortrait;
    attribute vec3 aSphere;
    attribute vec3 aWave;
    attribute vec3 aCloud;
    attribute vec4 aRand;
    uniform vec2 uView;
    uniform float uUnit;
    uniform float uSpan;
    uniform vec2 uOffset;
    uniform float uFrom;
    uniform float uTo;
    uniform float uMix;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseForce;
    uniform float uPixelRatio;
    uniform float uSize;
    varying float vAlpha;

    vec3 shape(float id) {
      if (id < .5) return aPortrait;
      if (id < 1.5) {
        float a = uTime * .12;
        vec3 p = vec3(cos(a) * aSphere.x + sin(a) * aSphere.z, aSphere.y, -sin(a) * aSphere.x + cos(a) * aSphere.z);
        return vec3(p.x, cos(.35) * p.y - sin(.35) * p.z, sin(.35) * p.y + cos(.35) * p.z);
      }
      if (id < 2.5) {
        float u = aWave.x;
        float twist = u * 3.1 + 1.3 + uTime * .18;
        float y = .42 * sin(u * 2.2 + uTime * .25) * cos(u * .7) + (aWave.y - .5) * .45 * sin(twist);
        return vec3(u * uSpan * 1.1, y + aWave.z * .03, (aWave.y - .5) * .5 * cos(twist));
      }
      return aCloud + .04 * vec3(sin(uTime * .3 + aRand.x * 6.28), cos(uTime * .25 + aRand.y * 6.28), 0.);
    }

    void main() {
      // Stagger each particle so a shape dissolves instead of sliding as one block.
      float m = clamp(uMix * 1.5 - aRand.z * .5, 0., 1.);
      m = m * m * (3. - 2. * m);
      vec3 p = mix(shape(uFrom), shape(uTo), m);
      float depth = 1. + p.z * .18;
      vec2 screen = uView * .5 + uOffset + vec2(p.x, -p.y) * uUnit * depth;
      vec2 away = screen - uMouse;
      screen += normalize(away + 1e-4) * uMouseForce * (1. - smoothstep(0., 110., length(away))) * 26.;
      vec2 clip = screen / uView * 2. - 1.;
      gl_Position = vec4(clip.x, -clip.y, 0., 1.);
      gl_PointSize = uSize * uPixelRatio * (.6 + aRand.w * .9) * depth;
      float twinkle = .75 + .25 * sin(uTime * (1. + aRand.x * 2.) + aRand.y * 6.28);
      vAlpha = (.5 + .5 * aRand.w) * twinkle * clamp(.7 + p.z * .45, .3, 1.);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - .5;
      float r = dot(c, c);
      if (r > .25) discard;
      gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1. - r * 3.));
    }
  `;

  let program;
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  } catch (error) {
    console.warn('Particles unavailable; the page continues without them.', error);
    canvas.remove();
    return;
  }
  gl.useProgram(program);

  const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

  const sphere = new Float32Array(COUNT * 3);
  const wave = new Float32Array(COUNT * 3);
  const cloud = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT * 4);
  const blobs = [[-.62, .28, 0, .32], [.32, -.12, .12, .38], [.95, .42, -.1, .22]];
  for (let i = 0; i < COUNT; i++) {
    // Fibonacci lattice keeps the sphere evenly filled.
    const y = 1 - (i + .5) / COUNT * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    const radius = .82 + gaussian() * .012;
    sphere.set([Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius], i * 3);
    wave.set([Math.random() * 2 - 1, Math.random(), gaussian()], i * 3);
    const [bx, by, bz, spread] = blobs[i % blobs.length];
    cloud.set([bx + gaussian() * spread, by + gaussian() * spread * .7, bz + gaussian() * spread * .5], i * 3);
    rand.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }

  const attribute = (name, data, size) => {
    const location = gl.getAttribLocation(program, name);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  };
  // The sphere stands in for the portrait until the photo has been sampled.
  const portraitBuffer = attribute('aPortrait', sphere, 3);
  attribute('aSphere', sphere, 3);
  attribute('aWave', wave, 3);
  attribute('aCloud', cloud, 3);
  attribute('aRand', rand, 4);

  const uniforms = {};
  ['uView', 'uUnit', 'uSpan', 'uOffset', 'uFrom', 'uTo', 'uMix', 'uTime', 'uMouse', 'uMouseForce',
    'uPixelRatio', 'uSize', 'uColor', 'uAlpha'].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });
  gl.uniform3f(uniforms.uColor, .94, .95, .94);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);

  // Points are weighted by brightness, by edges and by a foreground mask: the
  // photo's backdrop is blue-tinted while hair and jacket are neutral black.
  const samplePortrait = image => {
    const w = 240;
    const h = Math.round(w * image.naturalHeight / image.naturalWidth);
    const scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
    const context = scratch.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, w, h);
    const { data } = context.getImageData(0, 0, w, h);
    const lum = new Float32Array(w * h);
    const foreground = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      lum[i] = (.2126 * r + .7152 * g + .0722 * b) / 255;
      foreground[i] = b - r < 10 && g - r < 8 ? 1 : 0;
    }
    // The subject sits inside a glowing ring; sample only within it.
    const cx = w * .5, cy = h * .483, radius = h * .41;
    const weights = new Float32Array(w * h);
    let total = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > radius * radius) continue;
        const i = y * w + x;
        const gx = lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1];
        const gy = lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1];
        const edge = Math.min(Math.hypot(gx, gy) * 5, 1.6);
        weights[i] = (foreground[i] ? .22 + lum[i] * .7 : 0) + edge;
        total += weights[i];
      }
    }
    if (!total) return;
    const cumulative = new Float32Array(w * h);
    let running = 0;
    for (let i = 0; i < w * h; i++) cumulative[i] = running += weights[i];
    const positions = new Float32Array(COUNT * 3);
    for (let n = 0; n < COUNT; n++) {
      const target = Math.random() * total;
      let lo = 0, hi = w * h - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cumulative[mid] < target) lo = mid + 1; else hi = mid;
      }
      const x = lo % w + Math.random() - .5;
      const y = Math.floor(lo / w) + Math.random() - .5;
      positions.set([(x - cx) / radius, -(y - cy) / radius, (lum[lo] - .4) * .25], n * 3);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, portraitBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    requestRender();
  };

  // Sections declare which shape sits behind them and how strongly it shows.
  let anchors = [];
  const measureAnchors = () => {
    anchors = [...document.querySelectorAll('[data-particle-shape]')].map(element => {
      const x = Number(element.dataset.particleX || 0);
      // Narrow screens center every shape behind the text, so those shapes dim.
      const centered = compact.matches && x !== 0;
      return {
        top: element.getBoundingClientRect().top + scrollY,
        shape: SHAPES[element.dataset.particleShape] ?? 0,
        x: compact.matches ? 0 : x,
        y: Number(element.dataset.particleY || 0),
        alpha: Number(element.dataset.particleAlpha || .5) * (centered ? .45 : 1),
      };
    }).sort((a, b) => a.top - b.top);
  };
  const scrollTarget = () => {
    const reference = scrollY + innerHeight * .5;
    for (let i = anchors.length - 2; i >= 0; i--) {
      if (reference >= anchors[i].top) {
        const t = (reference - anchors[i].top) / Math.max(1, anchors[i + 1].top - anchors[i].top);
        // Hold each shape for most of its section and morph near the hand-off.
        return i + Math.min(1, Math.max(0, (t - .55) / .45));
      }
    }
    return 0;
  };

  let width = 0, height = 0, unit = 1;
  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    unit = Math.min(width, height) * (compact.matches ? .44 : .42);
    gl.uniform2f(uniforms.uView, width, height);
    gl.uniform1f(uniforms.uUnit, unit);
    gl.uniform1f(uniforms.uSpan, width * .5 / unit);
    gl.uniform1f(uniforms.uPixelRatio, ratio);
    gl.uniform1f(uniforms.uSize, compact.matches ? 2.2 : 2);
    measureAnchors();
    requestRender();
  };

  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, force: 0, target: 0 };
  addEventListener('pointermove', event => {
    if (!finePointer.matches) return;
    mouse.tx = event.clientX;
    mouse.ty = event.clientY;
    if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.target = 1;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { mouse.target = 0; });

  let progress = 0, frame = 0, running = false, start = performance.now();
  const draw = now => {
    const animated = !reduceMotion.matches;
    const target = animated ? scrollTarget() : 0;
    progress = animated ? progress + (target - progress) * .08 : target;
    const index = Math.min(Math.floor(progress), Math.max(0, anchors.length - 2));
    const from = anchors[index] || { shape: 0, x: 0, y: 0, alpha: 1 };
    const to = anchors[index + 1] || from;
    const mix = Math.min(1, progress - index);
    // Reduced motion keeps a still portrait that only fades as sections pass.
    const fade = reduceMotion.matches ? (scrollY > innerHeight * .6 ? .25 : 1) : from.alpha + (to.alpha - from.alpha) * mix;
    mouse.x += (mouse.tx - mouse.x) * .15;
    mouse.y += (mouse.ty - mouse.y) * .15;
    mouse.force += ((animated ? mouse.target : 0) - mouse.force) * .08;

    gl.uniform1f(uniforms.uFrom, animated ? from.shape : 0);
    gl.uniform1f(uniforms.uTo, animated ? to.shape : 0);
    gl.uniform1f(uniforms.uMix, mix);
    gl.uniform2f(uniforms.uOffset, (from.x + (to.x - from.x) * mix) * width, (from.y + (to.y - from.y) * mix) * height);
    gl.uniform1f(uniforms.uAlpha, fade);
    gl.uniform1f(uniforms.uTime, animated ? (now - start) / 1000 : 0);
    gl.uniform2f(uniforms.uMouse, mouse.x, mouse.y);
    gl.uniform1f(uniforms.uMouseForce, mouse.force);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, COUNT);
    if (running) frame = requestAnimationFrame(draw);
  };
  function requestRender() {
    if (!running) requestAnimationFrame(draw);
  }
  const sync = () => {
    const shouldRun = !document.hidden && !reduceMotion.matches;
    if (shouldRun === running) return;
    running = shouldRun;
    cancelAnimationFrame(frame);
    if (running) frame = requestAnimationFrame(draw);
    else requestRender();
  };

  resize();
  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', () => { if (!running) requestRender(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measureAnchors).observe(document.body);
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', sync);
  sync();
  requestRender();

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => samplePortrait(image);
  image.src = canvas.dataset.portrait;
})();
