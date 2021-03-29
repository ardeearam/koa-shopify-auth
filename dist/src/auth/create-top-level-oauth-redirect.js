"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var create_top_level_redirect_1 = tslib_1.__importDefault(require("./create-top-level-redirect"));
//import getCookieOptions from './cookie-options';
//import {TOP_LEVEL_OAUTH_COOKIE_NAME} from './index';
function createTopLevelOAuthRedirect(apiKey, path) {
    var redirect = create_top_level_redirect_1.default(apiKey, path);
    return function topLevelOAuthRedirect(ctx) {
        //ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME, '1', getCookieOptions(ctx));
        redirect(ctx);
    };
}
exports.default = createTopLevelOAuthRedirect;
