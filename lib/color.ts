/**
 * Utility functions for color conversion
 * html2canvas doesn't support oklch/lab/lch color formats, so we need to convert to rgb/hex
 */

/**
 * Convert oklch color to rgb string
 * oklch format: oklch(l c h) where l=lightness(0-1), c=chroma(0-1), h=hue(0-360)
 */
export function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
    // Convert oklch to oklab first
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // oklab to linear sRGB
    const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = l - 0.0894841775 * a - 1.2914855480 * b;

    // pow to linear sRGB
    const lRGB = lPrime * lPrime * lPrime;
    const mRGB = mPrime * mPrime * mPrime;
    const sRGB = sPrime * sPrime * sPrime;

    // linear sRGB to sRGB
    const r = 4.0767416621 * lRGB - 1.2684380046 * mRGB - 0.0041960863 * sRGB;
    const g = -1.8643060303 * lRGB + 1.2454725688 * mRGB - 0.0073535470 * sRGB;
    const bRGB = -0.2124284947 * lRGB + 0.0229754384 * mRGB + 1.0718895333 * sRGB;

    return {
        r: Math.round(Math.max(0, Math.min(1, r)) * 255),
        g: Math.round(Math.max(0, Math.min(1, g)) * 255),
        b: Math.round(Math.max(0, Math.min(1, bRGB)) * 255),
    };
}

/**
 * Convert lab color to rgb string
 * lab format: lab(l a b) where l=lightness(0-100), a=-128 to 127, b=-128 to 127
 */
export function labToRgb(l: number, a: number, b: number): { r: number; g: number; b: number } {
    // lab to xyz
    const y = (l + 16) / 116;
    const x = a / 500 + y;
    const z = y - b / 200;

    const x3 = x * x * x;
    const y3 = y * y * y;
    const z3 = z * z * z;

    const epsilon = 216 / 24389;
    const kappa = 841 / 116;

    const fx = x3 > epsilon ? x3 : (x - 16 / 116) / kappa;
    const fy = y3 > epsilon ? y3 : (y - 16 / 116) / kappa;
    const fz = z3 > epsilon ? z3 : (z - 16 / 116) / kappa;

    // white point D65
    const xr = fx * 0.95047;
    const yr = fy * 1.0;
    const zr = fz * 1.08883;

    // xyz to linear sRGB
    const rLinear = xr * 3.2404542 + yr * -1.5371385 + zr * -0.4985314;
    const gLinear = xr * -0.9692660 + yr * 1.8760108 + zr * 0.0415560;
    const bLinear = xr * 0.0556434 + yr * -0.2040259 + zr * 1.0572252;

    // linear sRGB to sRGB (gamma correction)
    const gamma = (c: number) => c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;

    return {
        r: Math.round(Math.max(0, Math.min(1, gamma(rLinear))) * 255),
        g: Math.round(Math.max(0, Math.min(1, gamma(gLinear))) * 255),
        b: Math.round(Math.max(0, Math.min(1, gamma(bLinear))) * 255),
    };
}

/**
 * Convert lch color (CIELCh) to rgb string
 * lch format: lch(l c h) where l=lightness(0-100), c=chroma(0-150), h=hue(0-360)
 */
export function lchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);
    return labToRgb(l, a, b);
}

/**
 * Convert hsl color to rgb string
 * hsl format: hsl(h s l) where h=hue(0-360), s=Saturation(0-100%), l=lightness(0-100%)
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

/**
 * Parse color string and return rgb string
 * Supports: hex, rgb, rgba, oklch, lab, lch, hsl, hsla, and named colors
 */
