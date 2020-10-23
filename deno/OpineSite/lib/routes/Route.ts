import type { ExtendedRequest } from "../utils/session/frameworks/opine.ts";
import type { ValidMethods } from "../ValidMethods.ts";
import type {
     NextFunction,
     Request,
     RequestHandler,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

abstract class Route {
     public readonly method: ValidMethods;
     public readonly path: string;

     public constructor(path: string, method: ValidMethods) {
          this.path = path;
          this.method = method;
     }

     public abstract handleRoute(req: ExtendedRequest, res: Response, next: NextFunction): any;
}

export default Route;