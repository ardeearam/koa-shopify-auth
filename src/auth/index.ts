import {Context} from 'koa';

import {AccessMode, NextFunction} from '../types';

//import getCookieOptions from './cookie-options';
import createEnableCookies from './create-enable-cookies';
import createTopLevelOAuthRedirect from './create-top-level-oauth-redirect';
//import createRequestStorageAccess from './create-request-storage-access';
import setUserAgent from './set-user-agent';

import Shopify from '@shopify/shopify-api';

const DEFAULT_MYSHOPIFY_DOMAIN = 'myshopify.com';
export const DEFAULT_ACCESS_MODE: AccessMode = 'online';

export const TOP_LEVEL_OAUTH_COOKIE_NAME = 'shopifyTopLevelOAuth';
export const TEST_COOKIE_NAME = 'shopifyTestCookie';
export const GRANTED_STORAGE_ACCESS_COOKIE_NAME = 'shopify.granted_storage_access';

//function hasCookieAccess({cookies}: Context) {
//  return Boolean(cookies.get(TEST_COOKIE_NAME));
//}

//function grantedStorageAccess({cookies}: Context) {
//  return Boolean(cookies.get(GRANTED_STORAGE_ACCESS_COOKIE_NAME));
//}

function shouldPerformInlineOAuth({cookies}: Context) {
  return Boolean(cookies.get(TOP_LEVEL_OAUTH_COOKIE_NAME));
}

export default function createShopifyAuth(options) {
  
  if (options.contextInitialParams) {
    console.log("Running custom koa-shopify-auth v13");
    Shopify.Context.initialize(options.contextInitialParams);  
  }
  
  const config = {
    prefix: '',
    myShopifyDomain: DEFAULT_MYSHOPIFY_DOMAIN,
    accessMode: DEFAULT_ACCESS_MODE,
    ...options,
  };

  const {prefix} = config;

  const oAuthStartPath = `${prefix}/auth`;
  const oAuthCallbackPath = `${oAuthStartPath}/callback`;

  const inlineOAuthPath = `${prefix}/auth/inline`;
  const topLevelOAuthRedirect = createTopLevelOAuthRedirect(
    Shopify.Context.API_KEY,
    inlineOAuthPath,
  );

  const enableCookiesPath = `${oAuthStartPath}/enable_cookies`;
  const enableCookies = createEnableCookies(config);
 // const requestStorageAccess = createRequestStorageAccess(config);

  setUserAgent();

  return async function shopifyAuth(ctx: Context, next: NextFunction) {
    console.log("SHOPIFYAUTH********.");
    ctx.cookies.secure = true;

    const shop = ctx.query.shop;
    const redirectUrl = await Shopify.Auth.beginAuth(
      ctx.req,
      ctx.res,
      shop,
      oAuthCallbackPath,
      config.accessMode === 'online'
    );
    
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

    if (
      ctx.path === inlineOAuthPath ||
      (ctx.path === oAuthStartPath && shouldPerformInlineOAuth(ctx))
    ) {
      if (shop == null) {
        ctx.throw(400);
      }

      //ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME, '', getCookieOptions(ctx));
      //console.log("The top level cookie has been planted.");
      //console.log(getCookieOptions(ctx));
      ctx.redirect(redirectUrl);
      return;
    }

    if (ctx.path === oAuthStartPath) {
      console.log("oAuthStartPath");
      await topLevelOAuthRedirect(ctx);
      return;
    }

    if (ctx.path === oAuthCallbackPath) {
      try {
        ctx.state.shopify = await Shopify.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query);

        //ctx.state.shopify = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res, config.accessMode === 'online');

        if (config.afterAuth) {
          await config.afterAuth(ctx);
        }
      }
      catch (e) {
        switch (true) {
          case (e instanceof Shopify.Errors.InvalidOAuthError):
            //ctx.throw(400, e.message);
            console.error(e.message);
            console.error("Restarting OAuth dance...");
            ctx.redirect(redirectUrl);
            break;
          case (e instanceof Shopify.Errors.SessionNotFound):
            //ctx.throw(403, e.message);
            console.error(e.message);
            console.error("Restarting OAuth dance...");
            ctx.redirect(redirectUrl);
            break;
          default:
            //ctx.throw(500, e.message);
            console.error(e.message);
            console.error("Restarting OAuth dance...");
            ctx.redirect(redirectUrl);
            break;
        }
      }
      return;
    }

    if (ctx.path === enableCookiesPath) {
      console.log('enableCookies');
      await enableCookies(ctx);
      return;
    }

    await next();
  };
}

export {default as Error} from './errors';
