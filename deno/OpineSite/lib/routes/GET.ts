import Route from './Route.ts';
import { ExtendedRequest as Request } from "../utils/session/frameworks/opine.ts";
import type {
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

abstract class GET extends Route {
     #route: string;

     public constructor(route: string = '/') {
          super('GET');
          this.#route = '/';
     }

     public abstract handle(req: Request, res: Response, next: NextFunction): void;

     protected handleRoute(req: Request, res: Response, next: NextFunction): void {
          return this.handle(req, res, next);
     }

     public get route(): string {
          return this.#route;
     }
}

export default GET;