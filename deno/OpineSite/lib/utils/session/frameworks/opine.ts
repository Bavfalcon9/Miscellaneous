import { opine } from "https://deno.land/x/opine@0.24.0/src/opine.ts";
import { SessionData } from "../mod.ts";
import { Cookie, getCookies } from "https://deno.land/std/http/cookie.ts";
import { 
     CookieOptions,
     NextFunction,
     Request,
     Response
} from "https://deno.land/x/opine@0.24.0/src/types.ts";

export interface ExtendedRequest extends Request {
     session: SessionData;
}

export default function use(session: any, options?: CookieOptions) {
	return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
          const cookies = getCookies(req);
          const sid: string = cookies.sid;
          const opt: CookieOptions = options || {};

          if (!opt.secure) {
               opt.secure = req.secure;
          }

          if (!opt.path) {
               opt.path = "/";
          }

          if (!opt.httpOnly) {
               opt.httpOnly = !req.secure;
          }

          if (sid === undefined) {
               req.session = new SessionData(session);
          } else if (session._store.sessionExists(sid) === false) {
               req.session = new SessionData(session);
          } else {
               req.session = new SessionData(session, sid);
          }

          await req.session.init();

          const cookie: Cookie = { name: 'sid', value: req.session.sessionId, ...opt };
          res.cookie(cookie);

          next();
	}
}