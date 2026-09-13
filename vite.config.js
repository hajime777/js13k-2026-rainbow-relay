import {integrateRuntime} from './tools/runtime-transform.mjs';
export default {plugins:[{name:'integrated-runtime',transformIndexHtml:integrateRuntime}]}
