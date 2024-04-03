var PaygilantSDKLibrary = (function (exports) {
    'use strict';

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

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    //declare const FingerprintJS: any;
    var fingerprintJSPromise = null;
    function loadFingerprintJSScript(fpJsApiKey) {
        var fpjsEndPoint = "https://fpjscdn.net/v3/".concat(fpJsApiKey, "/iife.min.js");
        if (fingerprintJSPromise) {
            return fingerprintJSPromise;
        }
        fingerprintJSPromise = new Promise(function (resolve, reject) {
            if (window.FingerprintJS && typeof window.FingerprintJS !== 'undefined') {
                resolve();
                return;
            }
            var script = document.createElement('script');
            script.src = fpjsEndPoint;
            //script.type = 'module'; // Ensure the script is treated as a module
            script.async = true;
            script.onload = function () {
                if (window.FingerprintJS) {
                    resolve();
                }
                else {
                    reject(new Error('FpJS is not defined even after script load.'));
                }
            };
            script.onerror = function () { return reject(new Error('Failed to load FpJS script')); };
            document.head.appendChild(script);
        });
        return fingerprintJSPromise;
    }
    var FpjsInitializer = /** @class */ (function () {
        function FpjsInitializer() {
        }
        FpjsInitializer.prototype.loadScript = function (fpJsApiKey) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, loadFingerprintJSScript(fpJsApiKey)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return FpjsInitializer;
    }());

    var DeviceIdentifier = /** @class */ (function () {
        function DeviceIdentifier() {
            this.fpPromise = null;
            this.visitorId = null;
            this.fpjsInitializer = new FpjsInitializer();
        }
        DeviceIdentifier.getInstance = function () {
            if (!DeviceIdentifier.instance) {
                DeviceIdentifier.instance = new DeviceIdentifier();
            }
            return DeviceIdentifier.instance;
        };
        DeviceIdentifier.prototype.getDeviceId = function (fpJsApiKey) {
            return __awaiter(this, void 0, void 0, function () {
                var fp, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            if (this.visitorId) {
                                // no need to call FP each time
                                return [2 /*return*/, this.visitorId];
                            }
                            return [4 /*yield*/, this.fpjsInitializer.loadScript(fpJsApiKey)];
                        case 1:
                            _a.sent();
                            // Only call FingerprintJS.load() if it hasn't been called before
                            if (!this.fpPromise && window.FingerprintJS) {
                                this.fpPromise = window.FingerprintJS.load();
                            }
                            if (!this.fpPromise) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.fpPromise];
                        case 2:
                            fp = _a.sent();
                            return [4 /*yield*/, fp.get()];
                        case 3:
                            result = _a.sent();
                            this.visitorId = result.visitorId;
                            return [2 /*return*/, result.visitorId];
                        case 4: throw new Error('FpJS could not be loaded');
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            error_1 = _a.sent();
                            console.error('Paygilant SDK Error: ', error_1);
                            throw error_1;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        return DeviceIdentifier;
    }());

    var SessionManager = /** @class */ (function () {
        function SessionManager() {
            this.sessionIdKey = 'pgsdk_session_id';
            this.sessionId = null;
            this.initializeSessionId();
        }
        SessionManager.getInstance = function () {
            if (!SessionManager.instance) {
                SessionManager.instance = new SessionManager();
            }
            return SessionManager.instance;
        };
        SessionManager.prototype.initializeSessionId = function () {
            // Check if a session ID already exists in localStorage
            var storedSessionId = localStorage.getItem(this.sessionIdKey);
            if (storedSessionId) {
                this.sessionId = storedSessionId;
            }
            else {
                // Generate a new session ID and store it
                this.sessionId = this.generateSessionId();
                localStorage.setItem(this.sessionIdKey, this.sessionId);
            }
            return this.sessionId;
        };
        SessionManager.prototype.generateSessionId = function () {
            var d = new Date();
            return "web_".concat(d.getTime());
        };
        SessionManager.prototype.getNewSessionId = function () {
            this.clearSessionId();
            this.initializeSessionId();
            return this.getSessionId();
        };
        SessionManager.prototype.getSessionId = function () {
            var storedSessionId = localStorage.getItem(this.sessionIdKey);
            return storedSessionId || this.sessionId || this.initializeSessionId();
        };
        SessionManager.prototype.clearSessionId = function () {
            this.sessionId = null;
            localStorage.removeItem(this.sessionIdKey);
        };
        return SessionManager;
    }());

    var PaygilantSDK = /** @class */ (function () {
        function PaygilantSDK(fpJsApiKey) {
            PaygilantSDK.deviceIdentifier = DeviceIdentifier.getInstance();
            PaygilantSDK.sessionManager = SessionManager.getInstance();
            PaygilantSDK.fpJsApiKey = fpJsApiKey;
        }
        PaygilantSDK.load = function (loadParams) {
            if (!PaygilantSDK.instance) {
                if (!loadParams) {
                    throw new Error('Load params not present');
                }
                var apiKey = loadParams.apiKey;
                if (!apiKey || apiKey.trim().length < 1) {
                    throw new Error('API Key required');
                }
                console.log("> SDK: initialized");
                PaygilantSDK.instance = new PaygilantSDK(apiKey);
            }
            else {
                console.log("> SDK: already initialized, returning instance");
                //return PaygilantSDK.instance;
                return new Promise(function (resolve) {
                    resolve(PaygilantSDK.instance);
                });
            }
            return this.loadFields().then(function () {
                return PaygilantSDK.instance;
            });
        };
        PaygilantSDK.loadFields = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sessionId, deviceId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sessionId = this.sessionManager.getSessionId();
                            return [4 /*yield*/, this.deviceIdentifier.getDeviceId(this.fpJsApiKey)];
                        case 1:
                            deviceId = _a.sent();
                            this.sessionId = sessionId;
                            this.deviceId = deviceId;
                            console.log("> SDK: loaded with Session ID: ".concat(sessionId, "; Device ID: ").concat(deviceId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        PaygilantSDK.prototype.getResult = function () {
            return {
                sessionId: PaygilantSDK.sessionId,
                deviceId: PaygilantSDK.deviceId
            };
        };
        PaygilantSDK.prototype.getDeviceId = function () {
            this.checkIfSdkInstanceLoaded();
            return PaygilantSDK.deviceId;
        };
        PaygilantSDK.prototype.getSessionId = function () {
            this.checkIfSdkInstanceLoaded();
            return PaygilantSDK.sessionId;
        };
        PaygilantSDK.prototype.clearSessionIdAndGetNew = function () {
            this.clearSessionId();
            console.log("sdk: returning new sessionId");
            return PaygilantSDK.sessionId;
        };
        PaygilantSDK.prototype.clearSessionId = function () {
            console.log("sdk: session cleared");
            this.checkIfSdkInstanceLoaded();
            PaygilantSDK.sessionId = PaygilantSDK.sessionManager.getNewSessionId();
        };
        PaygilantSDK.prototype.checkIfSdkInstanceLoaded = function () {
            if (!PaygilantSDK.instance) {
                throw new Error('PaygilantSDK is not loaded.');
            }
        };
        PaygilantSDK.fpJsApiKey = '';
        PaygilantSDK.sessionId = '';
        PaygilantSDK.deviceId = '';
        return PaygilantSDK;
    }());
    window.PaygilantSDK = PaygilantSDK;

    exports.PaygilantSDK = PaygilantSDK;

    return exports;

})({});
