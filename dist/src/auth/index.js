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
        console.log("Running custom koa-shopify-auth v13");
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
                        shop = ctx.query.shop;
                        return [4 /*yield*/, shopify_api_1.default.Auth.beginAuth(ctx.req, ctx.res, shop, oAuthCallbackPath, config.accessMode === 'online')];
                    case 1:
                        redirectUrl = _b.sent();
                        /*
                        if (
                          ctx.path === oAuthStartPath &&
                          !hasCookieAccess(ctx) &&
                          !grantedStorageAccess(ctx)
                        ) {
                          await requestStorageAccess(ctx);
                          return;
                        }
                        */
                        if (ctx.path === inlineOAuthPath ||
                            (ctx.path === oAuthStartPath && shouldPerformInlineOAuth(ctx))) {
                            if (shop == null) {
                                ctx.throw(400);
                            }
                            //ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME, '', getCookieOptions(ctx));
                            //console.log("The top level cookie has been planted.");
                            //console.log(getCookieOptions(ctx));
                            ctx.redirect(redirectUrl);
                            return [2 /*return*/];
                        }
                        if (!(ctx.path === oAuthStartPath)) return [3 /*break*/, 3];
                        console.log("oAuthStartPath");
                        return [4 /*yield*/, topLevelOAuthRedirect(ctx)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                    case 3:
                        if (!(ctx.path === oAuthCallbackPath)) return [3 /*break*/, 11];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 9, , 10]);
                        return [4 /*yield*/, shopify_api_1.default.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query)];
                    case 5:
                        _b.sent();
                        _a = ctx.state;
                        return [4 /*yield*/, shopify_api_1.default.Utils.loadCurrentSession(ctx.req, ctx.res, config.accessMode === 'online')];
                    case 6:
                        _a.shopify = _b.sent();
                        if (!config.afterAuth) return [3 /*break*/, 8];
                        return [4 /*yield*/, config.afterAuth(ctx)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_1 = _b.sent();
                        switch (true) {
                            case (e_1 instanceof shopify_api_1.default.Errors.InvalidOAuthError):
                                //ctx.throw(400, e.message);
                                console.error(e_1.message);
                                console.error("Restarting OAuth dance...");
                                ctx.redirect(redirectUrl);
                                break;
                            case (e_1 instanceof shopify_api_1.default.Errors.SessionNotFound):
                                //ctx.throw(403, e.message);
                                console.error(e_1.message);
                                console.error("Restarting OAuth dance...");
                                ctx.redirect(redirectUrl);
                                break;
                            default:
                                //ctx.throw(500, e.message);
                                console.error(e_1.message);
                                console.error("Restarting OAuth dance...");
                                ctx.redirect(redirectUrl);
                                break;
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                    case 11:
                        if (!(ctx.path === enableCookiesPath)) return [3 /*break*/, 13];
                        console.log('enableCookies');
                        return [4 /*yield*/, enableCookies(ctx)];
                    case 12:
                        _b.sent();
                        return [2 /*return*/];
                    case 13: return [4 /*yield*/, next()];
                    case 14:
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
