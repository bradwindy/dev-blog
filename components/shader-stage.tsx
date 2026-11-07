"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SHAPES: Record<string, number> = { "/": 0, "/about": 1, "/projects": 2, "/contact": 3 };

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}";

// Raymarches four signed-distance shapes, morphs between them, and dithers the result
// to two colours with an 8x8 Bayer matrix. RP holds up to four click ripples (x, y, start time).
const FRAGMENT = `precision highp float;
uniform vec2 R,MO;uniform float OX;uniform vec3 RP[4];vec3 ORG[4];uniform float T,SH,SC,RT;uniform vec3 LO,HI;uniform float NI;
float b2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
float b8(vec2 a){return b4(.5*a)*.25+b2(a);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float tor(vec3 p,vec2 t){return length(vec2(length(p.xz)-t.x,p.y))-t.y;}
float box(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float s0(vec3 p){float sp=length(p)-1.25;float g=abs(dot(sin(p*3.6),cos(p.zxy*3.6)))/3.6-.045;return max(sp,g);}
float s1(vec3 p){p.xz*=rot(p.y*(1.4+SC*2.));return box(p,vec3(.52,1.08,.52),.1);}
float s2(vec3 p){float a=tor(p-vec3(.45,0,0),vec2(.72,.2));vec3 q=(p+vec3(.45,0,0)).xzy;return min(a,tor(q,vec2(.72,.2)));}
float s3(vec3 p){float d=length(p)-.5;for(int i=0;i<5;i++){float f=float(i);vec3 c=vec3(sin(T*.7+f*1.7),cos(T*.9+f*2.3)*.8,sin(T*.5+f*3.1)*.9)*.82;d=smin(d,length(p-c)-.3,.42);}return d;}
float shp(float i,vec3 p){return i<.5?s0(p):i<1.5?s1(p):i<2.5?s2(p):s3(p);}
float rip(vec3 p){float r=0.;for(int i=0;i<4;i++){float a=T-RP[i].z;if(a>0.&&a<4.5){float l=length(p-ORG[i]);r+=sin(l*6.-a*9.)*.26*exp(-a*1.)*exp(-l*.3)*smoothstep(a*1.4+.2,a*1.4-.4,l);}}return r;}
float obj(vec3 p){vec3 w=p;p.xz*=rot(T*.22+MO.x*2.4+SC*3.);p.yz*=rot(MO.y*1.1);
  float i0=floor(SH),f=SH-i0;f=f*f*(3.-2.*f);float d=f<.001?shp(i0,p):mix(shp(i0,p),shp(i0+1.,p),f);
  float a=T-RT;if(a>0.&&a<4.)d+=sin(length(p)*11.-a*9.)*.035*exp(-a*1.4);return d+rip(w);}
float map(vec3 p){return min(obj(p),p.y+1.55);}
vec3 nrm(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
float sha(vec3 ro,vec3 rd){float r=1.,t=.03;for(int i=0;i<32;i++){float h=obj(ro+rd*t);r=min(r,10.*h/t);t+=clamp(h,.02,.25);if(r<.01||t>6.)break;}return clamp(r,0.,1.);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;uv.x-=OX;vec3 ro=vec3(0,.2,3.9),rd=normalize(vec3(uv,-1.55));
  for(int i=0;i<4;i++){vec2 cu=(RP[i].xy-.5*R)/R.y;cu.x-=OX;vec3 cd=normalize(vec3(cu,-1.55));ORG[i]=ro+cd*max(0.,-dot(ro,cd));}
  float t=0.,d;bool hit=false;for(int i=0;i<128;i++){d=map(ro+rd*t);if(d<.0015){hit=true;break;}t+=d*.6;if(t>14.)break;}
  float L=NI>.5?0.:1.;vec3 ld=normalize(vec3(-.55,.85,.45));
  if(hit){vec3 p=ro+rd*t,n=nrm(p);
    if(p.y<-1.54){float s=sha(p,ld);L=NI>.5?0.:mix(.3,1.,s);}
    else{float dif=max(dot(n,ld),0.),s=sha(p+n*.01,ld),rim=pow(1.-max(dot(n,-rd),0.),3.),spe=pow(max(dot(reflect(rd,n),ld),0.),24.);
      float ao=clamp(map(p+n*.12)/.12,0.,1.);L=.04+dif*s*.78*(.5+.5*ao)+spe*.7*s+rim*(NI>.5?.35:.2);}}
  float on=step(b8(gl_FragCoord.xy)+1./128.,L);gl_FragColor=vec4(mix(LO,HI,on),1.);}`;

