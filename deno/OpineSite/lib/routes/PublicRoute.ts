import Route from './Route.ts';
import type { ExtendedRequest } from "../utils/session/frameworks/opine.ts";
import type {
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

interface Options {
     [key: string]: any;
}

abstract class PublicRoute extends Route {
     public readonly file: string;

     public constructor(route: string, render: string) {
          super(route, 'get');
          this.file = render;
     }

     /**
      * Options to generate based off the request. 
      * This is further sent to the client.
      */
     public abstract options(): Options;

     public handleRoute(req: ExtendedRequest, res: Response, next: NextFunction): void {
          console.log(this);
          res.render(this.file, this.options());
          return;
     }
}

export default PublicRoute;