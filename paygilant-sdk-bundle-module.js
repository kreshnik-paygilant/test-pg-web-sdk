/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

//declare const FingerprintJS: any;
let fingerprintJSPromise = null;
function loadFingerprintJSScript(fpJsApiKey) {
    const fpjsEndPoint = `https://fpjscdn.net/v3/${fpJsApiKey}/iife.min.js`;
    if (fingerprintJSPromise) {
        return fingerprintJSPromise;
    }
    fingerprintJSPromise = new Promise((resolve, reject) => {
        if (window.FingerprintJS && typeof window.FingerprintJS !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = fpjsEndPoint;
        //script.type = 'module'; // Ensure the script is treated as a module
        script.async = true;
        script.onload = () => {
            if (window.FingerprintJS) {
                resolve();
            }
            else {
                reject(new Error('FpJS is not defined even after script load.'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load FpJS script'));
        document.head.appendChild(script);
    });
    return fingerprintJSPromise;
}
class FpjsInitializer {
    loadScript(fpJsApiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield loadFingerprintJSScript(fpJsApiKey);
        });
    }
}

class DeviceIdentifier {
    constructor() {
        this.fpPromise = null;
        this.visitorId = null;
        this.fpjsInitializer = new FpjsInitializer();
    }
    static getInstance() {
        if (!DeviceIdentifier.instance) {
            DeviceIdentifier.instance = new DeviceIdentifier();
        }
        return DeviceIdentifier.instance;
    }
    getDeviceId(fpJsApiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.visitorId) {
                    // no need to call FP each time
                    return this.visitorId;
                }
                yield this.fpjsInitializer.loadScript(fpJsApiKey);
                // Only call FingerprintJS.load() if it hasn't been called before
                if (!this.fpPromise && window.FingerprintJS) {
                    this.fpPromise = window.FingerprintJS.load();
                }
                if (this.fpPromise) {
                    const fp = yield this.fpPromise; // Reuse the existing promise
                    const result = yield fp.get();
                    this.visitorId = result.visitorId;
                    return result.visitorId;
                }
                else {
                    throw new Error('FpJS could not be loaded');
                }
            }
            catch (error) {
                console.error('Paygilant SDK Error: ', error);
                throw error;
            }
        });
    }
}

class SessionManager {
    constructor() {
        this.sessionIdKey = 'pgsdk_session_id';
        this.sessionId = null;
        this.initializeSessionId();
    }
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    initializeSessionId() {
        // Check if a session ID already exists in localStorage
        const storedSessionId = localStorage.getItem(this.sessionIdKey);
        if (storedSessionId) {
            this.sessionId = storedSessionId;
        }
        else {
            // Generate a new session ID and store it
            this.sessionId = this.generateSessionId();
            localStorage.setItem(this.sessionIdKey, this.sessionId);
        }
        return this.sessionId;
    }
    generateSessionId() {
        const d = new Date();
        return `web_${d.getTime()}`;
    }
    getNewSessionId() {
        this.clearSessionId();
        this.initializeSessionId();
        return this.getSessionId();
    }
    getSessionId() {
        const storedSessionId = localStorage.getItem(this.sessionIdKey);
        return storedSessionId || this.sessionId || this.initializeSessionId();
    }
    clearSessionId() {
        this.sessionId = null;
        localStorage.removeItem(this.sessionIdKey);
    }
}

class PaygilantSDK {
    constructor(fpJsApiKey) {
        PaygilantSDK.deviceIdentifier = DeviceIdentifier.getInstance();
        PaygilantSDK.sessionManager = SessionManager.getInstance();
        PaygilantSDK.fpJsApiKey = fpJsApiKey;
    }
    static load(loadParams) {
        if (!PaygilantSDK.instance) {
            if (!loadParams) {
                throw new Error('Load params not present');
            }
            const apiKey = loadParams.apiKey;
            if (!apiKey || apiKey.trim().length < 1) {
                throw new Error('API Key required');
            }
            console.log("> SDK: initialized");
            PaygilantSDK.instance = new PaygilantSDK(apiKey);
        }
        else {
            console.log("> SDK: already initialized, returning instance");
            //return PaygilantSDK.instance;
            return new Promise((resolve) => {
                resolve(PaygilantSDK.instance);
            });
        }
        return this.loadFields().then(() => {
            return PaygilantSDK.instance;
        });
    }
    static loadFields() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.checkIfSdkInstanceLoaded();
            const sessionId = this.sessionManager.getSessionId();
            const deviceId = yield this.deviceIdentifier.getDeviceId(this.fpJsApiKey);
            this.sessionId = sessionId;
            this.deviceId = deviceId;
            console.log(`> SDK: loaded with Session ID: ${sessionId}; Device ID: ${deviceId}`);
        });
    }
    getResult() {
        return {
            sessionId: PaygilantSDK.sessionId,
            deviceId: PaygilantSDK.deviceId
        };
    }
    getDeviceId() {
        this.checkIfSdkInstanceLoaded();
        return PaygilantSDK.deviceId;
    }
    getSessionId() {
        this.checkIfSdkInstanceLoaded();
        return PaygilantSDK.sessionId;
    }
    clearSessionIdAndGetNew() {
        this.clearSessionId();
        console.log("sdk: returning new sessionId");
        return PaygilantSDK.sessionId;
    }
    clearSessionId() {
        console.log("sdk: session cleared");
        this.checkIfSdkInstanceLoaded();
        PaygilantSDK.sessionId = PaygilantSDK.sessionManager.getNewSessionId();
    }
    checkIfSdkInstanceLoaded() {
        if (!PaygilantSDK.instance) {
            throw new Error('PaygilantSDK is not loaded.');
        }
    }
}
PaygilantSDK.fpJsApiKey = '';
PaygilantSDK.sessionId = '';
PaygilantSDK.deviceId = '';

export { PaygilantSDK };
