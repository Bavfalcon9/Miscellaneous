import Route from './Route.ts';
import type { ExtendedRequest } from "../utils/session/frameworks/opine.ts";
import type {
     NextFunction,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

abstract class GetRoute extends Route {

     public constructor(path: string = '/') {
          super(path, 'get');
     }

     public abstract handle(req: any, res: Response, next: NextFunction): void;

     public handleRoute(req: ExtendedRequest, res: Response, next: NextFunction): void {
          return this.handle(req, res, next);
     }
}

export default GetRoute;