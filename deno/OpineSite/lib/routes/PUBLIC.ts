import Route from './Route.ts';
import { ExtendedRequest as Request } from "../utils/session/frameworks/opine.ts";
import type {
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

interface Options {
     [key: string]: any;
}

abstract class PUBLIC extends Route {
     #route: string;
     #file: string;

     public constructor(route: string, render: string) {
          super('GET');
          this.#route = '/';
          this.#file = render;
     }

     /**
      * Options to generate based off the request. 
      * This is further sent to the client.
      */
     public abstract options(): Options;

     protected handleRoute(req: Request, res: Response, next: NextFunction): void {
          res.render(this.#file, this.options());
          return;
     }

     public get route(): string {
          return this.#route;
     }
}

export default PUBLIC;