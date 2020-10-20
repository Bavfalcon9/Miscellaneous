import * as dejs from 'https://deno.land/x/dejs/mod.ts';

export default function (path: string, options: any) {
     return dejs.renderFileToString(path, options);
}