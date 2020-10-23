import { Site, SiteOptions } from './mod.ts';

const opts: SiteOptions = {
     port: 8080,
     sessions: true,
     routes: ["./tests"],
     view_ips: true,
     debug: true
};
const app: Site = new Site(opts);
app.load();