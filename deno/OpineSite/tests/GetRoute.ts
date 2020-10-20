import PUBLIC from "../lib/routes/PUBLIC.ts";

class BasicRoute extends PUBLIC {
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