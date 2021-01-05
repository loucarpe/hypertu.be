"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function time() {
    let iso = new Date().toISOString();
    let day = iso.replace(/-/g, '/').substring(0, iso.indexOf('T'));
    let time = iso.substring(iso.indexOf('T') + 1, iso.length - 5);
    return `${day} ${time}`;
}
exports.default = {
    info: (msg) => {
        console.info(`[${time()}] [INFO] ${msg}`);
    },
    warn: (msg) => {
        console.warn(`[${time()}] [WARNING] ${msg}`);
    },
    error: (msg) => {
        console.error(`[${time()}] [ERROR] ${msg}`);
    }
};
