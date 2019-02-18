import { Scope } from '../Scope';
import { Vec2 } from '../vec2';

export class MouseInteraction {
    private scope: Scope;
    private startPoint: Vec2;

    constructor(scope: Scope) {
        this.scope = scope;
        this.startPoint = new Vec2(0, 0);

        this.startListening();
    }

    private startListening(): void {
        this.scope.getContainer().addEventListener('mousedown', this.onMouseDown);
    }

    private stopListening(): void {
        this.scope.getContainer().removeEventListener('mousedown', this.onMouseDown);
    }

    private onMouseDown = (): void => {
        this.stopListening();

        document.addEventListener('mousemove', this.disregard);
        document.addEventListener('mouseup', this.startInteraction);
    }

    private disregard = (): void => {
        document.removeEventListener('mousemove', this.disregard);
        document.removeEventListener('mouseup', this.startInteraction);

        this.startListening();
    }

    private startInteraction = (e: MouseEvent): void => {
        document.removeEventListener('mousemove', this.disregard);
        document.removeEventListener('mouseup', this.startInteraction);

        document.addEventListener('mousemove', this.interact);
        document.addEventListener('mousedown', this.stopInteracion);

        this.startPoint = new Vec2(e.clientX, e.clientY);
    }

    private stopInteracion = (): void => {
        document.removeEventListener('mousemove', this.interact);
        document.removeEventListener('mousedown', this.stopInteracion);

        this.startListening();
    }

    private interact = (e: MouseEvent): void => {
        const startPoint = this.scope.unprojectSeed(this.startPoint);
        const point = this.scope.unprojectSeed(new Vec2(e.clientX, e.clientY));

        const newSeed = this.scope.getSeed().sub(point).add(startPoint);

        this.startPoint = new Vec2(e.clientX, e.clientY);

        this.scope.setSeed(newSeed);
    }
}
