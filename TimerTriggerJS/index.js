"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
};
var _this = this;
exports.__esModule = true;
var client = require('cheerio-httpcli');
var tough = require('tough-cookie');
var rp = require('request-promise');
var email = process.env["EMAIL"];
var password = process.env["PASSWORD"];
var webhook = process.env.SLACK_WEBHOOK;
var channel = process.env.SLACK_CHANNEL;
var apiKey = process.env["MACKREL_API_KEY"];
function run(context, mytimer) {
    return __awaiter(this, void 0, void 0, function () {
        var checkedCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sendCheckedcountToSlack()];
                case 1:
                    checkedCount = _a.sent();
                    console.log(new Date().toLocaleString(), checkedCount);
                    context.done();
                    return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
;
var fetchCheckedCount = function (userToken) { return __awaiter(_this, void 0, void 0, function () {
    var cookie, jar, opt, circles, _a, _b, checkedCount;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                cookie = new tough.Cookie({
                    key: 'user',
                    value: userToken,
                    path: '/',
                    domain: 'techbookfest.org'
                });
                jar = rp.jar();
                jar.setCookie(cookie, 'https://techbookfest.org');
                opt = {
                    url: 'https://techbookfest.org/api/circle/own',
                    jar: jar
                };
                _b = (_a = JSON).parse;
                return [4 /*yield*/, rp(opt)];
            case 1:
                circles = _b.apply(_a, [_c.sent()]);
                checkedCount = circles.filter(function (circle) { return circle.event.id === 'tbf04'; }).map(function (circle) { return circle.checkedCount; })[0];
                return [2 /*return*/, checkedCount];
        }
    });
}); };
var re = /^user=([^;]+)/;
var signIn = function () { return __awaiter(_this, void 0, void 0, function () {
    var opt, res, matched;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                opt = {
                    method: 'POST',
                    uri: 'https://techbookfest.org/api/user/login',
                    body: JSON.stringify({ email: email, password: password }),
                    headers: {
                        'content-type': 'application/json'
                    },
                    resolveWithFullResponse: true
                };
                return [4 /*yield*/, rp(opt)];
            case 1:
                res = _a.sent();
                matched = re.exec(res.headers['set-cookie'][0]);
                return [2 /*return*/, matched[1]];
        }
    });
}); };
var crawl = function () { return __awaiter(_this, void 0, void 0, function () {
    var userToken, checkedCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, signIn()];
            case 1:
                userToken = _a.sent();
                return [4 /*yield*/, fetchCheckedCount(userToken)];
            case 2:
                checkedCount = _a.sent();
                return [2 /*return*/, checkedCount];
        }
    });
}); };
var sendToMackerel = function (checkedCount) { return __awaiter(_this, void 0, void 0, function () {
    var opt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                opt = {
                    method: 'POST',
                    uri: 'https://api.mackerelio.com//api/v0/services/techbookfest/tsdb',
                    body: JSON.stringify([{ name: "circleCheck", time: Math.floor(new Date().getTime() / 1000), value: checkedCount }]),
                    headers: {
                        'content-type': 'application/json',
                        'X-Api-Key': apiKey
                    },
                    resolveWithFullResponse: true
                };
                return [4 /*yield*/, rp(opt)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var sendToSlack = function (message) { return __awaiter(_this, void 0, void 0, function () {
    var opt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                opt = {
                    method: 'POST',
                    uri: webhook,
                    json: {
                        channel: channel,
                        text: message
                    }
                };
                return [4 /*yield*/, rp(opt)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var sendCheckedcountToSlack = function () { return __awaiter(_this, void 0, void 0, function () {
    var checkedCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, crawl()
                //await sendToSlack(`被サークルチェック数: ${checkedCount}`)
            ];
            case 1:
                checkedCount = _a.sent();
                //await sendToSlack(`被サークルチェック数: ${checkedCount}`)
                return [4 /*yield*/, sendToMackerel(checkedCount)];
            case 2:
                //await sendToSlack(`被サークルチェック数: ${checkedCount}`)
                _a.sent();
                return [2 /*return*/, checkedCount];
        }
    });
}); };