const hex = (s: string) => {
  const n = parseInt(s.trim().replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
};

export function ShaderStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapeRef = useRef(0);
  const kickRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    shapeRef.current = SHAPES[pathname] ?? 0;
    kickRef.current();
  }, [pathname]);

  useEffect(() => {
    const stage = stageRef.current!;
    const cv = canvasRef.current!;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(
      ["R", "MO", "T", "SH", "SC", "RT", "LO", "HI", "NI", "OX", "RP"].map((n) => [n, gl.getUniformLocation(prog, n)]),
    );

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    const rips = new Float32Array([0, 0, -99, 0, 0, -99, 0, 0, -99, 0, 0, -99]);
    let ri = 0, raf = 0, mx = 0, my = 0, tx = 0, ty = 0, shape = shapeRef.current, sc = 0, scv = 0, rt = -10;
    let drag: { cx: number; cy: number; x: number; y: number } | null = null;
    let colours = { lo: hex("#000"), hi: hex("#fff"), night: false };
    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      colours = { lo: hex(cs.getPropertyValue("--lo")), hi: hex(cs.getPropertyValue("--hi")), night: cs.getPropertyValue("--night").trim() === "1" };
    };
    readColours();

    const draw = () => {
      const w = Math.max(60, Math.round(cv.clientWidth / 3)), h = Math.max(60, Math.round(cv.clientHeight / 3));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(U.R, w, h);
      gl.uniform1f(U.OX, innerWidth > 820 ? (0.07 * w) / h : 0);
      gl.uniform2f(U.MO, mx, my);
      gl.uniform1f(U.T, reduced ? 0 : now());
      gl.uniform1f(U.SH, shape);
      gl.uniform1f(U.SC, sc);
      gl.uniform1f(U.RT, rt);
      gl.uniform3f(U.LO, ...colours.lo);
      gl.uniform3f(U.HI, ...colours.hi);
      gl.uniform1f(U.NI, colours.night ? 1 : 0);
      gl.uniform3fv(U.RP, rips);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      shape += (shapeRef.current - shape) * 0.045;
      if (Math.abs(shapeRef.current - shape) < 0.002) shape = shapeRef.current;
      const max = document.documentElement.scrollHeight - innerHeight;
      scv *= 0.9;
      sc += ((max > 0 ? scrollY / max : 0) + scv - sc) * 0.08;
      draw();
      raf = requestAnimationFrame(loop);
    };

    kickRef.current = () => {
      rt = now();
      if (reduced) {
        shape = shapeRef.current;
        draw();
      }
    };

    let lastY = scrollY;
    const onScroll = () => {
      scv += (scrollY - lastY) * 0.002;
      lastY = scrollY;
    };
    const onMove = (e: PointerEvent) => {
      if (drag) {
        tx = drag.x + (e.clientX - drag.cx) / 220;
        ty = Math.max(-1.2, Math.min(1.2, drag.y + (e.clientY - drag.cy) / 220));
        return;
      }
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / innerWidth - 0.5) * 1.2;
      ty = (e.clientY / innerHeight - 0.5) * 0.9;
    };
    const onDown = (e: PointerEvent) => {
      drag = { cx: e.clientX, cy: e.clientY, x: tx, y: ty };
      stage.style.cursor = "grabbing";
    };
    const onUp = () => {
      drag = null;
      stage.style.cursor = "";
    };
    const onTap = (e: PointerEvent) => {
      if (reduced || (e.target as Element).closest("a,button")) return;
      const r = cv.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      rips.set([((e.clientX - r.left) * cv.width) / r.width, ((r.bottom - e.clientY) * cv.height) / r.height, now()], ri * 3);
      ri = (ri + 1) % 4;
    };
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColours();
      if (reduced) draw();
    };
    const resize = new ResizeObserver(() => reduced && draw());

    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onTap);
    stage.addEventListener("pointerdown", onDown);
    scheme.addEventListener("change", onScheme);
    resize.observe(cv);
    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onTap);
      stage.removeEventListener("pointerdown", onDown);
      scheme.removeEventListener("change", onScheme);
      kickRef.current = () => {};
    };
  }, []);

  return (
    <div ref={stageRef} className="stage" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
