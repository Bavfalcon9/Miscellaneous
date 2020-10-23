import opine, { serveStatic } from "https://deno.land/x/opine@0.24.0/mod.ts";
import dejs from './utils/dejsWrapper.ts';
import type { ExtendedRequest } from "./utils/session/frameworks/opine.ts";
import type { 
     CookieOptions,
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";
import type { Server } from "https://deno.land/std@0.69.0/http/server.ts";
import { Session } from "./utils/session/mod.ts";
import { resolve } from "https://deno.land/std@0.74.0/path/mod.ts";
import Logger from "./utils/Logger.ts";
import SiteException from "./errors/SiteException.ts";
import Route from "./routes/Route.ts";
import { walk, walkSync } from "https://deno.land/std/fs/walk.ts";

export interface SiteOptions {
     /** Port to host on */
     port: number;
     /** Whether or not sessions should be allowed. */
     sessions: boolean;
     /** Route method folders relative to "path" */
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
     }

     /**
      * Load the site
      * 
      * @todo Complete
      */
     public async load(): Promise<void> {
          if (this.#options.sessions) {
               const session = new Session({ framework: 'opine' });
               await session.init();

               const MW = (this.#options.cookieOptions)
                    ? session.use()(session)
                    : session.use()(session, this.#options.cookieOptions);
               this.app.use(MW);
          }
          const PATH: string = this.#options.path || Deno.cwd();
          if (this.#options.static) {
               for (let dir of this.#options.static) {
                    const staticDir: string = resolve(PATH, dir);
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
                    const path: string = resolve(PATH, dir);
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
          for (let parent of this.#options.routes) {
               for (let dir of walkSync(resolve(PATH, parent))) {
                    const path: string = dir.path;

                    if (dir.isDirectory) continue;
                    if (dir.isSymlink) continue;

                    // We're assuming this is a path
                    
                    interface RouterModule {
                         default?: any;
                    };

                    let module: RouterModule;

                    // try importing
                    try {
                         module = await import(`${path}#${Date.now()}`);
                    } catch (err) {
                         this.logger.error(`[ROUTE] Unknown Module: ${path}`);
                         continue;
                    }

                    if (!module.default) {
                         this.logger.warn(`[ROUTE] Failed to load route: ${path} due to no default export`);
                         continue;
                    }

                    const route: Route = new module.default();

                    if (!(route instanceof Route)) {
                         this.logger.warn(`[ROUTE] Failed to load path: "${path}" because the export was not a known route.`);
                         continue;
                    }

                    (this.app[route.method] as any)(route.path, route.handleRoute);

                    this.logger.notice(`[ROUTE] Route "${route.constructor.name}" serving over "${route.path}" as "${route.method}"`);
               }
          }

          this.app.listen({ port: this.#options.port });
     }

     public stop(): void {
          
     }
}
export default Site;