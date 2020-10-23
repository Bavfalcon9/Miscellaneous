import { PublicRoute } from "../mod.ts";

class BasicRoute extends PublicRoute {
     public constructor() {
          super('/', 'index.ejs');
     }

     public options(): any {
          return {
               name: "Test Route!"
          }
     }
}

export default BasicRoute;