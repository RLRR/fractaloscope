import { Scope } from './scope';

const instructionsElement = !isMobile()
    ? document.querySelector('.instructions.mouse') as HTMLDivElement
    : document.querySelector('.instructions.touch') as HTMLDivElement;

const dragElement = instructionsElement.querySelector('.instruction.drag') as HTMLDivElement;
const zoomElement = instructionsElement.querySelector('.instruction.zoom') as HTMLDivElement;
const morphElement = instructionsElement.querySelector('.instruction.morph') as HTMLDivElement;

instructionsElement.classList.add('visible');

const scope = window.scope = new Scope(
    document.querySelector('.display') as HTMLElement,
    document.querySelector('.sound') as HTMLAudioElement,
);

const startSeed = scope.getSeed();
const startCenter = scope.getCenter();
const startZoom = scope.getZoom();

scope.on('drag', () => {
    if (scope.getCenter().sub(startCenter).length() > 0.1) {
        dragElement.classList.add('hidden');
        scope.off('drag');
    }
});

scope.on('zoom', () => {
    if (Math.abs(scope.getZoom() - startZoom) > 0.25) {
        zoomElement.classList.add('hidden');
        scope.off('zoom');
    }
});

scope.on('morph', () => {
    if (scope.getSeed().sub(startSeed).length() > 0.01) {
        morphElement.classList.add('hidden');
        scope.off('morph');
    }
});

function isMobile() {
    return window.orientation !== undefined
        || navigator.userAgent.toLowerCase().indexOf('mobile') !== -1;
}
