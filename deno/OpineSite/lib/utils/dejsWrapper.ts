import { dejs } from '../../dependencies.ts';

export default function (path: string, options: any) {
     return dejs.renderFileToString(path, options);
}