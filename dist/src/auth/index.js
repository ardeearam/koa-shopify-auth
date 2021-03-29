"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = exports.GRANTED_STORAGE_ACCESS_COOKIE_NAME = exports.TEST_COOKIE_NAME = exports.TOP_LEVEL_OAUTH_COOKIE_NAME = exports.DEFAULT_ACCESS_MODE = void 0;
var tslib_1 = require("tslib");
//import getCookieOptions from './cookie-options';
var create_enable_cookies_1 = tslib_1.__importDefault(require("./create-enable-cookies"));
var create_top_level_oauth_redirect_1 = tslib_1.__importDefault(require("./create-top-level-oauth-redirect"));
//import createRequestStorageAccess from './create-request-storage-access';
var set_user_agent_1 = tslib_1.__importDefault(require("./set-user-agent"));
var shopify_api_1 = tslib_1.__importDefault(require("@shopify/shopify-api"));
var DEFAULT_MYSHOPIFY_DOMAIN = 'myshopify.com';
exports.DEFAULT_ACCESS_MODE = 'online';
exports.TOP_LEVEL_OAUTH_COOKIE_NAME = 'shopifyTopLevelOAuth';
exports.TEST_COOKIE_NAME = 'shopifyTestCookie';
exports.GRANTED_STORAGE_ACCESS_COOKIE_NAME = 'shopify.granted_storage_access';
//function hasCookieAccess({cookies}: Context) {
//  return Boolean(cookies.get(TEST_COOKIE_NAME));
//}
//function grantedStorageAccess({cookies}: Context) {
//  return Boolean(cookies.get(GRANTED_STORAGE_ACCESS_COOKIE_NAME));
//}
function shouldPerformInlineOAuth(_a) {
    var cookies = _a.cookies;
    return Boolean(cookies.get(exports.TOP_LEVEL_OAUTH_COOKIE_NAME));
}
function createShopifyAuth(options) {
    if (options.contextInitialParams) {
        console.log("Initializing Shopify.Context in createShopifyAuth as workaround v9");
        shopify_api_1.default.Context.initialize(options.contextInitialParams);
    }
    var config = tslib_1.__assign({ prefix: '', myShopifyDomain: DEFAULT_MYSHOPIFY_DOMAIN, accessMode: exports.DEFAULT_ACCESS_MODE }, options);
    var prefix = config.prefix;
    var oAuthStartPath = prefix + "/auth";
    var oAuthCallbackPath = oAuthStartPath + "/callback";
    var inlineOAuthPath = prefix + "/auth/inline";
    var topLevelOAuthRedirect = create_top_level_oauth_redirect_1.default(shopify_api_1.default.Context.API_KEY, inlineOAuthPath);
    var enableCookiesPath = oAuthStartPath + "/enable_cookies";
    var enableCookies = create_enable_cookies_1.default(config);
    // const requestStorageAccess = createRequestStorageAccess(config);
    set_user_agent_1.default();
    return function shopifyAuth(ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var shop, redirectUrl, _a, e_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("SHOPIFYAUTH********.");
                        ctx.cookies.secure = true;
                        if (!(ctx.path === inlineOAuthPath ||
                            (ctx.path === oAuthStartPath && shouldPerformInlineOAuth(ctx)))) return [3 /*break*/, 2];
                        shop = ctx.query.shop;
                        if (shop == null) {
                            ctx.throw(400);
                        }
                        return [4 /*yield*/, shopify_api_1.default.Auth.beginAuth(ctx.req, ctx.res, shop, oAuthCallbackPath, config.accessMode === 'online')];
                    case 1:
                        redirectUrl = _b.sent();
                        ctx.redirect(redirectUrl);
                        return [2 /*return*/];
                    case 2:
                        if (!(ctx.path === oAuthStartPath)) return [3 /*break*/, 4];
                        console.log("oAuthStartPath");
                        return [4 /*yield*/, topLevelOAuthRedirect(ctx)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                    case 4:
                        if (!(ctx.path === oAuthCallbackPath)) return [3 /*break*/, 12];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 10, , 11]);
                        return [4 /*yield*/, shopify_api_1.default.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query)];
                    case 6:
                        _b.sent();
                        _a = ctx.state;
                        return [4 /*yield*/, shopify_api_1.default.Utils.loadCurrentSession(ctx.req, ctx.res, config.accessMode === 'online')];
                    case 7:
                        _a.shopify = _b.sent();
                        if (!config.afterAuth) return [3 /*break*/, 9];
                        return [4 /*yield*/, config.afterAuth(ctx)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_1 = _b.sent();
                        switch (true) {
                            case (e_1 instanceof shopify_api_1.default.Errors.InvalidOAuthError):
                                ctx.throw(400, e_1.message);
                                break;
                            case (e_1 instanceof shopify_api_1.default.Errors.SessionNotFound):
                                ctx.throw(403, e_1.message);
                                break;
                            default:
                                ctx.throw(500, e_1.message);
                                break;
                        }
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                    case 12:
                        if (!(ctx.path === enableCookiesPath)) return [3 /*break*/, 14];
                        console.log('enableCookies');
                        return [4 /*yield*/, enableCookies(ctx)];
                    case 13:
                        _b.sent();
                        return [2 /*return*/];
                    case 14: return [4 /*yield*/, next()];
                    case 15:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
}
exports.default = createShopifyAuth;
var errors_1 = require("./errors");
Object.defineProperty(exports, "Error", { enumerable: true, get: function () { return tslib_1.__importDefault(errors_1).default; } });
