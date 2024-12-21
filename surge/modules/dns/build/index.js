var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// ../../../../../../../../bun-vfs$$/node_modules/buffer/index.js
var exports_buffer = {};
__export(exports_buffer, {
  transcode: () => at,
  resolveObjectURL: () => lt,
  kStringMaxLength: () => K,
  isUtf8: () => pt,
  isAscii: () => ct,
  default: () => export_default,
  createObjectURL: () => ft,
  constants: () => st,
  btoa: () => ht,
  atob: () => ut,
  File: () => ot,
  Buffer: () => export_Buffer,
  Blob: () => nt
});
function lt(i) {
  throw new Error("Not implemented");
}
function at(i, r, t) {
  throw new Error("Not implemented");
}
var gr, $, mr, Ir, Fr, Ar, P = (i, r) => () => (r || i((r = { exports: {} }).exports, r), r.exports), Ur = (i, r) => {
  for (var t in r)
    $(i, t, { get: r[t], enumerable: true });
}, D = (i, r, t, e) => {
  if (r && typeof r == "object" || typeof r == "function")
    for (let n of Ir(r))
      !Ar.call(i, n) && n !== t && $(i, n, { get: () => r[n], enumerable: !(e = mr(r, n)) || e.enumerable });
  return i;
}, x = (i, r, t) => (D(i, r, "default"), t && D(t, r, "default")), O = (i, r, t) => (t = i != null ? gr(Fr(i)) : {}, D(r || !i || !i.__esModule ? $(t, "default", { value: i, enumerable: true }) : t, i)), v, rr, b, w, Br, Er, K, nt, ot, ut, ht, ft, ct = (i) => ArrayBuffer.isView(i) ? i.every((r) => r < 128) : i.split("").every((r) => r.charCodeAt(0) < 128), pt = (i) => {
  throw new Error("Not implemented");
}, st, export_Buffer, export_default;
var init_buffer = __esm(() => {
  gr = Object.create;
  $ = Object.defineProperty;
  mr = Object.getOwnPropertyDescriptor;
  Ir = Object.getOwnPropertyNames;
  Fr = Object.getPrototypeOf;
  Ar = Object.prototype.hasOwnProperty;
  v = P((L) => {
    L.byteLength = Tr;
    L.toByteArray = _r;
    L.fromByteArray = Nr;
    var d = [], B = [], Rr = typeof Uint8Array < "u" ? Uint8Array : Array, G = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (F = 0, Z = G.length;F < Z; ++F)
      d[F] = G[F], B[G.charCodeAt(F)] = F;
    var F, Z;
    B[45] = 62;
    B[95] = 63;
    function Q(i) {
      var r = i.length;
      if (r % 4 > 0)
        throw new Error("Invalid string. Length must be a multiple of 4");
      var t = i.indexOf("=");
      t === -1 && (t = r);
      var e = t === r ? 0 : 4 - t % 4;
      return [t, e];
    }
    function Tr(i) {
      var r = Q(i), t = r[0], e = r[1];
      return (t + e) * 3 / 4 - e;
    }
    function Cr(i, r, t) {
      return (r + t) * 3 / 4 - t;
    }
    function _r(i) {
      var r, t = Q(i), e = t[0], n = t[1], o = new Rr(Cr(i, e, n)), u = 0, f = n > 0 ? e - 4 : e, c;
      for (c = 0;c < f; c += 4)
        r = B[i.charCodeAt(c)] << 18 | B[i.charCodeAt(c + 1)] << 12 | B[i.charCodeAt(c + 2)] << 6 | B[i.charCodeAt(c + 3)], o[u++] = r >> 16 & 255, o[u++] = r >> 8 & 255, o[u++] = r & 255;
      return n === 2 && (r = B[i.charCodeAt(c)] << 2 | B[i.charCodeAt(c + 1)] >> 4, o[u++] = r & 255), n === 1 && (r = B[i.charCodeAt(c)] << 10 | B[i.charCodeAt(c + 1)] << 4 | B[i.charCodeAt(c + 2)] >> 2, o[u++] = r >> 8 & 255, o[u++] = r & 255), o;
    }
    function Sr(i) {
      return d[i >> 18 & 63] + d[i >> 12 & 63] + d[i >> 6 & 63] + d[i & 63];
    }
    function Lr(i, r, t) {
      for (var e, n = [], o = r;o < t; o += 3)
        e = (i[o] << 16 & 16711680) + (i[o + 1] << 8 & 65280) + (i[o + 2] & 255), n.push(Sr(e));
      return n.join("");
    }
    function Nr(i) {
      for (var r, t = i.length, e = t % 3, n = [], o = 16383, u = 0, f = t - e;u < f; u += o)
        n.push(Lr(i, u, u + o > f ? f : u + o));
      return e === 1 ? (r = i[t - 1], n.push(d[r >> 2] + d[r << 4 & 63] + "==")) : e === 2 && (r = (i[t - 2] << 8) + i[t - 1], n.push(d[r >> 10] + d[r >> 4 & 63] + d[r << 2 & 63] + "=")), n.join("");
    }
  });
  rr = P((Y) => {
    Y.read = function(i, r, t, e, n) {
      var o, u, f = n * 8 - e - 1, c = (1 << f) - 1, l = c >> 1, s = -7, p = t ? n - 1 : 0, U = t ? -1 : 1, E = i[r + p];
      for (p += U, o = E & (1 << -s) - 1, E >>= -s, s += f;s > 0; o = o * 256 + i[r + p], p += U, s -= 8)
        ;
      for (u = o & (1 << -s) - 1, o >>= -s, s += e;s > 0; u = u * 256 + i[r + p], p += U, s -= 8)
        ;
      if (o === 0)
        o = 1 - l;
      else {
        if (o === c)
          return u ? NaN : (E ? -1 : 1) * (1 / 0);
        u = u + Math.pow(2, e), o = o - l;
      }
      return (E ? -1 : 1) * u * Math.pow(2, o - e);
    };
    Y.write = function(i, r, t, e, n, o) {
      var u, f, c, l = o * 8 - n - 1, s = (1 << l) - 1, p = s >> 1, U = n === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, E = e ? 0 : o - 1, k = e ? 1 : -1, dr = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0;
      for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (f = isNaN(r) ? 1 : 0, u = s) : (u = Math.floor(Math.log(r) / Math.LN2), r * (c = Math.pow(2, -u)) < 1 && (u--, c *= 2), u + p >= 1 ? r += U / c : r += U * Math.pow(2, 1 - p), r * c >= 2 && (u++, c /= 2), u + p >= s ? (f = 0, u = s) : u + p >= 1 ? (f = (r * c - 1) * Math.pow(2, n), u = u + p) : (f = r * Math.pow(2, p - 1) * Math.pow(2, n), u = 0));n >= 8; i[t + E] = f & 255, E += k, f /= 256, n -= 8)
        ;
      for (u = u << n | f, l += n;l > 0; i[t + E] = u & 255, E += k, u /= 256, l -= 8)
        ;
      i[t + E - k] |= dr * 128;
    };
  });
  b = P((_) => {
    var j = v(), T = rr(), tr = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    _.Buffer = h;
    _.SlowBuffer = Pr;
    _.INSPECT_MAX_BYTES = 50;
    var N = 2147483647;
    _.kMaxLength = N;
    h.TYPED_ARRAY_SUPPORT = Mr();
    !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function Mr() {
      try {
        let i = new Uint8Array(1), r = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(r, Uint8Array.prototype), Object.setPrototypeOf(i, r), i.foo() === 42;
      } catch {
        return false;
      }
    }
    Object.defineProperty(h.prototype, "parent", { enumerable: true, get: function() {
      if (!!h.isBuffer(this))
        return this.buffer;
    } });
    Object.defineProperty(h.prototype, "offset", { enumerable: true, get: function() {
      if (!!h.isBuffer(this))
        return this.byteOffset;
    } });
    function m(i) {
      if (i > N)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
      let r = new Uint8Array(i);
      return Object.setPrototypeOf(r, h.prototype), r;
    }
    function h(i, r, t) {
      if (typeof i == "number") {
        if (typeof r == "string")
          throw new TypeError('The "string" argument must be of type string. Received type number');
        return X(i);
      }
      return or(i, r, t);
    }
    h.poolSize = 8192;
    function or(i, r, t) {
      if (typeof i == "string")
        return kr(i, r);
      if (ArrayBuffer.isView(i))
        return Dr(i);
      if (i == null)
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i);
      if (g(i, ArrayBuffer) || i && g(i.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (g(i, SharedArrayBuffer) || i && g(i.buffer, SharedArrayBuffer)))
        return W(i, r, t);
      if (typeof i == "number")
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      let e = i.valueOf && i.valueOf();
      if (e != null && e !== i)
        return h.from(e, r, t);
      let n = $r(i);
      if (n)
        return n;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i[Symbol.toPrimitive] == "function")
        return h.from(i[Symbol.toPrimitive]("string"), r, t);
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i);
    }
    h.from = function(i, r, t) {
      return or(i, r, t);
    };
    Object.setPrototypeOf(h.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(h, Uint8Array);
    function ur(i) {
      if (typeof i != "number")
        throw new TypeError('"size" argument must be of type number');
      if (i < 0)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
    }
    function br(i, r, t) {
      return ur(i), i <= 0 ? m(i) : r !== undefined ? typeof t == "string" ? m(i).fill(r, t) : m(i).fill(r) : m(i);
    }
    h.alloc = function(i, r, t) {
      return br(i, r, t);
    };
    function X(i) {
      return ur(i), m(i < 0 ? 0 : V(i) | 0);
    }
    h.allocUnsafe = function(i) {
      return X(i);
    };
    h.allocUnsafeSlow = function(i) {
      return X(i);
    };
    function kr(i, r) {
      if ((typeof r != "string" || r === "") && (r = "utf8"), !h.isEncoding(r))
        throw new TypeError("Unknown encoding: " + r);
      let t = hr(i, r) | 0, e = m(t), n = e.write(i, r);
      return n !== t && (e = e.slice(0, n)), e;
    }
    function q(i) {
      let r = i.length < 0 ? 0 : V(i.length) | 0, t = m(r);
      for (let e = 0;e < r; e += 1)
        t[e] = i[e] & 255;
      return t;
    }
    function Dr(i) {
      if (g(i, Uint8Array)) {
        let r = new Uint8Array(i);
        return W(r.buffer, r.byteOffset, r.byteLength);
      }
      return q(i);
    }
    function W(i, r, t) {
      if (r < 0 || i.byteLength < r)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (i.byteLength < r + (t || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let e;
      return r === undefined && t === undefined ? e = new Uint8Array(i) : t === undefined ? e = new Uint8Array(i, r) : e = new Uint8Array(i, r, t), Object.setPrototypeOf(e, h.prototype), e;
    }
    function $r(i) {
      if (h.isBuffer(i)) {
        let r = V(i.length) | 0, t = m(r);
        return t.length === 0 || i.copy(t, 0, 0, r), t;
      }
      if (i.length !== undefined)
        return typeof i.length != "number" || J(i.length) ? m(0) : q(i);
      if (i.type === "Buffer" && Array.isArray(i.data))
        return q(i.data);
    }
    function V(i) {
      if (i >= N)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + N.toString(16) + " bytes");
      return i | 0;
    }
    function Pr(i) {
      return +i != i && (i = 0), h.alloc(+i);
    }
    h.isBuffer = function(r) {
      return r != null && r._isBuffer === true && r !== h.prototype;
    };
    h.compare = function(r, t) {
      if (g(r, Uint8Array) && (r = h.from(r, r.offset, r.byteLength)), g(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(r) || !h.isBuffer(t))
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      if (r === t)
        return 0;
      let e = r.length, n = t.length;
      for (let o = 0, u = Math.min(e, n);o < u; ++o)
        if (r[o] !== t[o]) {
          e = r[o], n = t[o];
          break;
        }
      return e < n ? -1 : n < e ? 1 : 0;
    };
    h.isEncoding = function(r) {
      switch (String(r).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    h.concat = function(r, t) {
      if (!Array.isArray(r))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (r.length === 0)
        return h.alloc(0);
      let e;
      if (t === undefined)
        for (t = 0, e = 0;e < r.length; ++e)
          t += r[e].length;
      let n = h.allocUnsafe(t), o = 0;
      for (e = 0;e < r.length; ++e) {
        let u = r[e];
        if (g(u, Uint8Array))
          o + u.length > n.length ? (h.isBuffer(u) || (u = h.from(u)), u.copy(n, o)) : Uint8Array.prototype.set.call(n, u, o);
        else if (h.isBuffer(u))
          u.copy(n, o);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        o += u.length;
      }
      return n;
    };
    function hr(i, r) {
      if (h.isBuffer(i))
        return i.length;
      if (ArrayBuffer.isView(i) || g(i, ArrayBuffer))
        return i.byteLength;
      if (typeof i != "string")
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i);
      let t = i.length, e = arguments.length > 2 && arguments[2] === true;
      if (!e && t === 0)
        return 0;
      let n = false;
      for (;; )
        switch (r) {
          case "ascii":
          case "latin1":
          case "binary":
            return t;
          case "utf8":
          case "utf-8":
            return H(i).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return t * 2;
          case "hex":
            return t >>> 1;
          case "base64":
            return xr(i).length;
          default:
            if (n)
              return e ? -1 : H(i).length;
            r = ("" + r).toLowerCase(), n = true;
        }
    }
    h.byteLength = hr;
    function Or(i, r, t) {
      let e = false;
      if ((r === undefined || r < 0) && (r = 0), r > this.length || ((t === undefined || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, r >>>= 0, t <= r))
        return "";
      for (i || (i = "utf8");; )
        switch (i) {
          case "hex":
            return Jr(this, r, t);
          case "utf8":
          case "utf-8":
            return cr(this, r, t);
          case "ascii":
            return Vr(this, r, t);
          case "latin1":
          case "binary":
            return zr(this, r, t);
          case "base64":
            return Hr(this, r, t);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return Kr(this, r, t);
          default:
            if (e)
              throw new TypeError("Unknown encoding: " + i);
            i = (i + "").toLowerCase(), e = true;
        }
    }
    h.prototype._isBuffer = true;
    function A(i, r, t) {
      let e = i[r];
      i[r] = i[t], i[t] = e;
    }
    h.prototype.swap16 = function() {
      let r = this.length;
      if (r % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let t = 0;t < r; t += 2)
        A(this, t, t + 1);
      return this;
    };
    h.prototype.swap32 = function() {
      let r = this.length;
      if (r % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let t = 0;t < r; t += 4)
        A(this, t, t + 3), A(this, t + 1, t + 2);
      return this;
    };
    h.prototype.swap64 = function() {
      let r = this.length;
      if (r % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0;t < r; t += 8)
        A(this, t, t + 7), A(this, t + 1, t + 6), A(this, t + 2, t + 5), A(this, t + 3, t + 4);
      return this;
    };
    h.prototype.toString = function() {
      let r = this.length;
      return r === 0 ? "" : arguments.length === 0 ? cr(this, 0, r) : Or.apply(this, arguments);
    };
    h.prototype.toLocaleString = h.prototype.toString;
    h.prototype.equals = function(r) {
      if (!h.isBuffer(r))
        throw new TypeError("Argument must be a Buffer");
      return this === r ? true : h.compare(this, r) === 0;
    };
    h.prototype.inspect = function() {
      let r = "", t = _.INSPECT_MAX_BYTES;
      return r = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (r += " ... "), "<Buffer " + r + ">";
    };
    tr && (h.prototype[tr] = h.prototype.inspect);
    h.prototype.compare = function(r, t, e, n, o) {
      if (g(r, Uint8Array) && (r = h.from(r, r.offset, r.byteLength)), !h.isBuffer(r))
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r);
      if (t === undefined && (t = 0), e === undefined && (e = r ? r.length : 0), n === undefined && (n = 0), o === undefined && (o = this.length), t < 0 || e > r.length || n < 0 || o > this.length)
        throw new RangeError("out of range index");
      if (n >= o && t >= e)
        return 0;
      if (n >= o)
        return -1;
      if (t >= e)
        return 1;
      if (t >>>= 0, e >>>= 0, n >>>= 0, o >>>= 0, this === r)
        return 0;
      let u = o - n, f = e - t, c = Math.min(u, f), l = this.slice(n, o), s = r.slice(t, e);
      for (let p = 0;p < c; ++p)
        if (l[p] !== s[p]) {
          u = l[p], f = s[p];
          break;
        }
      return u < f ? -1 : f < u ? 1 : 0;
    };
    function fr(i, r, t, e, n) {
      if (i.length === 0)
        return -1;
      if (typeof t == "string" ? (e = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, J(t) && (t = n ? 0 : i.length - 1), t < 0 && (t = i.length + t), t >= i.length) {
        if (n)
          return -1;
        t = i.length - 1;
      } else if (t < 0)
        if (n)
          t = 0;
        else
          return -1;
      if (typeof r == "string" && (r = h.from(r, e)), h.isBuffer(r))
        return r.length === 0 ? -1 : ir(i, r, t, e, n);
      if (typeof r == "number")
        return r = r & 255, typeof Uint8Array.prototype.indexOf == "function" ? n ? Uint8Array.prototype.indexOf.call(i, r, t) : Uint8Array.prototype.lastIndexOf.call(i, r, t) : ir(i, [r], t, e, n);
      throw new TypeError("val must be string, number or Buffer");
    }
    function ir(i, r, t, e, n) {
      let o = 1, u = i.length, f = r.length;
      if (e !== undefined && (e = String(e).toLowerCase(), e === "ucs2" || e === "ucs-2" || e === "utf16le" || e === "utf-16le")) {
        if (i.length < 2 || r.length < 2)
          return -1;
        o = 2, u /= 2, f /= 2, t /= 2;
      }
      function c(s, p) {
        return o === 1 ? s[p] : s.readUInt16BE(p * o);
      }
      let l;
      if (n) {
        let s = -1;
        for (l = t;l < u; l++)
          if (c(i, l) === c(r, s === -1 ? 0 : l - s)) {
            if (s === -1 && (s = l), l - s + 1 === f)
              return s * o;
          } else
            s !== -1 && (l -= l - s), s = -1;
      } else
        for (t + f > u && (t = u - f), l = t;l >= 0; l--) {
          let s = true;
          for (let p = 0;p < f; p++)
            if (c(i, l + p) !== c(r, p)) {
              s = false;
              break;
            }
          if (s)
            return l;
        }
      return -1;
    }
    h.prototype.includes = function(r, t, e) {
      return this.indexOf(r, t, e) !== -1;
    };
    h.prototype.indexOf = function(r, t, e) {
      return fr(this, r, t, e, true);
    };
    h.prototype.lastIndexOf = function(r, t, e) {
      return fr(this, r, t, e, false);
    };
    function Gr(i, r, t, e) {
      t = Number(t) || 0;
      let n = i.length - t;
      e ? (e = Number(e), e > n && (e = n)) : e = n;
      let o = r.length;
      e > o / 2 && (e = o / 2);
      let u;
      for (u = 0;u < e; ++u) {
        let f = parseInt(r.substr(u * 2, 2), 16);
        if (J(f))
          return u;
        i[t + u] = f;
      }
      return u;
    }
    function Yr(i, r, t, e) {
      return M(H(r, i.length - t), i, t, e);
    }
    function jr(i, r, t, e) {
      return M(rt(r), i, t, e);
    }
    function qr(i, r, t, e) {
      return M(xr(r), i, t, e);
    }
    function Wr(i, r, t, e) {
      return M(tt(r, i.length - t), i, t, e);
    }
    h.prototype.write = function(r, t, e, n) {
      if (t === undefined)
        n = "utf8", e = this.length, t = 0;
      else if (e === undefined && typeof t == "string")
        n = t, e = this.length, t = 0;
      else if (isFinite(t))
        t = t >>> 0, isFinite(e) ? (e = e >>> 0, n === undefined && (n = "utf8")) : (n = e, e = undefined);
      else
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      let o = this.length - t;
      if ((e === undefined || e > o) && (e = o), r.length > 0 && (e < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      n || (n = "utf8");
      let u = false;
      for (;; )
        switch (n) {
          case "hex":
            return Gr(this, r, t, e);
          case "utf8":
          case "utf-8":
            return Yr(this, r, t, e);
          case "ascii":
          case "latin1":
          case "binary":
            return jr(this, r, t, e);
          case "base64":
            return qr(this, r, t, e);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return Wr(this, r, t, e);
          default:
            if (u)
              throw new TypeError("Unknown encoding: " + n);
            n = ("" + n).toLowerCase(), u = true;
        }
    };
    h.prototype.toJSON = function() {
      return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
    };
    function Hr(i, r, t) {
      return r === 0 && t === i.length ? j.fromByteArray(i) : j.fromByteArray(i.slice(r, t));
    }
    function cr(i, r, t) {
      t = Math.min(i.length, t);
      let e = [], n = r;
      for (;n < t; ) {
        let o = i[n], u = null, f = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
        if (n + f <= t) {
          let c, l, s, p;
          switch (f) {
            case 1:
              o < 128 && (u = o);
              break;
            case 2:
              c = i[n + 1], (c & 192) === 128 && (p = (o & 31) << 6 | c & 63, p > 127 && (u = p));
              break;
            case 3:
              c = i[n + 1], l = i[n + 2], (c & 192) === 128 && (l & 192) === 128 && (p = (o & 15) << 12 | (c & 63) << 6 | l & 63, p > 2047 && (p < 55296 || p > 57343) && (u = p));
              break;
            case 4:
              c = i[n + 1], l = i[n + 2], s = i[n + 3], (c & 192) === 128 && (l & 192) === 128 && (s & 192) === 128 && (p = (o & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | s & 63, p > 65535 && p < 1114112 && (u = p));
          }
        }
        u === null ? (u = 65533, f = 1) : u > 65535 && (u -= 65536, e.push(u >>> 10 & 1023 | 55296), u = 56320 | u & 1023), e.push(u), n += f;
      }
      return Xr(e);
    }
    var er = 4096;
    function Xr(i) {
      let r = i.length;
      if (r <= er)
        return String.fromCharCode.apply(String, i);
      let t = "", e = 0;
      for (;e < r; )
        t += String.fromCharCode.apply(String, i.slice(e, e += er));
      return t;
    }
    function Vr(i, r, t) {
      let e = "";
      t = Math.min(i.length, t);
      for (let n = r;n < t; ++n)
        e += String.fromCharCode(i[n] & 127);
      return e;
    }
    function zr(i, r, t) {
      let e = "";
      t = Math.min(i.length, t);
      for (let n = r;n < t; ++n)
        e += String.fromCharCode(i[n]);
      return e;
    }
    function Jr(i, r, t) {
      let e = i.length;
      (!r || r < 0) && (r = 0), (!t || t < 0 || t > e) && (t = e);
      let n = "";
      for (let o = r;o < t; ++o)
        n += it[i[o]];
      return n;
    }
    function Kr(i, r, t) {
      let e = i.slice(r, t), n = "";
      for (let o = 0;o < e.length - 1; o += 2)
        n += String.fromCharCode(e[o] + e[o + 1] * 256);
      return n;
    }
    h.prototype.slice = function(r, t) {
      let e = this.length;
      r = ~~r, t = t === undefined ? e : ~~t, r < 0 ? (r += e, r < 0 && (r = 0)) : r > e && (r = e), t < 0 ? (t += e, t < 0 && (t = 0)) : t > e && (t = e), t < r && (t = r);
      let n = this.subarray(r, t);
      return Object.setPrototypeOf(n, h.prototype), n;
    };
    function a(i, r, t) {
      if (i % 1 !== 0 || i < 0)
        throw new RangeError("offset is not uint");
      if (i + r > t)
        throw new RangeError("Trying to access beyond buffer length");
    }
    h.prototype.readUintLE = h.prototype.readUIntLE = function(r, t, e) {
      r = r >>> 0, t = t >>> 0, e || a(r, t, this.length);
      let n = this[r], o = 1, u = 0;
      for (;++u < t && (o *= 256); )
        n += this[r + u] * o;
      return n;
    };
    h.prototype.readUintBE = h.prototype.readUIntBE = function(r, t, e) {
      r = r >>> 0, t = t >>> 0, e || a(r, t, this.length);
      let n = this[r + --t], o = 1;
      for (;t > 0 && (o *= 256); )
        n += this[r + --t] * o;
      return n;
    };
    h.prototype.readUint8 = h.prototype.readUInt8 = function(r, t) {
      return r = r >>> 0, t || a(r, 1, this.length), this[r];
    };
    h.prototype.readUint16LE = h.prototype.readUInt16LE = function(r, t) {
      return r = r >>> 0, t || a(r, 2, this.length), this[r] | this[r + 1] << 8;
    };
    h.prototype.readUint16BE = h.prototype.readUInt16BE = function(r, t) {
      return r = r >>> 0, t || a(r, 2, this.length), this[r] << 8 | this[r + 1];
    };
    h.prototype.readUint32LE = h.prototype.readUInt32LE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
    };
    h.prototype.readUint32BE = h.prototype.readUInt32BE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
    };
    h.prototype.readBigUInt64LE = I(function(r) {
      r = r >>> 0, C(r, "offset");
      let t = this[r], e = this[r + 7];
      (t === undefined || e === undefined) && S(r, this.length - 8);
      let n = t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24, o = this[++r] + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + e * 2 ** 24;
      return BigInt(n) + (BigInt(o) << BigInt(32));
    });
    h.prototype.readBigUInt64BE = I(function(r) {
      r = r >>> 0, C(r, "offset");
      let t = this[r], e = this[r + 7];
      (t === undefined || e === undefined) && S(r, this.length - 8);
      let n = t * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r], o = this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + e;
      return (BigInt(n) << BigInt(32)) + BigInt(o);
    });
    h.prototype.readIntLE = function(r, t, e) {
      r = r >>> 0, t = t >>> 0, e || a(r, t, this.length);
      let n = this[r], o = 1, u = 0;
      for (;++u < t && (o *= 256); )
        n += this[r + u] * o;
      return o *= 128, n >= o && (n -= Math.pow(2, 8 * t)), n;
    };
    h.prototype.readIntBE = function(r, t, e) {
      r = r >>> 0, t = t >>> 0, e || a(r, t, this.length);
      let n = t, o = 1, u = this[r + --n];
      for (;n > 0 && (o *= 256); )
        u += this[r + --n] * o;
      return o *= 128, u >= o && (u -= Math.pow(2, 8 * t)), u;
    };
    h.prototype.readInt8 = function(r, t) {
      return r = r >>> 0, t || a(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
    };
    h.prototype.readInt16LE = function(r, t) {
      r = r >>> 0, t || a(r, 2, this.length);
      let e = this[r] | this[r + 1] << 8;
      return e & 32768 ? e | 4294901760 : e;
    };
    h.prototype.readInt16BE = function(r, t) {
      r = r >>> 0, t || a(r, 2, this.length);
      let e = this[r + 1] | this[r] << 8;
      return e & 32768 ? e | 4294901760 : e;
    };
    h.prototype.readInt32LE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
    };
    h.prototype.readInt32BE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
    };
    h.prototype.readBigInt64LE = I(function(r) {
      r = r >>> 0, C(r, "offset");
      let t = this[r], e = this[r + 7];
      (t === undefined || e === undefined) && S(r, this.length - 8);
      let n = this[r + 4] + this[r + 5] * 2 ** 8 + this[r + 6] * 2 ** 16 + (e << 24);
      return (BigInt(n) << BigInt(32)) + BigInt(t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24);
    });
    h.prototype.readBigInt64BE = I(function(r) {
      r = r >>> 0, C(r, "offset");
      let t = this[r], e = this[r + 7];
      (t === undefined || e === undefined) && S(r, this.length - 8);
      let n = (t << 24) + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r];
      return (BigInt(n) << BigInt(32)) + BigInt(this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + e);
    });
    h.prototype.readFloatLE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), T.read(this, r, true, 23, 4);
    };
    h.prototype.readFloatBE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), T.read(this, r, false, 23, 4);
    };
    h.prototype.readDoubleLE = function(r, t) {
      return r = r >>> 0, t || a(r, 8, this.length), T.read(this, r, true, 52, 8);
    };
    h.prototype.readDoubleBE = function(r, t) {
      return r = r >>> 0, t || a(r, 8, this.length), T.read(this, r, false, 52, 8);
    };
    function y(i, r, t, e, n, o) {
      if (!h.isBuffer(i))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (r > n || r < o)
        throw new RangeError('"value" argument is out of bounds');
      if (t + e > i.length)
        throw new RangeError("Index out of range");
    }
    h.prototype.writeUintLE = h.prototype.writeUIntLE = function(r, t, e, n) {
      if (r = +r, t = t >>> 0, e = e >>> 0, !n) {
        let f = Math.pow(2, 8 * e) - 1;
        y(this, r, t, e, f, 0);
      }
      let o = 1, u = 0;
      for (this[t] = r & 255;++u < e && (o *= 256); )
        this[t + u] = r / o & 255;
      return t + e;
    };
    h.prototype.writeUintBE = h.prototype.writeUIntBE = function(r, t, e, n) {
      if (r = +r, t = t >>> 0, e = e >>> 0, !n) {
        let f = Math.pow(2, 8 * e) - 1;
        y(this, r, t, e, f, 0);
      }
      let o = e - 1, u = 1;
      for (this[t + o] = r & 255;--o >= 0 && (u *= 256); )
        this[t + o] = r / u & 255;
      return t + e;
    };
    h.prototype.writeUint8 = h.prototype.writeUInt8 = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 1, 255, 0), this[t] = r & 255, t + 1;
    };
    h.prototype.writeUint16LE = h.prototype.writeUInt16LE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 2, 65535, 0), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    };
    h.prototype.writeUint16BE = h.prototype.writeUInt16BE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 2, 65535, 0), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    };
    h.prototype.writeUint32LE = h.prototype.writeUInt32LE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 4, 4294967295, 0), this[t + 3] = r >>> 24, this[t + 2] = r >>> 16, this[t + 1] = r >>> 8, this[t] = r & 255, t + 4;
    };
    h.prototype.writeUint32BE = h.prototype.writeUInt32BE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 4, 4294967295, 0), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    function pr(i, r, t, e, n) {
      wr(r, e, n, i, t, 7);
      let o = Number(r & BigInt(4294967295));
      i[t++] = o, o = o >> 8, i[t++] = o, o = o >> 8, i[t++] = o, o = o >> 8, i[t++] = o;
      let u = Number(r >> BigInt(32) & BigInt(4294967295));
      return i[t++] = u, u = u >> 8, i[t++] = u, u = u >> 8, i[t++] = u, u = u >> 8, i[t++] = u, t;
    }
    function sr(i, r, t, e, n) {
      wr(r, e, n, i, t, 7);
      let o = Number(r & BigInt(4294967295));
      i[t + 7] = o, o = o >> 8, i[t + 6] = o, o = o >> 8, i[t + 5] = o, o = o >> 8, i[t + 4] = o;
      let u = Number(r >> BigInt(32) & BigInt(4294967295));
      return i[t + 3] = u, u = u >> 8, i[t + 2] = u, u = u >> 8, i[t + 1] = u, u = u >> 8, i[t] = u, t + 8;
    }
    h.prototype.writeBigUInt64LE = I(function(r, t = 0) {
      return pr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    h.prototype.writeBigUInt64BE = I(function(r, t = 0) {
      return sr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    h.prototype.writeIntLE = function(r, t, e, n) {
      if (r = +r, t = t >>> 0, !n) {
        let c = Math.pow(2, 8 * e - 1);
        y(this, r, t, e, c - 1, -c);
      }
      let o = 0, u = 1, f = 0;
      for (this[t] = r & 255;++o < e && (u *= 256); )
        r < 0 && f === 0 && this[t + o - 1] !== 0 && (f = 1), this[t + o] = (r / u >> 0) - f & 255;
      return t + e;
    };
    h.prototype.writeIntBE = function(r, t, e, n) {
      if (r = +r, t = t >>> 0, !n) {
        let c = Math.pow(2, 8 * e - 1);
        y(this, r, t, e, c - 1, -c);
      }
      let o = e - 1, u = 1, f = 0;
      for (this[t + o] = r & 255;--o >= 0 && (u *= 256); )
        r < 0 && f === 0 && this[t + o + 1] !== 0 && (f = 1), this[t + o] = (r / u >> 0) - f & 255;
      return t + e;
    };
    h.prototype.writeInt8 = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[t] = r & 255, t + 1;
    };
    h.prototype.writeInt16LE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 2, 32767, -32768), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    };
    h.prototype.writeInt16BE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 2, 32767, -32768), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    };
    h.prototype.writeInt32LE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 4, 2147483647, -2147483648), this[t] = r & 255, this[t + 1] = r >>> 8, this[t + 2] = r >>> 16, this[t + 3] = r >>> 24, t + 4;
    };
    h.prototype.writeInt32BE = function(r, t, e) {
      return r = +r, t = t >>> 0, e || y(this, r, t, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    h.prototype.writeBigInt64LE = I(function(r, t = 0) {
      return pr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    h.prototype.writeBigInt64BE = I(function(r, t = 0) {
      return sr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function lr(i, r, t, e, n, o) {
      if (t + e > i.length)
        throw new RangeError("Index out of range");
      if (t < 0)
        throw new RangeError("Index out of range");
    }
    function ar(i, r, t, e, n) {
      return r = +r, t = t >>> 0, n || lr(i, r, t, 4, 340282346638528860000000000000000000000, -340282346638528860000000000000000000000), T.write(i, r, t, e, 23, 4), t + 4;
    }
    h.prototype.writeFloatLE = function(r, t, e) {
      return ar(this, r, t, true, e);
    };
    h.prototype.writeFloatBE = function(r, t, e) {
      return ar(this, r, t, false, e);
    };
    function yr(i, r, t, e, n) {
      return r = +r, t = t >>> 0, n || lr(i, r, t, 8, 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000), T.write(i, r, t, e, 52, 8), t + 8;
    }
    h.prototype.writeDoubleLE = function(r, t, e) {
      return yr(this, r, t, true, e);
    };
    h.prototype.writeDoubleBE = function(r, t, e) {
      return yr(this, r, t, false, e);
    };
    h.prototype.copy = function(r, t, e, n) {
      if (!h.isBuffer(r))
        throw new TypeError("argument should be a Buffer");
      if (e || (e = 0), !n && n !== 0 && (n = this.length), t >= r.length && (t = r.length), t || (t = 0), n > 0 && n < e && (n = e), n === e || r.length === 0 || this.length === 0)
        return 0;
      if (t < 0)
        throw new RangeError("targetStart out of bounds");
      if (e < 0 || e >= this.length)
        throw new RangeError("Index out of range");
      if (n < 0)
        throw new RangeError("sourceEnd out of bounds");
      n > this.length && (n = this.length), r.length - t < n - e && (n = r.length - t + e);
      let o = n - e;
      return this === r && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, e, n) : Uint8Array.prototype.set.call(r, this.subarray(e, n), t), o;
    };
    h.prototype.fill = function(r, t, e, n) {
      if (typeof r == "string") {
        if (typeof t == "string" ? (n = t, t = 0, e = this.length) : typeof e == "string" && (n = e, e = this.length), n !== undefined && typeof n != "string")
          throw new TypeError("encoding must be a string");
        if (typeof n == "string" && !h.isEncoding(n))
          throw new TypeError("Unknown encoding: " + n);
        if (r.length === 1) {
          let u = r.charCodeAt(0);
          (n === "utf8" && u < 128 || n === "latin1") && (r = u);
        }
      } else
        typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
      if (t < 0 || this.length < t || this.length < e)
        throw new RangeError("Out of range index");
      if (e <= t)
        return this;
      t = t >>> 0, e = e === undefined ? this.length : e >>> 0, r || (r = 0);
      let o;
      if (typeof r == "number")
        for (o = t;o < e; ++o)
          this[o] = r;
      else {
        let u = h.isBuffer(r) ? r : h.from(r, n), f = u.length;
        if (f === 0)
          throw new TypeError('The value "' + r + '" is invalid for argument "value"');
        for (o = 0;o < e - t; ++o)
          this[o + t] = u[o % f];
      }
      return this;
    };
    var R = {};
    function z(i, r, t) {
      R[i] = class extends t {
        constructor() {
          super(), Object.defineProperty(this, "message", { value: r.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${i}]`, this.stack, delete this.name;
        }
        get code() {
          return i;
        }
        set code(n) {
          Object.defineProperty(this, "code", { configurable: true, enumerable: true, value: n, writable: true });
        }
        toString() {
          return `${this.name} [${i}]: ${this.message}`;
        }
      };
    }
    z("ERR_BUFFER_OUT_OF_BOUNDS", function(i) {
      return i ? `${i} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    }, RangeError);
    z("ERR_INVALID_ARG_TYPE", function(i, r) {
      return `The "${i}" argument must be of type number. Received type ${typeof r}`;
    }, TypeError);
    z("ERR_OUT_OF_RANGE", function(i, r, t) {
      let e = `The value of "${i}" is out of range.`, n = t;
      return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? n = nr(String(t)) : typeof t == "bigint" && (n = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (n = nr(n)), n += "n"), e += ` It must be ${r}. Received ${n}`, e;
    }, RangeError);
    function nr(i) {
      let r = "", t = i.length, e = i[0] === "-" ? 1 : 0;
      for (;t >= e + 4; t -= 3)
        r = `_${i.slice(t - 3, t)}${r}`;
      return `${i.slice(0, t)}${r}`;
    }
    function Zr(i, r, t) {
      C(r, "offset"), (i[r] === undefined || i[r + t] === undefined) && S(r, i.length - (t + 1));
    }
    function wr(i, r, t, e, n, o) {
      if (i > t || i < r) {
        let u = typeof r == "bigint" ? "n" : "", f;
        throw o > 3 ? r === 0 || r === BigInt(0) ? f = `>= 0${u} and < 2${u} ** ${(o + 1) * 8}${u}` : f = `>= -(2${u} ** ${(o + 1) * 8 - 1}${u}) and < 2 ** ${(o + 1) * 8 - 1}${u}` : f = `>= ${r}${u} and <= ${t}${u}`, new R.ERR_OUT_OF_RANGE("value", f, i);
      }
      Zr(e, n, o);
    }
    function C(i, r) {
      if (typeof i != "number")
        throw new R.ERR_INVALID_ARG_TYPE(r, "number", i);
    }
    function S(i, r, t) {
      throw Math.floor(i) !== i ? (C(i, t), new R.ERR_OUT_OF_RANGE(t || "offset", "an integer", i)) : r < 0 ? new R.ERR_BUFFER_OUT_OF_BOUNDS : new R.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${r}`, i);
    }
    var Qr = /[^+/0-9A-Za-z-_]/g;
    function vr(i) {
      if (i = i.split("=")[0], i = i.trim().replace(Qr, ""), i.length < 2)
        return "";
      for (;i.length % 4 !== 0; )
        i = i + "=";
      return i;
    }
    function H(i, r) {
      r = r || 1 / 0;
      let t, e = i.length, n = null, o = [];
      for (let u = 0;u < e; ++u) {
        if (t = i.charCodeAt(u), t > 55295 && t < 57344) {
          if (!n) {
            if (t > 56319) {
              (r -= 3) > -1 && o.push(239, 191, 189);
              continue;
            } else if (u + 1 === e) {
              (r -= 3) > -1 && o.push(239, 191, 189);
              continue;
            }
            n = t;
            continue;
          }
          if (t < 56320) {
            (r -= 3) > -1 && o.push(239, 191, 189), n = t;
            continue;
          }
          t = (n - 55296 << 10 | t - 56320) + 65536;
        } else
          n && (r -= 3) > -1 && o.push(239, 191, 189);
        if (n = null, t < 128) {
          if ((r -= 1) < 0)
            break;
          o.push(t);
        } else if (t < 2048) {
          if ((r -= 2) < 0)
            break;
          o.push(t >> 6 | 192, t & 63 | 128);
        } else if (t < 65536) {
          if ((r -= 3) < 0)
            break;
          o.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
        } else if (t < 1114112) {
          if ((r -= 4) < 0)
            break;
          o.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
        } else
          throw new Error("Invalid code point");
      }
      return o;
    }
    function rt(i) {
      let r = [];
      for (let t = 0;t < i.length; ++t)
        r.push(i.charCodeAt(t) & 255);
      return r;
    }
    function tt(i, r) {
      let t, e, n, o = [];
      for (let u = 0;u < i.length && !((r -= 2) < 0); ++u)
        t = i.charCodeAt(u), e = t >> 8, n = t % 256, o.push(n), o.push(e);
      return o;
    }
    function xr(i) {
      return j.toByteArray(vr(i));
    }
    function M(i, r, t, e) {
      let n;
      for (n = 0;n < e && !(n + t >= r.length || n >= i.length); ++n)
        r[n + t] = i[n];
      return n;
    }
    function g(i, r) {
      return i instanceof r || i != null && i.constructor != null && i.constructor.name != null && i.constructor.name === r.name;
    }
    function J(i) {
      return i !== i;
    }
    var it = function() {
      let i = "0123456789abcdef", r = new Array(256);
      for (let t = 0;t < 16; ++t) {
        let e = t * 16;
        for (let n = 0;n < 16; ++n)
          r[e + n] = i[t] + i[n];
      }
      return r;
    }();
    function I(i) {
      return typeof BigInt > "u" ? et : i;
    }
    function et() {
      throw new Error("BigInt not supported");
    }
  });
  w = {};
  Ur(w, { Blob: () => nt, Buffer: () => Er.Buffer, File: () => ot, atob: () => ut, btoa: () => ht, constants: () => st, createObjectURL: () => ft, default: () => Br.Buffer, isAscii: () => ct, isUtf8: () => pt, kStringMaxLength: () => K, resolveObjectURL: () => lt, transcode: () => at });
  x(w, O(b()));
  Br = O(b());
  Er = O(b());
  K = 2 ** 32 - 1;
  ({ Blob: nt, File: ot, atob: ut, btoa: ht } = globalThis);
  ({ createObjectURL: ft } = URL);
  st = { __proto__: null, MAX_LENGTH: K, MAX_STRING_LENGTH: K, BYTES_PER_ELEMENT: 1 };
  export_Buffer = Er.Buffer;
  export_default = Br.Buffer;
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
});

// node_modules/dns-packet/types.js
var require_types = __commonJS((exports) => {
  exports.toString = function(type) {
    switch (type) {
      case 1:
        return "A";
      case 10:
        return "NULL";
      case 28:
        return "AAAA";
      case 18:
        return "AFSDB";
      case 42:
        return "APL";
      case 257:
        return "CAA";
      case 60:
        return "CDNSKEY";
      case 59:
        return "CDS";
      case 37:
        return "CERT";
      case 5:
        return "CNAME";
      case 49:
        return "DHCID";
      case 32769:
        return "DLV";
      case 39:
        return "DNAME";
      case 48:
        return "DNSKEY";
      case 43:
        return "DS";
      case 55:
        return "HIP";
      case 13:
        return "HINFO";
      case 45:
        return "IPSECKEY";
      case 25:
        return "KEY";
      case 36:
        return "KX";
      case 29:
        return "LOC";
      case 15:
        return "MX";
      case 35:
        return "NAPTR";
      case 2:
        return "NS";
      case 47:
        return "NSEC";
      case 50:
        return "NSEC3";
      case 51:
        return "NSEC3PARAM";
      case 12:
        return "PTR";
      case 46:
        return "RRSIG";
      case 17:
        return "RP";
      case 24:
        return "SIG";
      case 6:
        return "SOA";
      case 99:
        return "SPF";
      case 33:
        return "SRV";
      case 44:
        return "SSHFP";
      case 32768:
        return "TA";
      case 249:
        return "TKEY";
      case 52:
        return "TLSA";
      case 250:
        return "TSIG";
      case 16:
        return "TXT";
      case 252:
        return "AXFR";
      case 251:
        return "IXFR";
      case 41:
        return "OPT";
      case 255:
        return "ANY";
    }
    return "UNKNOWN_" + type;
  };
  exports.toType = function(name) {
    switch (name.toUpperCase()) {
      case "A":
        return 1;
      case "NULL":
        return 10;
      case "AAAA":
        return 28;
      case "AFSDB":
        return 18;
      case "APL":
        return 42;
      case "CAA":
        return 257;
      case "CDNSKEY":
        return 60;
      case "CDS":
        return 59;
      case "CERT":
        return 37;
      case "CNAME":
        return 5;
      case "DHCID":
        return 49;
      case "DLV":
        return 32769;
      case "DNAME":
        return 39;
      case "DNSKEY":
        return 48;
      case "DS":
        return 43;
      case "HIP":
        return 55;
      case "HINFO":
        return 13;
      case "IPSECKEY":
        return 45;
      case "KEY":
        return 25;
      case "KX":
        return 36;
      case "LOC":
        return 29;
      case "MX":
        return 15;
      case "NAPTR":
        return 35;
      case "NS":
        return 2;
      case "NSEC":
        return 47;
      case "NSEC3":
        return 50;
      case "NSEC3PARAM":
        return 51;
      case "PTR":
        return 12;
      case "RRSIG":
        return 46;
      case "RP":
        return 17;
      case "SIG":
        return 24;
      case "SOA":
        return 6;
      case "SPF":
        return 99;
      case "SRV":
        return 33;
      case "SSHFP":
        return 44;
      case "TA":
        return 32768;
      case "TKEY":
        return 249;
      case "TLSA":
        return 52;
      case "TSIG":
        return 250;
      case "TXT":
        return 16;
      case "AXFR":
        return 252;
      case "IXFR":
        return 251;
      case "OPT":
        return 41;
      case "ANY":
        return 255;
      case "*":
        return 255;
    }
    if (name.toUpperCase().startsWith("UNKNOWN_"))
      return parseInt(name.slice(8));
    return 0;
  };
});

// node_modules/dns-packet/rcodes.js
var require_rcodes = __commonJS((exports) => {
  exports.toString = function(rcode) {
    switch (rcode) {
      case 0:
        return "NOERROR";
      case 1:
        return "FORMERR";
      case 2:
        return "SERVFAIL";
      case 3:
        return "NXDOMAIN";
      case 4:
        return "NOTIMP";
      case 5:
        return "REFUSED";
      case 6:
        return "YXDOMAIN";
      case 7:
        return "YXRRSET";
      case 8:
        return "NXRRSET";
      case 9:
        return "NOTAUTH";
      case 10:
        return "NOTZONE";
      case 11:
        return "RCODE_11";
      case 12:
        return "RCODE_12";
      case 13:
        return "RCODE_13";
      case 14:
        return "RCODE_14";
      case 15:
        return "RCODE_15";
    }
    return "RCODE_" + rcode;
  };
  exports.toRcode = function(code) {
    switch (code.toUpperCase()) {
      case "NOERROR":
        return 0;
      case "FORMERR":
        return 1;
      case "SERVFAIL":
        return 2;
      case "NXDOMAIN":
        return 3;
      case "NOTIMP":
        return 4;
      case "REFUSED":
        return 5;
      case "YXDOMAIN":
        return 6;
      case "YXRRSET":
        return 7;
      case "NXRRSET":
        return 8;
      case "NOTAUTH":
        return 9;
      case "NOTZONE":
        return 10;
      case "RCODE_11":
        return 11;
      case "RCODE_12":
        return 12;
      case "RCODE_13":
        return 13;
      case "RCODE_14":
        return 14;
      case "RCODE_15":
        return 15;
    }
    return 0;
  };
});

// node_modules/dns-packet/opcodes.js
var require_opcodes = __commonJS((exports) => {
  exports.toString = function(opcode) {
    switch (opcode) {
      case 0:
        return "QUERY";
      case 1:
        return "IQUERY";
      case 2:
        return "STATUS";
      case 3:
        return "OPCODE_3";
      case 4:
        return "NOTIFY";
      case 5:
        return "UPDATE";
      case 6:
        return "OPCODE_6";
      case 7:
        return "OPCODE_7";
      case 8:
        return "OPCODE_8";
      case 9:
        return "OPCODE_9";
      case 10:
        return "OPCODE_10";
      case 11:
        return "OPCODE_11";
      case 12:
        return "OPCODE_12";
      case 13:
        return "OPCODE_13";
      case 14:
        return "OPCODE_14";
      case 15:
        return "OPCODE_15";
    }
    return "OPCODE_" + opcode;
  };
  exports.toOpcode = function(code) {
    switch (code.toUpperCase()) {
      case "QUERY":
        return 0;
      case "IQUERY":
        return 1;
      case "STATUS":
        return 2;
      case "OPCODE_3":
        return 3;
      case "NOTIFY":
        return 4;
      case "UPDATE":
        return 5;
      case "OPCODE_6":
        return 6;
      case "OPCODE_7":
        return 7;
      case "OPCODE_8":
        return 8;
      case "OPCODE_9":
        return 9;
      case "OPCODE_10":
        return 10;
      case "OPCODE_11":
        return 11;
      case "OPCODE_12":
        return 12;
      case "OPCODE_13":
        return 13;
      case "OPCODE_14":
        return 14;
      case "OPCODE_15":
        return 15;
    }
    return 0;
  };
});

// node_modules/dns-packet/classes.js
var require_classes = __commonJS((exports) => {
  exports.toString = function(klass) {
    switch (klass) {
      case 1:
        return "IN";
      case 2:
        return "CS";
      case 3:
        return "CH";
      case 4:
        return "HS";
      case 255:
        return "ANY";
    }
    return "UNKNOWN_" + klass;
  };
  exports.toClass = function(name) {
    switch (name.toUpperCase()) {
      case "IN":
        return 1;
      case "CS":
        return 2;
      case "CH":
        return 3;
      case "HS":
        return 4;
      case "ANY":
        return 255;
    }
    return 0;
  };
});

// node_modules/dns-packet/optioncodes.js
var require_optioncodes = __commonJS((exports) => {
  exports.toString = function(type) {
    switch (type) {
      case 1:
        return "LLQ";
      case 2:
        return "UL";
      case 3:
        return "NSID";
      case 5:
        return "DAU";
      case 6:
        return "DHU";
      case 7:
        return "N3U";
      case 8:
        return "CLIENT_SUBNET";
      case 9:
        return "EXPIRE";
      case 10:
        return "COOKIE";
      case 11:
        return "TCP_KEEPALIVE";
      case 12:
        return "PADDING";
      case 13:
        return "CHAIN";
      case 14:
        return "KEY_TAG";
      case 26946:
        return "DEVICEID";
    }
    if (type < 0) {
      return null;
    }
    return `OPTION_${type}`;
  };
  exports.toCode = function(name) {
    if (typeof name === "number") {
      return name;
    }
    if (!name) {
      return -1;
    }
    switch (name.toUpperCase()) {
      case "OPTION_0":
        return 0;
      case "LLQ":
        return 1;
      case "UL":
        return 2;
      case "NSID":
        return 3;
      case "OPTION_4":
        return 4;
      case "DAU":
        return 5;
      case "DHU":
        return 6;
      case "N3U":
        return 7;
      case "CLIENT_SUBNET":
        return 8;
      case "EXPIRE":
        return 9;
      case "COOKIE":
        return 10;
      case "TCP_KEEPALIVE":
        return 11;
      case "PADDING":
        return 12;
      case "CHAIN":
        return 13;
      case "KEY_TAG":
        return 14;
      case "DEVICEID":
        return 26946;
      case "OPTION_65535":
        return 65535;
    }
    const m = name.match(/_(\d+)$/);
    if (m) {
      return parseInt(m[1], 10);
    }
    return -1;
  };
});

// node_modules/@leichtgewicht/ip-codec/index.cjs
var require_ip_codec = __commonJS((exports, module) => {
  var ipCodec = function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.decode = decode;
    exports2.encode = encode;
    exports2.familyOf = familyOf;
    exports2.name = undefined;
    exports2.sizeOf = sizeOf;
    exports2.v6 = exports2.v4 = undefined;
    const v4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
    const v4Size = 4;
    const v6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
    const v6Size = 16;
    const v4 = {
      name: "v4",
      size: v4Size,
      isFormat: (ip) => v4Regex.test(ip),
      encode(ip, buff, offset) {
        offset = ~~offset;
        buff = buff || new Uint8Array(offset + v4Size);
        const max = ip.length;
        let n = 0;
        for (let i = 0;i < max; ) {
          const c = ip.charCodeAt(i++);
          if (c === 46) {
            buff[offset++] = n;
            n = 0;
          } else {
            n = n * 10 + (c - 48);
          }
        }
        buff[offset] = n;
        return buff;
      },
      decode(buff, offset) {
        offset = ~~offset;
        return `${buff[offset++]}.${buff[offset++]}.${buff[offset++]}.${buff[offset]}`;
      }
    };
    exports2.v4 = v4;
    const v6 = {
      name: "v6",
      size: v6Size,
      isFormat: (ip) => ip.length > 0 && v6Regex.test(ip),
      encode(ip, buff, offset) {
        offset = ~~offset;
        let end = offset + v6Size;
        let fill = -1;
        let hexN = 0;
        let decN = 0;
        let prevColon = true;
        let useDec = false;
        buff = buff || new Uint8Array(offset + v6Size);
        for (let i = 0;i < ip.length; i++) {
          let c = ip.charCodeAt(i);
          if (c === 58) {
            if (prevColon) {
              if (fill !== -1) {
                if (offset < end)
                  buff[offset] = 0;
                if (offset < end - 1)
                  buff[offset + 1] = 0;
                offset += 2;
              } else if (offset < end) {
                fill = offset;
              }
            } else {
              if (useDec === true) {
                if (offset < end)
                  buff[offset] = decN;
                offset++;
              } else {
                if (offset < end)
                  buff[offset] = hexN >> 8;
                if (offset < end - 1)
                  buff[offset + 1] = hexN & 255;
                offset += 2;
              }
              hexN = 0;
              decN = 0;
            }
            prevColon = true;
            useDec = false;
          } else if (c === 46) {
            if (offset < end)
              buff[offset] = decN;
            offset++;
            decN = 0;
            hexN = 0;
            prevColon = false;
            useDec = true;
          } else {
            prevColon = false;
            if (c >= 97) {
              c -= 87;
            } else if (c >= 65) {
              c -= 55;
            } else {
              c -= 48;
              decN = decN * 10 + c;
            }
            hexN = (hexN << 4) + c;
          }
        }
        if (prevColon === false) {
          if (useDec === true) {
            if (offset < end)
              buff[offset] = decN;
            offset++;
          } else {
            if (offset < end)
              buff[offset] = hexN >> 8;
            if (offset < end - 1)
              buff[offset + 1] = hexN & 255;
            offset += 2;
          }
        } else if (fill === 0) {
          if (offset < end)
            buff[offset] = 0;
          if (offset < end - 1)
            buff[offset + 1] = 0;
          offset += 2;
        } else if (fill !== -1) {
          offset += 2;
          for (let i = Math.min(offset - 1, end - 1);i >= fill + 2; i--) {
            buff[i] = buff[i - 2];
          }
          buff[fill] = 0;
          buff[fill + 1] = 0;
          fill = offset;
        }
        if (fill !== offset && fill !== -1) {
          if (offset > end - 2) {
            offset = end - 2;
          }
          while (end > fill) {
            buff[--end] = offset < end && offset > fill ? buff[--offset] : 0;
          }
        } else {
          while (offset < end) {
            buff[offset++] = 0;
          }
        }
        return buff;
      },
      decode(buff, offset) {
        offset = ~~offset;
        let result = "";
        for (let i = 0;i < v6Size; i += 2) {
          if (i !== 0) {
            result += ":";
          }
          result += (buff[offset + i] << 8 | buff[offset + i + 1]).toString(16);
        }
        return result.replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3").replace(/:{3,4}/, "::");
      }
    };
    exports2.v6 = v6;
    const name = "ip";
    exports2.name = name;
    function sizeOf(ip) {
      if (v4.isFormat(ip))
        return v4.size;
      if (v6.isFormat(ip))
        return v6.size;
      throw Error(`Invalid ip address: ${ip}`);
    }
    function familyOf(string) {
      return sizeOf(string) === v4.size ? 1 : 2;
    }
    function encode(ip, buff, offset) {
      offset = ~~offset;
      const size = sizeOf(ip);
      if (typeof buff === "function") {
        buff = buff(offset + size);
      }
      if (size === v4.size) {
        return v4.encode(ip, buff, offset);
      }
      return v6.encode(ip, buff, offset);
    }
    function decode(buff, offset, length) {
      offset = ~~offset;
      length = length || buff.length - offset;
      if (length === v4.size) {
        return v4.decode(buff, offset, length);
      }
      if (length === v6.size) {
        return v6.decode(buff, offset, length);
      }
      throw Error(`Invalid buffer size needs to be ${v4.size} for v4 or ${v6.size} for v6.`);
    }
    return "default" in exports2 ? exports2.default : exports2;
  }({});
  if (typeof define === "function" && define.amd)
    define([], function() {
      return ipCodec;
    });
  else if (typeof module === "object" && typeof exports === "object")
    module.exports = ipCodec;
});

// node_modules/dns-packet/index.js
var require_dns_packet = __commonJS((exports) => {
  var Buffer = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
  var types = require_types();
  var rcodes = require_rcodes();
  var opcodes = require_opcodes();
  var classes = require_classes();
  var optioncodes = require_optioncodes();
  var ip = require_ip_codec();
  var QUERY_FLAG = 0;
  var RESPONSE_FLAG = 1 << 15;
  var FLUSH_MASK = 1 << 15;
  var NOT_FLUSH_MASK = ~FLUSH_MASK;
  var QU_MASK = 1 << 15;
  var NOT_QU_MASK = ~QU_MASK;
  var name = exports.name = {};
  name.encode = function(str, buf, offset, { mail = false } = {}) {
    if (!buf)
      buf = Buffer.alloc(name.encodingLength(str));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const n = str.replace(/^\.|\.$/gm, "");
    if (n.length) {
      let list = [];
      if (mail) {
        let localPart = "";
        n.split(".").forEach((label) => {
          if (label.endsWith("\\")) {
            localPart += (localPart.length ? "." : "") + label.slice(0, -1);
          } else {
            if (list.length === 0 && localPart.length) {
              list.push(localPart + "." + label);
            } else {
              list.push(label);
            }
          }
        });
      } else {
        list = n.split(".");
      }
      for (let i = 0;i < list.length; i++) {
        const len = buf.write(list[i], offset + 1);
        buf[offset] = len;
        offset += len + 1;
      }
    }
    buf[offset++] = 0;
    name.encode.bytes = offset - oldOffset;
    return buf;
  };
  name.encode.bytes = 0;
  name.decode = function(buf, offset, { mail = false } = {}) {
    if (!offset)
      offset = 0;
    const list = [];
    let oldOffset = offset;
    let totalLength = 0;
    let consumedBytes = 0;
    let jumped = false;
    while (true) {
      if (offset >= buf.length) {
        throw new Error("Cannot decode name (buffer overflow)");
      }
      const len = buf[offset++];
      consumedBytes += jumped ? 0 : 1;
      if (len === 0) {
        break;
      } else if ((len & 192) === 0) {
        if (offset + len > buf.length) {
          throw new Error("Cannot decode name (buffer overflow)");
        }
        totalLength += len + 1;
        if (totalLength > 254) {
          throw new Error("Cannot decode name (name too long)");
        }
        let label = buf.toString("utf-8", offset, offset + len);
        if (mail) {
          label = label.replace(/\./g, "\\.");
        }
        list.push(label);
        offset += len;
        consumedBytes += jumped ? 0 : len;
      } else if ((len & 192) === 192) {
        if (offset + 1 > buf.length) {
          throw new Error("Cannot decode name (buffer overflow)");
        }
        const jumpOffset = buf.readUInt16BE(offset - 1) - 49152;
        if (jumpOffset >= oldOffset) {
          throw new Error("Cannot decode name (bad pointer)");
        }
        offset = jumpOffset;
        oldOffset = jumpOffset;
        consumedBytes += jumped ? 0 : 1;
        jumped = true;
      } else {
        throw new Error("Cannot decode name (bad label)");
      }
    }
    name.decode.bytes = consumedBytes;
    return list.length === 0 ? "." : list.join(".");
  };
  name.decode.bytes = 0;
  name.encodingLength = function(n) {
    if (n === "." || n === "..")
      return 1;
    return Buffer.byteLength(n.replace(/^\.|\.$/gm, "")) + 2;
  };
  var string = {};
  string.encode = function(s, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(string.encodingLength(s));
    if (!offset)
      offset = 0;
    const len = buf.write(s, offset + 1);
    buf[offset] = len;
    string.encode.bytes = len + 1;
    return buf;
  };
  string.encode.bytes = 0;
  string.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const len = buf[offset];
    const s = buf.toString("utf-8", offset + 1, offset + 1 + len);
    string.decode.bytes = len + 1;
    return s;
  };
  string.decode.bytes = 0;
  string.encodingLength = function(s) {
    return Buffer.byteLength(s) + 1;
  };
  var header = {};
  header.encode = function(h, buf, offset) {
    if (!buf)
      buf = header.encodingLength(h);
    if (!offset)
      offset = 0;
    const flags = (h.flags || 0) & 32767;
    const type = h.type === "response" ? RESPONSE_FLAG : QUERY_FLAG;
    buf.writeUInt16BE(h.id || 0, offset);
    buf.writeUInt16BE(flags | type, offset + 2);
    buf.writeUInt16BE(h.questions.length, offset + 4);
    buf.writeUInt16BE(h.answers.length, offset + 6);
    buf.writeUInt16BE(h.authorities.length, offset + 8);
    buf.writeUInt16BE(h.additionals.length, offset + 10);
    return buf;
  };
  header.encode.bytes = 12;
  header.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    if (buf.length < 12)
      throw new Error("Header must be 12 bytes");
    const flags = buf.readUInt16BE(offset + 2);
    return {
      id: buf.readUInt16BE(offset),
      type: flags & RESPONSE_FLAG ? "response" : "query",
      flags: flags & 32767,
      flag_qr: (flags >> 15 & 1) === 1,
      opcode: opcodes.toString(flags >> 11 & 15),
      flag_aa: (flags >> 10 & 1) === 1,
      flag_tc: (flags >> 9 & 1) === 1,
      flag_rd: (flags >> 8 & 1) === 1,
      flag_ra: (flags >> 7 & 1) === 1,
      flag_z: (flags >> 6 & 1) === 1,
      flag_ad: (flags >> 5 & 1) === 1,
      flag_cd: (flags >> 4 & 1) === 1,
      rcode: rcodes.toString(flags & 15),
      questions: new Array(buf.readUInt16BE(offset + 4)),
      answers: new Array(buf.readUInt16BE(offset + 6)),
      authorities: new Array(buf.readUInt16BE(offset + 8)),
      additionals: new Array(buf.readUInt16BE(offset + 10))
    };
  };
  header.decode.bytes = 12;
  header.encodingLength = function() {
    return 12;
  };
  var runknown = exports.unknown = {};
  runknown.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(runknown.encodingLength(data));
    if (!offset)
      offset = 0;
    buf.writeUInt16BE(data.length, offset);
    data.copy(buf, offset + 2);
    runknown.encode.bytes = data.length + 2;
    return buf;
  };
  runknown.encode.bytes = 0;
  runknown.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const len = buf.readUInt16BE(offset);
    const data = buf.slice(offset + 2, offset + 2 + len);
    runknown.decode.bytes = len + 2;
    return data;
  };
  runknown.decode.bytes = 0;
  runknown.encodingLength = function(data) {
    return data.length + 2;
  };
  var rns = exports.ns = {};
  rns.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rns.encodingLength(data));
    if (!offset)
      offset = 0;
    name.encode(data, buf, offset + 2);
    buf.writeUInt16BE(name.encode.bytes, offset);
    rns.encode.bytes = name.encode.bytes + 2;
    return buf;
  };
  rns.encode.bytes = 0;
  rns.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const len = buf.readUInt16BE(offset);
    const dd = name.decode(buf, offset + 2);
    rns.decode.bytes = len + 2;
    return dd;
  };
  rns.decode.bytes = 0;
  rns.encodingLength = function(data) {
    return name.encodingLength(data) + 2;
  };
  var rsoa = exports.soa = {};
  rsoa.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rsoa.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    name.encode(data.mname, buf, offset);
    offset += name.encode.bytes;
    name.encode(data.rname, buf, offset, { mail: true });
    offset += name.encode.bytes;
    buf.writeUInt32BE(data.serial || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.refresh || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.retry || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.expire || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.minimum || 0, offset);
    offset += 4;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rsoa.encode.bytes = offset - oldOffset;
    return buf;
  };
  rsoa.encode.bytes = 0;
  rsoa.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.mname = name.decode(buf, offset);
    offset += name.decode.bytes;
    data.rname = name.decode(buf, offset, { mail: true });
    offset += name.decode.bytes;
    data.serial = buf.readUInt32BE(offset);
    offset += 4;
    data.refresh = buf.readUInt32BE(offset);
    offset += 4;
    data.retry = buf.readUInt32BE(offset);
    offset += 4;
    data.expire = buf.readUInt32BE(offset);
    offset += 4;
    data.minimum = buf.readUInt32BE(offset);
    offset += 4;
    rsoa.decode.bytes = offset - oldOffset;
    return data;
  };
  rsoa.decode.bytes = 0;
  rsoa.encodingLength = function(data) {
    return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname);
  };
  var rtxt = exports.txt = {};
  rtxt.encode = function(data, buf, offset) {
    if (!Array.isArray(data))
      data = [data];
    for (let i = 0;i < data.length; i++) {
      if (typeof data[i] === "string") {
        data[i] = Buffer.from(data[i]);
      }
      if (!Buffer.isBuffer(data[i])) {
        throw new Error("Must be a Buffer");
      }
    }
    if (!buf)
      buf = Buffer.alloc(rtxt.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    data.forEach(function(d) {
      buf[offset++] = d.length;
      d.copy(buf, offset, 0, d.length);
      offset += d.length;
    });
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rtxt.encode.bytes = offset - oldOffset;
    return buf;
  };
  rtxt.encode.bytes = 0;
  rtxt.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    let remaining = buf.readUInt16BE(offset);
    offset += 2;
    let data = [];
    while (remaining > 0) {
      const len = buf[offset++];
      --remaining;
      if (remaining < len) {
        throw new Error("Buffer overflow");
      }
      data.push(buf.slice(offset, offset + len));
      offset += len;
      remaining -= len;
    }
    rtxt.decode.bytes = offset - oldOffset;
    return data;
  };
  rtxt.decode.bytes = 0;
  rtxt.encodingLength = function(data) {
    if (!Array.isArray(data))
      data = [data];
    let length = 2;
    data.forEach(function(buf) {
      if (typeof buf === "string") {
        length += Buffer.byteLength(buf) + 1;
      } else {
        length += buf.length + 1;
      }
    });
    return length;
  };
  var rnull = exports.null = {};
  rnull.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rnull.encodingLength(data));
    if (!offset)
      offset = 0;
    if (typeof data === "string")
      data = Buffer.from(data);
    if (!data)
      data = Buffer.alloc(0);
    const oldOffset = offset;
    offset += 2;
    const len = data.length;
    data.copy(buf, offset, 0, len);
    offset += len;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rnull.encode.bytes = offset - oldOffset;
    return buf;
  };
  rnull.encode.bytes = 0;
  rnull.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const len = buf.readUInt16BE(offset);
    offset += 2;
    const data = buf.slice(offset, offset + len);
    offset += len;
    rnull.decode.bytes = offset - oldOffset;
    return data;
  };
  rnull.decode.bytes = 0;
  rnull.encodingLength = function(data) {
    if (!data)
      return 2;
    return (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) + 2;
  };
  var rhinfo = exports.hinfo = {};
  rhinfo.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rhinfo.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    string.encode(data.cpu, buf, offset);
    offset += string.encode.bytes;
    string.encode(data.os, buf, offset);
    offset += string.encode.bytes;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rhinfo.encode.bytes = offset - oldOffset;
    return buf;
  };
  rhinfo.encode.bytes = 0;
  rhinfo.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.cpu = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.os = string.decode(buf, offset);
    offset += string.decode.bytes;
    rhinfo.decode.bytes = offset - oldOffset;
    return data;
  };
  rhinfo.decode.bytes = 0;
  rhinfo.encodingLength = function(data) {
    return string.encodingLength(data.cpu) + string.encodingLength(data.os) + 2;
  };
  var rptr = exports.ptr = {};
  var rcname = exports.cname = rptr;
  var rdname = exports.dname = rptr;
  rptr.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rptr.encodingLength(data));
    if (!offset)
      offset = 0;
    name.encode(data, buf, offset + 2);
    buf.writeUInt16BE(name.encode.bytes, offset);
    rptr.encode.bytes = name.encode.bytes + 2;
    return buf;
  };
  rptr.encode.bytes = 0;
  rptr.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const data = name.decode(buf, offset + 2);
    rptr.decode.bytes = name.decode.bytes + 2;
    return data;
  };
  rptr.decode.bytes = 0;
  rptr.encodingLength = function(data) {
    return name.encodingLength(data) + 2;
  };
  var rsrv = exports.srv = {};
  rsrv.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rsrv.encodingLength(data));
    if (!offset)
      offset = 0;
    buf.writeUInt16BE(data.priority || 0, offset + 2);
    buf.writeUInt16BE(data.weight || 0, offset + 4);
    buf.writeUInt16BE(data.port || 0, offset + 6);
    name.encode(data.target, buf, offset + 8);
    const len = name.encode.bytes + 6;
    buf.writeUInt16BE(len, offset);
    rsrv.encode.bytes = len + 2;
    return buf;
  };
  rsrv.encode.bytes = 0;
  rsrv.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const len = buf.readUInt16BE(offset);
    const data = {};
    data.priority = buf.readUInt16BE(offset + 2);
    data.weight = buf.readUInt16BE(offset + 4);
    data.port = buf.readUInt16BE(offset + 6);
    data.target = name.decode(buf, offset + 8);
    rsrv.decode.bytes = len + 2;
    return data;
  };
  rsrv.decode.bytes = 0;
  rsrv.encodingLength = function(data) {
    return 8 + name.encodingLength(data.target);
  };
  var rcaa = exports.caa = {};
  rcaa.ISSUER_CRITICAL = 1 << 7;
  rcaa.encode = function(data, buf, offset) {
    const len = rcaa.encodingLength(data);
    if (!buf)
      buf = Buffer.alloc(rcaa.encodingLength(data));
    if (!offset)
      offset = 0;
    if (data.issuerCritical) {
      data.flags = rcaa.ISSUER_CRITICAL;
    }
    buf.writeUInt16BE(len - 2, offset);
    offset += 2;
    buf.writeUInt8(data.flags || 0, offset);
    offset += 1;
    string.encode(data.tag, buf, offset);
    offset += string.encode.bytes;
    buf.write(data.value, offset);
    offset += Buffer.byteLength(data.value);
    rcaa.encode.bytes = len;
    return buf;
  };
  rcaa.encode.bytes = 0;
  rcaa.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const len = buf.readUInt16BE(offset);
    offset += 2;
    const oldOffset = offset;
    const data = {};
    data.flags = buf.readUInt8(offset);
    offset += 1;
    data.tag = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.value = buf.toString("utf-8", offset, oldOffset + len);
    data.issuerCritical = !!(data.flags & rcaa.ISSUER_CRITICAL);
    rcaa.decode.bytes = len + 2;
    return data;
  };
  rcaa.decode.bytes = 0;
  rcaa.encodingLength = function(data) {
    return string.encodingLength(data.tag) + string.encodingLength(data.value) + 2;
  };
  var rmx = exports.mx = {};
  rmx.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rmx.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    buf.writeUInt16BE(data.preference || 0, offset);
    offset += 2;
    name.encode(data.exchange, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rmx.encode.bytes = offset - oldOffset;
    return buf;
  };
  rmx.encode.bytes = 0;
  rmx.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.preference = buf.readUInt16BE(offset);
    offset += 2;
    data.exchange = name.decode(buf, offset);
    offset += name.decode.bytes;
    rmx.decode.bytes = offset - oldOffset;
    return data;
  };
  rmx.encodingLength = function(data) {
    return 4 + name.encodingLength(data.exchange);
  };
  var ra = exports.a = {};
  ra.encode = function(host, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(ra.encodingLength(host));
    if (!offset)
      offset = 0;
    buf.writeUInt16BE(4, offset);
    offset += 2;
    ip.v4.encode(host, buf, offset);
    ra.encode.bytes = 6;
    return buf;
  };
  ra.encode.bytes = 0;
  ra.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    offset += 2;
    const host = ip.v4.decode(buf, offset);
    ra.decode.bytes = 6;
    return host;
  };
  ra.decode.bytes = 0;
  ra.encodingLength = function() {
    return 6;
  };
  var raaaa = exports.aaaa = {};
  raaaa.encode = function(host, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(raaaa.encodingLength(host));
    if (!offset)
      offset = 0;
    buf.writeUInt16BE(16, offset);
    offset += 2;
    ip.v6.encode(host, buf, offset);
    raaaa.encode.bytes = 18;
    return buf;
  };
  raaaa.encode.bytes = 0;
  raaaa.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    offset += 2;
    const host = ip.v6.decode(buf, offset);
    raaaa.decode.bytes = 18;
    return host;
  };
  raaaa.decode.bytes = 0;
  raaaa.encodingLength = function() {
    return 18;
  };
  var roption = exports.option = {};
  roption.encode = function(option, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(roption.encodingLength(option));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const code = optioncodes.toCode(option.code);
    buf.writeUInt16BE(code, offset);
    offset += 2;
    if (option.data) {
      buf.writeUInt16BE(option.data.length, offset);
      offset += 2;
      option.data.copy(buf, offset);
      offset += option.data.length;
    } else {
      switch (code) {
        case 8:
          const spl = option.sourcePrefixLength || 0;
          const fam = option.family || ip.familyOf(option.ip);
          const ipBuf = ip.encode(option.ip, Buffer.alloc);
          const ipLen = Math.ceil(spl / 8);
          buf.writeUInt16BE(ipLen + 4, offset);
          offset += 2;
          buf.writeUInt16BE(fam, offset);
          offset += 2;
          buf.writeUInt8(spl, offset++);
          buf.writeUInt8(option.scopePrefixLength || 0, offset++);
          ipBuf.copy(buf, offset, 0, ipLen);
          offset += ipLen;
          break;
        case 11:
          if (option.timeout) {
            buf.writeUInt16BE(2, offset);
            offset += 2;
            buf.writeUInt16BE(option.timeout, offset);
            offset += 2;
          } else {
            buf.writeUInt16BE(0, offset);
            offset += 2;
          }
          break;
        case 12:
          const len = option.length || 0;
          buf.writeUInt16BE(len, offset);
          offset += 2;
          buf.fill(0, offset, offset + len);
          offset += len;
          break;
        case 14:
          const tagsLen = option.tags.length * 2;
          buf.writeUInt16BE(tagsLen, offset);
          offset += 2;
          for (const tag of option.tags) {
            buf.writeUInt16BE(tag, offset);
            offset += 2;
          }
          break;
        default:
          throw new Error(`Unknown roption code: ${option.code}`);
      }
    }
    roption.encode.bytes = offset - oldOffset;
    return buf;
  };
  roption.encode.bytes = 0;
  roption.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const option = {};
    option.code = buf.readUInt16BE(offset);
    option.type = optioncodes.toString(option.code);
    offset += 2;
    const len = buf.readUInt16BE(offset);
    offset += 2;
    option.data = buf.slice(offset, offset + len);
    switch (option.code) {
      case 8:
        option.family = buf.readUInt16BE(offset);
        offset += 2;
        option.sourcePrefixLength = buf.readUInt8(offset++);
        option.scopePrefixLength = buf.readUInt8(offset++);
        const padded = Buffer.alloc(option.family === 1 ? 4 : 16);
        buf.copy(padded, 0, offset, offset + len - 4);
        option.ip = ip.decode(padded);
        break;
      case 11:
        if (len > 0) {
          option.timeout = buf.readUInt16BE(offset);
          offset += 2;
        }
        break;
      case 14:
        option.tags = [];
        for (let i = 0;i < len; i += 2) {
          option.tags.push(buf.readUInt16BE(offset));
          offset += 2;
        }
    }
    roption.decode.bytes = len + 4;
    return option;
  };
  roption.decode.bytes = 0;
  roption.encodingLength = function(option) {
    if (option.data) {
      return option.data.length + 4;
    }
    const code = optioncodes.toCode(option.code);
    switch (code) {
      case 8:
        const spl = option.sourcePrefixLength || 0;
        return Math.ceil(spl / 8) + 8;
      case 11:
        return typeof option.timeout === "number" ? 6 : 4;
      case 12:
        return option.length + 4;
      case 14:
        return 4 + option.tags.length * 2;
    }
    throw new Error(`Unknown roption code: ${option.code}`);
  };
  var ropt = exports.opt = {};
  ropt.encode = function(options, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(ropt.encodingLength(options));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const rdlen = encodingLengthList(options, roption);
    buf.writeUInt16BE(rdlen, offset);
    offset = encodeList(options, roption, buf, offset + 2);
    ropt.encode.bytes = offset - oldOffset;
    return buf;
  };
  ropt.encode.bytes = 0;
  ropt.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const options = [];
    let rdlen = buf.readUInt16BE(offset);
    offset += 2;
    let o = 0;
    while (rdlen > 0) {
      options[o++] = roption.decode(buf, offset);
      offset += roption.decode.bytes;
      rdlen -= roption.decode.bytes;
    }
    ropt.decode.bytes = offset - oldOffset;
    return options;
  };
  ropt.decode.bytes = 0;
  ropt.encodingLength = function(options) {
    return 2 + encodingLengthList(options || [], roption);
  };
  var rdnskey = exports.dnskey = {};
  rdnskey.PROTOCOL_DNSSEC = 3;
  rdnskey.ZONE_KEY = 128;
  rdnskey.SECURE_ENTRYPOINT = 32768;
  rdnskey.encode = function(key, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rdnskey.encodingLength(key));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const keydata = key.key;
    if (!Buffer.isBuffer(keydata)) {
      throw new Error("Key must be a Buffer");
    }
    offset += 2;
    buf.writeUInt16BE(key.flags, offset);
    offset += 2;
    buf.writeUInt8(rdnskey.PROTOCOL_DNSSEC, offset);
    offset += 1;
    buf.writeUInt8(key.algorithm, offset);
    offset += 1;
    keydata.copy(buf, offset, 0, keydata.length);
    offset += keydata.length;
    rdnskey.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rdnskey.encode.bytes - 2, oldOffset);
    return buf;
  };
  rdnskey.encode.bytes = 0;
  rdnskey.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var key = {};
    var length = buf.readUInt16BE(offset);
    offset += 2;
    key.flags = buf.readUInt16BE(offset);
    offset += 2;
    if (buf.readUInt8(offset) !== rdnskey.PROTOCOL_DNSSEC) {
      throw new Error("Protocol must be 3");
    }
    offset += 1;
    key.algorithm = buf.readUInt8(offset);
    offset += 1;
    key.key = buf.slice(offset, oldOffset + length + 2);
    offset += key.key.length;
    rdnskey.decode.bytes = offset - oldOffset;
    return key;
  };
  rdnskey.decode.bytes = 0;
  rdnskey.encodingLength = function(key) {
    return 6 + Buffer.byteLength(key.key);
  };
  var rrrsig = exports.rrsig = {};
  rrrsig.encode = function(sig, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rrrsig.encodingLength(sig));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const signature = sig.signature;
    if (!Buffer.isBuffer(signature)) {
      throw new Error("Signature must be a Buffer");
    }
    offset += 2;
    buf.writeUInt16BE(types.toType(sig.typeCovered), offset);
    offset += 2;
    buf.writeUInt8(sig.algorithm, offset);
    offset += 1;
    buf.writeUInt8(sig.labels, offset);
    offset += 1;
    buf.writeUInt32BE(sig.originalTTL, offset);
    offset += 4;
    buf.writeUInt32BE(sig.expiration, offset);
    offset += 4;
    buf.writeUInt32BE(sig.inception, offset);
    offset += 4;
    buf.writeUInt16BE(sig.keyTag, offset);
    offset += 2;
    name.encode(sig.signersName, buf, offset);
    offset += name.encode.bytes;
    signature.copy(buf, offset, 0, signature.length);
    offset += signature.length;
    rrrsig.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rrrsig.encode.bytes - 2, oldOffset);
    return buf;
  };
  rrrsig.encode.bytes = 0;
  rrrsig.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var sig = {};
    var length = buf.readUInt16BE(offset);
    offset += 2;
    sig.typeCovered = types.toString(buf.readUInt16BE(offset));
    offset += 2;
    sig.algorithm = buf.readUInt8(offset);
    offset += 1;
    sig.labels = buf.readUInt8(offset);
    offset += 1;
    sig.originalTTL = buf.readUInt32BE(offset);
    offset += 4;
    sig.expiration = buf.readUInt32BE(offset);
    offset += 4;
    sig.inception = buf.readUInt32BE(offset);
    offset += 4;
    sig.keyTag = buf.readUInt16BE(offset);
    offset += 2;
    sig.signersName = name.decode(buf, offset);
    offset += name.decode.bytes;
    sig.signature = buf.slice(offset, oldOffset + length + 2);
    offset += sig.signature.length;
    rrrsig.decode.bytes = offset - oldOffset;
    return sig;
  };
  rrrsig.decode.bytes = 0;
  rrrsig.encodingLength = function(sig) {
    return 20 + name.encodingLength(sig.signersName) + Buffer.byteLength(sig.signature);
  };
  var rrp = exports.rp = {};
  rrp.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rrp.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    name.encode(data.mbox || ".", buf, offset, { mail: true });
    offset += name.encode.bytes;
    name.encode(data.txt || ".", buf, offset);
    offset += name.encode.bytes;
    rrp.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rrp.encode.bytes - 2, oldOffset);
    return buf;
  };
  rrp.encode.bytes = 0;
  rrp.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.mbox = name.decode(buf, offset, { mail: true }) || ".";
    offset += name.decode.bytes;
    data.txt = name.decode(buf, offset) || ".";
    offset += name.decode.bytes;
    rrp.decode.bytes = offset - oldOffset;
    return data;
  };
  rrp.decode.bytes = 0;
  rrp.encodingLength = function(data) {
    return 2 + name.encodingLength(data.mbox || ".") + name.encodingLength(data.txt || ".");
  };
  var typebitmap = {};
  typebitmap.encode = function(typelist, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(typebitmap.encodingLength(typelist));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var typesByWindow = [];
    for (var i = 0;i < typelist.length; i++) {
      var typeid = types.toType(typelist[i]);
      if (typesByWindow[typeid >> 8] === undefined) {
        typesByWindow[typeid >> 8] = [];
      }
      typesByWindow[typeid >> 8][typeid >> 3 & 31] |= 1 << 7 - (typeid & 7);
    }
    for (i = 0;i < typesByWindow.length; i++) {
      if (typesByWindow[i] !== undefined) {
        var windowBuf = Buffer.from(typesByWindow[i]);
        buf.writeUInt8(i, offset);
        offset += 1;
        buf.writeUInt8(windowBuf.length, offset);
        offset += 1;
        windowBuf.copy(buf, offset);
        offset += windowBuf.length;
      }
    }
    typebitmap.encode.bytes = offset - oldOffset;
    return buf;
  };
  typebitmap.encode.bytes = 0;
  typebitmap.decode = function(buf, offset, length) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var typelist = [];
    while (offset - oldOffset < length) {
      var window = buf.readUInt8(offset);
      offset += 1;
      var windowLength = buf.readUInt8(offset);
      offset += 1;
      for (var i = 0;i < windowLength; i++) {
        var b2 = buf.readUInt8(offset + i);
        for (var j = 0;j < 8; j++) {
          if (b2 & 1 << 7 - j) {
            var typeid = types.toString(window << 8 | i << 3 | j);
            typelist.push(typeid);
          }
        }
      }
      offset += windowLength;
    }
    typebitmap.decode.bytes = offset - oldOffset;
    return typelist;
  };
  typebitmap.decode.bytes = 0;
  typebitmap.encodingLength = function(typelist) {
    var extents = [];
    for (var i = 0;i < typelist.length; i++) {
      var typeid = types.toType(typelist[i]);
      extents[typeid >> 8] = Math.max(extents[typeid >> 8] || 0, typeid & 255);
    }
    var len = 0;
    for (i = 0;i < extents.length; i++) {
      if (extents[i] !== undefined) {
        len += 2 + Math.ceil((extents[i] + 1) / 8);
      }
    }
    return len;
  };
  var rnsec = exports.nsec = {};
  rnsec.encode = function(record, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rnsec.encodingLength(record));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    name.encode(record.nextDomain, buf, offset);
    offset += name.encode.bytes;
    typebitmap.encode(record.rrtypes, buf, offset);
    offset += typebitmap.encode.bytes;
    rnsec.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rnsec.encode.bytes - 2, oldOffset);
    return buf;
  };
  rnsec.encode.bytes = 0;
  rnsec.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var record = {};
    var length = buf.readUInt16BE(offset);
    offset += 2;
    record.nextDomain = name.decode(buf, offset);
    offset += name.decode.bytes;
    record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset));
    offset += typebitmap.decode.bytes;
    rnsec.decode.bytes = offset - oldOffset;
    return record;
  };
  rnsec.decode.bytes = 0;
  rnsec.encodingLength = function(record) {
    return 2 + name.encodingLength(record.nextDomain) + typebitmap.encodingLength(record.rrtypes);
  };
  var rnsec3 = exports.nsec3 = {};
  rnsec3.encode = function(record, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rnsec3.encodingLength(record));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const salt = record.salt;
    if (!Buffer.isBuffer(salt)) {
      throw new Error("salt must be a Buffer");
    }
    const nextDomain = record.nextDomain;
    if (!Buffer.isBuffer(nextDomain)) {
      throw new Error("nextDomain must be a Buffer");
    }
    offset += 2;
    buf.writeUInt8(record.algorithm, offset);
    offset += 1;
    buf.writeUInt8(record.flags, offset);
    offset += 1;
    buf.writeUInt16BE(record.iterations, offset);
    offset += 2;
    buf.writeUInt8(salt.length, offset);
    offset += 1;
    salt.copy(buf, offset, 0, salt.length);
    offset += salt.length;
    buf.writeUInt8(nextDomain.length, offset);
    offset += 1;
    nextDomain.copy(buf, offset, 0, nextDomain.length);
    offset += nextDomain.length;
    typebitmap.encode(record.rrtypes, buf, offset);
    offset += typebitmap.encode.bytes;
    rnsec3.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rnsec3.encode.bytes - 2, oldOffset);
    return buf;
  };
  rnsec3.encode.bytes = 0;
  rnsec3.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var record = {};
    var length = buf.readUInt16BE(offset);
    offset += 2;
    record.algorithm = buf.readUInt8(offset);
    offset += 1;
    record.flags = buf.readUInt8(offset);
    offset += 1;
    record.iterations = buf.readUInt16BE(offset);
    offset += 2;
    const saltLength = buf.readUInt8(offset);
    offset += 1;
    record.salt = buf.slice(offset, offset + saltLength);
    offset += saltLength;
    const hashLength = buf.readUInt8(offset);
    offset += 1;
    record.nextDomain = buf.slice(offset, offset + hashLength);
    offset += hashLength;
    record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset));
    offset += typebitmap.decode.bytes;
    rnsec3.decode.bytes = offset - oldOffset;
    return record;
  };
  rnsec3.decode.bytes = 0;
  rnsec3.encodingLength = function(record) {
    return 8 + record.salt.length + record.nextDomain.length + typebitmap.encodingLength(record.rrtypes);
  };
  var rds = exports.ds = {};
  rds.encode = function(digest, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rds.encodingLength(digest));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const digestdata = digest.digest;
    if (!Buffer.isBuffer(digestdata)) {
      throw new Error("Digest must be a Buffer");
    }
    offset += 2;
    buf.writeUInt16BE(digest.keyTag, offset);
    offset += 2;
    buf.writeUInt8(digest.algorithm, offset);
    offset += 1;
    buf.writeUInt8(digest.digestType, offset);
    offset += 1;
    digestdata.copy(buf, offset, 0, digestdata.length);
    offset += digestdata.length;
    rds.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rds.encode.bytes - 2, oldOffset);
    return buf;
  };
  rds.encode.bytes = 0;
  rds.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    var digest = {};
    var length = buf.readUInt16BE(offset);
    offset += 2;
    digest.keyTag = buf.readUInt16BE(offset);
    offset += 2;
    digest.algorithm = buf.readUInt8(offset);
    offset += 1;
    digest.digestType = buf.readUInt8(offset);
    offset += 1;
    digest.digest = buf.slice(offset, oldOffset + length + 2);
    offset += digest.digest.length;
    rds.decode.bytes = offset - oldOffset;
    return digest;
  };
  rds.decode.bytes = 0;
  rds.encodingLength = function(digest) {
    return 6 + Buffer.byteLength(digest.digest);
  };
  var rsshfp = exports.sshfp = {};
  rsshfp.getFingerprintLengthForHashType = function getFingerprintLengthForHashType(hashType) {
    switch (hashType) {
      case 1:
        return 20;
      case 2:
        return 32;
    }
  };
  rsshfp.encode = function encode(record, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rsshfp.encodingLength(record));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    buf[offset] = record.algorithm;
    offset += 1;
    buf[offset] = record.hash;
    offset += 1;
    const fingerprintBuf = Buffer.from(record.fingerprint.toUpperCase(), "hex");
    if (fingerprintBuf.length !== rsshfp.getFingerprintLengthForHashType(record.hash)) {
      throw new Error("Invalid fingerprint length");
    }
    fingerprintBuf.copy(buf, offset);
    offset += fingerprintBuf.byteLength;
    rsshfp.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rsshfp.encode.bytes - 2, oldOffset);
    return buf;
  };
  rsshfp.encode.bytes = 0;
  rsshfp.decode = function decode(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const record = {};
    offset += 2;
    record.algorithm = buf[offset];
    offset += 1;
    record.hash = buf[offset];
    offset += 1;
    const fingerprintLength = rsshfp.getFingerprintLengthForHashType(record.hash);
    record.fingerprint = buf.slice(offset, offset + fingerprintLength).toString("hex").toUpperCase();
    offset += fingerprintLength;
    rsshfp.decode.bytes = offset - oldOffset;
    return record;
  };
  rsshfp.decode.bytes = 0;
  rsshfp.encodingLength = function(record) {
    return 4 + Buffer.from(record.fingerprint, "hex").byteLength;
  };
  var rnaptr = exports.naptr = {};
  rnaptr.encode = function(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rnaptr.encodingLength(data));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    offset += 2;
    buf.writeUInt16BE(data.order || 0, offset);
    offset += 2;
    buf.writeUInt16BE(data.preference || 0, offset);
    offset += 2;
    string.encode(data.flags, buf, offset);
    offset += string.encode.bytes;
    string.encode(data.services, buf, offset);
    offset += string.encode.bytes;
    string.encode(data.regexp, buf, offset);
    offset += string.encode.bytes;
    name.encode(data.replacement, buf, offset);
    offset += name.encode.bytes;
    rnaptr.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rnaptr.encode.bytes - 2, oldOffset);
    return buf;
  };
  rnaptr.encode.bytes = 0;
  rnaptr.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.order = buf.readUInt16BE(offset);
    offset += 2;
    data.preference = buf.readUInt16BE(offset);
    offset += 2;
    data.flags = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.services = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.regexp = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.replacement = name.decode(buf, offset);
    offset += name.decode.bytes;
    rnaptr.decode.bytes = offset - oldOffset;
    return data;
  };
  rnaptr.decode.bytes = 0;
  rnaptr.encodingLength = function(data) {
    return string.encodingLength(data.flags) + string.encodingLength(data.services) + string.encodingLength(data.regexp) + name.encodingLength(data.replacement) + 6;
  };
  var rtlsa = exports.tlsa = {};
  rtlsa.encode = function(cert, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(rtlsa.encodingLength(cert));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const certdata = cert.certificate;
    if (!Buffer.isBuffer(certdata)) {
      throw new Error("Certificate must be a Buffer");
    }
    offset += 2;
    buf.writeUInt8(cert.usage, offset);
    offset += 1;
    buf.writeUInt8(cert.selector, offset);
    offset += 1;
    buf.writeUInt8(cert.matchingType, offset);
    offset += 1;
    certdata.copy(buf, offset, 0, certdata.length);
    offset += certdata.length;
    rtlsa.encode.bytes = offset - oldOffset;
    buf.writeUInt16BE(rtlsa.encode.bytes - 2, oldOffset);
    return buf;
  };
  rtlsa.encode.bytes = 0;
  rtlsa.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const cert = {};
    const length = buf.readUInt16BE(offset);
    offset += 2;
    cert.usage = buf.readUInt8(offset);
    offset += 1;
    cert.selector = buf.readUInt8(offset);
    offset += 1;
    cert.matchingType = buf.readUInt8(offset);
    offset += 1;
    cert.certificate = buf.slice(offset, oldOffset + length + 2);
    offset += cert.certificate.length;
    rtlsa.decode.bytes = offset - oldOffset;
    return cert;
  };
  rtlsa.decode.bytes = 0;
  rtlsa.encodingLength = function(cert) {
    return 5 + Buffer.byteLength(cert.certificate);
  };
  var renc = exports.record = function(type) {
    switch (type.toUpperCase()) {
      case "A":
        return ra;
      case "PTR":
        return rptr;
      case "CNAME":
        return rcname;
      case "DNAME":
        return rdname;
      case "TXT":
        return rtxt;
      case "NULL":
        return rnull;
      case "AAAA":
        return raaaa;
      case "SRV":
        return rsrv;
      case "HINFO":
        return rhinfo;
      case "CAA":
        return rcaa;
      case "NS":
        return rns;
      case "SOA":
        return rsoa;
      case "MX":
        return rmx;
      case "OPT":
        return ropt;
      case "DNSKEY":
        return rdnskey;
      case "RRSIG":
        return rrrsig;
      case "RP":
        return rrp;
      case "NSEC":
        return rnsec;
      case "NSEC3":
        return rnsec3;
      case "SSHFP":
        return rsshfp;
      case "DS":
        return rds;
      case "NAPTR":
        return rnaptr;
      case "TLSA":
        return rtlsa;
    }
    return runknown;
  };
  var answer = exports.answer = {};
  answer.encode = function(a, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(answer.encodingLength(a));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    name.encode(a.name, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt16BE(types.toType(a.type), offset);
    if (a.type.toUpperCase() === "OPT") {
      if (a.name !== ".") {
        throw new Error("OPT name must be root.");
      }
      buf.writeUInt16BE(a.udpPayloadSize || 4096, offset + 2);
      buf.writeUInt8(a.extendedRcode || 0, offset + 4);
      buf.writeUInt8(a.ednsVersion || 0, offset + 5);
      buf.writeUInt16BE(a.flags || 0, offset + 6);
      offset += 8;
      ropt.encode(a.options || [], buf, offset);
      offset += ropt.encode.bytes;
    } else {
      let klass = classes.toClass(a.class === undefined ? "IN" : a.class);
      if (a.flush)
        klass |= FLUSH_MASK;
      buf.writeUInt16BE(klass, offset + 2);
      buf.writeUInt32BE(a.ttl || 0, offset + 4);
      offset += 8;
      const enc = renc(a.type);
      enc.encode(a.data, buf, offset);
      offset += enc.encode.bytes;
    }
    answer.encode.bytes = offset - oldOffset;
    return buf;
  };
  answer.encode.bytes = 0;
  answer.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const a = {};
    const oldOffset = offset;
    a.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    a.type = types.toString(buf.readUInt16BE(offset));
    if (a.type === "OPT") {
      a.udpPayloadSize = buf.readUInt16BE(offset + 2);
      a.extendedRcode = buf.readUInt8(offset + 4);
      a.ednsVersion = buf.readUInt8(offset + 5);
      a.flags = buf.readUInt16BE(offset + 6);
      a.flag_do = (a.flags >> 15 & 1) === 1;
      a.options = ropt.decode(buf, offset + 8);
      offset += 8 + ropt.decode.bytes;
    } else {
      const klass = buf.readUInt16BE(offset + 2);
      a.ttl = buf.readUInt32BE(offset + 4);
      a.class = classes.toString(klass & NOT_FLUSH_MASK);
      a.flush = !!(klass & FLUSH_MASK);
      const enc = renc(a.type);
      a.data = enc.decode(buf, offset + 8);
      offset += 8 + enc.decode.bytes;
    }
    answer.decode.bytes = offset - oldOffset;
    return a;
  };
  answer.decode.bytes = 0;
  answer.encodingLength = function(a) {
    const data = a.data !== null && a.data !== undefined ? a.data : a.options;
    return name.encodingLength(a.name) + 8 + renc(a.type).encodingLength(data);
  };
  var question = exports.question = {};
  question.encode = function(q, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(question.encodingLength(q));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    name.encode(q.name, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt16BE(types.toType(q.type), offset);
    offset += 2;
    buf.writeUInt16BE(classes.toClass(q.class === undefined ? "IN" : q.class), offset);
    offset += 2;
    question.encode.bytes = offset - oldOffset;
    return q;
  };
  question.encode.bytes = 0;
  question.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const q = {};
    q.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    q.type = types.toString(buf.readUInt16BE(offset));
    offset += 2;
    q.class = classes.toString(buf.readUInt16BE(offset));
    offset += 2;
    const qu = !!(q.class & QU_MASK);
    if (qu)
      q.class &= NOT_QU_MASK;
    question.decode.bytes = offset - oldOffset;
    return q;
  };
  question.decode.bytes = 0;
  question.encodingLength = function(q) {
    return name.encodingLength(q.name) + 4;
  };
  exports.AUTHORITATIVE_ANSWER = 1 << 10;
  exports.TRUNCATED_RESPONSE = 1 << 9;
  exports.RECURSION_DESIRED = 1 << 8;
  exports.RECURSION_AVAILABLE = 1 << 7;
  exports.AUTHENTIC_DATA = 1 << 5;
  exports.CHECKING_DISABLED = 1 << 4;
  exports.DNSSEC_OK = 1 << 15;
  exports.encode = function(result, buf, offset) {
    const allocing = !buf;
    if (allocing)
      buf = Buffer.alloc(exports.encodingLength(result));
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    if (!result.questions)
      result.questions = [];
    if (!result.answers)
      result.answers = [];
    if (!result.authorities)
      result.authorities = [];
    if (!result.additionals)
      result.additionals = [];
    header.encode(result, buf, offset);
    offset += header.encode.bytes;
    offset = encodeList(result.questions, question, buf, offset);
    offset = encodeList(result.answers, answer, buf, offset);
    offset = encodeList(result.authorities, answer, buf, offset);
    offset = encodeList(result.additionals, answer, buf, offset);
    exports.encode.bytes = offset - oldOffset;
    if (allocing && exports.encode.bytes !== buf.length) {
      return buf.slice(0, exports.encode.bytes);
    }
    return buf;
  };
  exports.encode.bytes = 0;
  exports.decode = function(buf, offset) {
    if (!offset)
      offset = 0;
    const oldOffset = offset;
    const result = header.decode(buf, offset);
    offset += header.decode.bytes;
    offset = decodeList(result.questions, question, buf, offset);
    offset = decodeList(result.answers, answer, buf, offset);
    offset = decodeList(result.authorities, answer, buf, offset);
    offset = decodeList(result.additionals, answer, buf, offset);
    exports.decode.bytes = offset - oldOffset;
    return result;
  };
  exports.decode.bytes = 0;
  exports.encodingLength = function(result) {
    return header.encodingLength(result) + encodingLengthList(result.questions || [], question) + encodingLengthList(result.answers || [], answer) + encodingLengthList(result.authorities || [], answer) + encodingLengthList(result.additionals || [], answer);
  };
  exports.streamEncode = function(result) {
    const buf = exports.encode(result);
    const sbuf = Buffer.alloc(2);
    sbuf.writeUInt16BE(buf.byteLength);
    const combine = Buffer.concat([sbuf, buf]);
    exports.streamEncode.bytes = combine.byteLength;
    return combine;
  };
  exports.streamEncode.bytes = 0;
  exports.streamDecode = function(sbuf) {
    const len = sbuf.readUInt16BE(0);
    if (sbuf.byteLength < len + 2) {
      return null;
    }
    const result = exports.decode(sbuf.slice(2));
    exports.streamDecode.bytes = exports.decode.bytes;
    return result;
  };
  exports.streamDecode.bytes = 0;
  function encodingLengthList(list, enc) {
    let len = 0;
    for (let i = 0;i < list.length; i++)
      len += enc.encodingLength(list[i]);
    return len;
  }
  function encodeList(list, enc, buf, offset) {
    for (let i = 0;i < list.length; i++) {
      enc.encode(list[i], buf, offset);
      offset += enc.encode.bytes;
    }
    return offset;
  }
  function decodeList(list, enc, buf, offset) {
    for (let i = 0;i < list.length; i++) {
      list[i] = enc.decode(buf, offset);
      offset += enc.decode.bytes;
    }
    return offset;
  }
});

// index.js
var dnsPacket = require_dns_packet();
var { Buffer } = (init_buffer(), __toCommonJS(exports_buffer));
var arg;
if (typeof $argument != "undefined") {
  arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
} else {
  arg = {};
}
function log(...args) {
  if (`${arg?.log}` === "1") {
    console.log(...args);
  }
}
log(`传入的 $argument: ${JSON.stringify(arg, null, 2)}`);
var result = { addresses: [], ttl: parseInt(arg?.ttl || 60) };
(async () => {
  let type = arg?.type || "A,AAAA";
  type = type.split(/\s*,\s*/).filter((i) => ["A", "AAAA"].includes(i));
  const url = arg?.doh || "https://8.8.4.4/dns-query";
  const domain = $domain;
  const timeout = parseInt(arg?.timeout || 2);
  const edns = arg?.edns || "223.6.6.6";
  log(`[${domain}] 使用 ${url} 查询 ${type} 结果`);
  const res = await Promise.all(type.map((i) => query({
    url,
    domain,
    type: i,
    timeout,
    edns
  })));
  res.forEach((i) => {
    i.answers.forEach((ans) => {
      if (ans.type === "A" || ans.type === "AAAA") {
        result.addresses.push(ans.data);
        if (ans.ttl > 0) {
          result.ttl = ans.ttl;
        }
      }
    });
  });
  log(`[${domain}] 使用 ${url} 查询 ${type} 结果: ${JSON.stringify(result, null, 2)}`);
})().catch(async (e) => {
  log(e);
}).finally(async () => {
  $done(result);
});
function isIPv4(ip) {
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(ip);
}
async function query({ url, domain, type = "A", timeout, edns }) {
  const buf = dnsPacket.encode({
    type: "query",
    id: 0,
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [
      {
        type,
        name: domain
      }
    ],
    additionals: [
      {
        type: "OPT",
        name: ".",
        udpPayloadSize: 4096,
        flags: 0,
        options: [
          {
            code: "CLIENT_SUBNET",
            ip: edns,
            sourcePrefixLength: isIPv4(edns) ? 24 : 56,
            scopePrefixLength: 0
          }
        ]
      }
    ]
  });
  const res = await http({
    url: `${url}?dns=${buf.toString("base64").toString("utf-8").replace(/=/g, "")}`,
    headers: {
      Accept: "application/dns-message"
    },
    "binary-mode": true,
    encoding: null,
    timeout
  });
  return dnsPacket.decode(Buffer.from(res.body));
}
async function http(opt) {
  return new Promise((resolve, reject) => {
    $httpClient.get(opt, (error, response, data) => {
      if (response) {
        response.body = data;
        resolve(response, {
          error
        });
      } else {
        resolve(null, {
          error
        });
      }
    });
  });
}
