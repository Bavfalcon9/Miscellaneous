import opine, { serveStatic } from "https://deno.land/x/opine@0.24.0/mod.ts";
import dejs from './utils/dejsWrapper.ts';
import type { ExtendedRequest } from "./utils/session/frameworks/opine.ts";
import type { 
     CookieOptions,
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";
import { Server } from "https://deno.land/std@0.69.0/http/server.ts";
import { Session } from "./utils/session/mod.ts";
import { resolve } from "https://deno.land/std@0.74.0/path/mod.ts";
import Logger from "./utils/Logger.ts";
import SiteException from "./errors/SiteException.ts";

export interface SiteOptions {
     /** Port to host on */
     port: number;
     /** Whether or not sessions should be allowed. */
     sessions: boolean;
     /** Route method locations */
     routes: string[];
     /** Middleware folders */
     middleware?: string[];
     /** A secret for redis */
     secret?: string;
     /** The path to your Site */
     path?: string;
     /** Static folder/files to serve */
     static?: string[];
     /** Whether or not to allow dot files */
     dotfiles?: 'allow' | 'deny';
     /** whether or not to include ips */
     view_ips?: boolean;
     /** cookie options */
     cookieOptions?: CookieOptions;
     /** Whether or not to include the logger */
     debug?: boolean;
}

/**
 * Router function for middleware folder (if it does not extend a class.)
 */
export type MiddleWareFunction = (req: ExtendedRequest, res: Response, next: NextFunction) => void;

class Site {
     public app;
     private logger: Logger;
     #options: SiteOptions;
     #server!: Server;

     public constructor(options: SiteOptions) {
          this.#options = options;
          this.app = opine();
          this.app.engine('ejs', dejs);

          // debug
          Logger.HARD_ENABLE = options.debug || false;
          this.logger = new Logger('OpineSite');

          if (options.sessions) {
               const session = new Session({ framework: 'opine' });
               session.init();

               const MW = (options.cookieOptions)
                    ? session.use()(session)
                    : session.use()(session, options.cookieOptions);
               this.app.use(MW);
          }
     }

     /**
      * Load the site
      * 
      * @todo Complete
      */
     public async load(): Promise<void> {
          if (this.#options.static) {
               for (let dir of this.#options.static) {
                    const staticDir: string = resolve(Deno.cwd(), dir);
                    this.app.use(serveStatic(staticDir, { dotfiles: this.#options.dotfiles || 'deny' }));
                    this.logger.info(`[STATIC] Serving files over: "${dir}"`);
               }
          }

          if (this.#options.view_ips) {
               this.app.set('trust proxy', true);
               this.logger.info('[OPT] Trusted proxy enabled due to view_ips being enabled.');
          }

          if (this.#options.middleware) {
               for (let dir of this.#options.middleware) {
                    const path: string = resolve(Deno.cwd(), dir);
                    let module: any;

                    // try importing
                    try {
                         module = await import(path);
                    } catch (err) {
                         this.logger.error(`[MW] Unknown Module: ${path}`);
                         continue;
                    }

                    if (typeof module.default !== 'function') {
                         this.logger.warn(`[MW] Module: "${path}" failed to load: \n - The default export must exist and be a router function.`);
                         continue;
                    }

                    this.app.use(module.default);
               }
          }

          // load routes
          if (this.#options.routes.length === 0) {
               // fail
               throw new SiteException('You must include a path for routes to be loaded.');
          }

          // todo Complete this.
          for (let dir of this.#options.routes) {
               const path: string = resolve(Deno.cwd(), dir);
               let module: any;

               // try importing
               try {
                    module = await import(path);
               } catch (err) {
                    this.logger.error(`[ROUTE] Unknown Module: ${path}`);
                    continue;
               }
          }
     }
}
export default Site;