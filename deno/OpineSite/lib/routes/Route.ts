import { ExtendedRequest } from "../utils/session/frameworks/opine.ts";
import type { ValidMethods } from "../ValidMethods.ts";
import type {
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

abstract class Route {
     public method: ValidMethods;

     public constructor(method: ValidMethods) {
          this.method = method;
     }

     protected abstract handleRoute(req: ExtendedRequest, res: Response, next: NextFunction): void;
}

export default Route;