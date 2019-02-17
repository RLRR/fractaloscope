import { Scope } from './scope';

window.scope = new Scope(document.getElementById('display') as HTMLElement);