export function parseColorToRgb(color: string): string {
    if (!color) return "rgb(0, 0, 0)";

    // Check for oklch format: oklch(l c h) or oklch(l c h / alpha)
    let match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*[\d.]+)?\)/);
    if (match) {
        const l = parseFloat(match[1]);
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);
        const rgb = oklchToRgb(l, c, h);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Check for lab format: lab(l a b) or lab(l a b / alpha)
    match = color.match(/lab\(\s*([\d.]+)\s+([\d.-]+)\s+([\d.-]+)(?:\s+\/\s*[\d.]+)?\)/);
    if (match) {
        const l = parseFloat(match[1]);
        const a = parseFloat(match[2]);
        const b = parseFloat(match[3]);
        const rgb = labToRgb(l, a, b);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Check for lch format: lch(l c h) or lch(l c h / alpha)
    match = color.match(/lch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*[\d.]+)?\)/);
    if (match) {
        const l = parseFloat(match[1]);
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);
        const rgb = lchToRgb(l, c, h);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Check for hsl/hsla format: hsl(h s% l%) or hsla(h s% l% / alpha)
    match = color.match(/hsla?\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%(?:\s+\/\s*[\d.]+)?\)/);
    if (match) {
        const h = parseFloat(match[1]);
        const s = parseFloat(match[2]);
        const l = parseFloat(match[3]);
        const rgb = hslToRgb(h, s, l);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Check for rgb/rgba format
    if (color.startsWith("rgb") || color.startsWith("oklab")) {
        return color; // Let html2canvas handle these
    }

    // Try to parse as hex
    let hex = color.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Return as is - html2canvas may handle it
    return color;
}

/**
 * Convert a CSS color string to rgb format compatible with html2canvas
 */
export function normalizeColorForCanvas(color: string): string {
    if (!color) return "rgb(0, 0, 0)";
    return parseColorToRgb(color);
}

/**
 * Recursively normalize all CSS colors in an element to rgb format
 * This prevents html2canvas from encountering unsupported color formats like lab, oklch, lch
 */
export function normalizeCanvasColors(element: HTMLElement): void {
    // Normalize inline styles
    if (element.style) {
        const propsToNormalize = ["background", "backgroundColor", "color", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor", "textDecorationColor", "fill", "stroke"];

        propsToNormalize.forEach((prop) => {
            const value = element.style.getPropertyValue(prop);
            if (value) {
                const normalized = normalizeColorForCanvas(value);
                element.style.setProperty(prop, normalized);
            }
        });

        // Normalize background-image gradients
        const bgImage = element.style.getPropertyValue("background-image");
        if (bgImage) {
            const normalizedBg = normalizeGradient(bgImage);
            element.style.setProperty("background-image", normalizedBg);
        }
    }

    // Recursively process children
    for (const child of element.children) {
        if (child instanceof HTMLElement) {
            normalizeCanvasColors(child as HTMLElement);
        }
    }
}

/**
 * Normalize CSS gradient functions to rgb format
 */
function normalizeGradient(gradient: string): string {
    if (!gradient) return gradient;

    // Normalize lab colors in gradients
    gradient = gradient.replace(/lab\(\s*([\d.]+)\s+([\d.-]+)\s+([\d.-]+)(?:\s+\/\s*[\d.]+)?\)/g, (_, l, a, b) => {
        const rgb = labToRgb(parseFloat(l), parseFloat(a), parseFloat(b));
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    });

    // Normalize lch colors in gradients
    gradient = gradient.replace(/lch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*[\d.]+)?\)/g, (_, l, c, h) => {
        const rgb = lchToRgb(parseFloat(l), parseFloat(c), parseFloat(h));
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    });

    // Normalize oklch colors in gradients
    gradient = gradient.replace(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*[\d.]+)?\)/g, (_, l, c, h) => {
        const rgb = oklchToRgb(parseFloat(l), parseFloat(c), parseFloat(h));
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    });

    // Normalize hsl colors in gradients
    gradient = gradient.replace(/hsla?\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%(?:\s+\/\s*[\d.]+)?\)/g, (_, h, s, l) => {
        const rgb = hslToRgb(parseFloat(h), parseFloat(s), parseFloat(l));
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    });

    return gradient;
}
