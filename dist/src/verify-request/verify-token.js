"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
var tslib_1 = require("tslib");
var shopify_api_1 = tslib_1.__importDefault(require("@shopify/shopify-api"));
var index_1 = require("../index");
var utilities_1 = require("./utilities");
var auth_1 = require("../auth");
function verifyToken(routes, accessMode) {
    if (accessMode === void 0) { accessMode = auth_1.DEFAULT_ACCESS_MODE; }
    return function verifyTokenMiddleware(ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var session, scopesChanged;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shopify_api_1.default.Utils.loadCurrentSession(ctx.req, ctx.res, accessMode === 'online')];
                    case 1:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 3];
                        scopesChanged = !shopify_api_1.default.Context.SCOPES.equals(session.scope);
                        if (!(!scopesChanged && session.accessToken && (!session.expires || +(new Date(session.expires)) >= +(new Date())))) return [3 /*break*/, 3];
                        ctx.cookies.set(index_1.TOP_LEVEL_OAUTH_COOKIE_NAME);
                        return [4 /*yield*/, next()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        ctx.cookies.set(index_1.TEST_COOKIE_NAME, '1');
                        utilities_1.redirectToAuth(routes, ctx);
                        return [2 /*return*/];
                }
            });
        });
    };
}
exports.verifyToken = verifyToken;
