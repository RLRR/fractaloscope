import { Scope } from './scope';

if (isWebGlSupported()) {
    init();
} else {
    (document.getElementById('no-webgl') as HTMLDivElement).style.display = 'table';
}

function init(): void {
    document.body.classList.add(!isMobile() ? 'desktop' : 'mobile');

    const tipsClass = !isMobile() ? '.tips.mouse' : '.tips.touch';
    const dragElement = document.querySelector(`${tipsClass} .drag`) as HTMLDivElement;
    const zoomElement = document.querySelector(`${tipsClass} .zoom`) as HTMLDivElement;
    const morphElement = document.querySelector(`${tipsClass} .morph`) as HTMLDivElement;

    const scope = window.scope = new Scope(
        document.querySelector('.display') as HTMLElement,
        document.querySelector('.audio') as HTMLAudioElement,
    );

    const startSeed = scope.getSeed();
    const startCenter = scope.getCenter();
    const startZoom = scope.getZoom();

    scope.on('drag', () => {
        if (scope.getCenter().sub(startCenter).length() > 0.05) {
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
        const threshold = 0.04 / Math.pow(2, scope.getZoom());

        if (scope.getSeed().sub(startSeed).length() > threshold) {
            morphElement.classList.add('hidden');
            scope.off('morph');
        }
    });

    const soundElement = document.querySelector('.button.sound') as HTMLDivElement;
    const soundOnElement = soundElement.querySelector('.on') as HTMLImageElement;
    const soundOffElement = soundElement.querySelector('.off') as HTMLImageElement;

    let isPlayingAudio = false;

    soundElement.addEventListener('click', () => {
        if (!isPlayingAudio) {
            scope.playAudio();
            soundOnElement.classList.remove('hidden');
            soundOffElement.classList.add('hidden');
            soundElement.setAttribute('title', 'Disable audio');
            isPlayingAudio = true;
        } else {
            scope.pauseAudio();
            soundOnElement.classList.add('hidden');
            soundOffElement.classList.remove('hidden');
            soundElement.setAttribute('title', 'Enable audio');
            isPlayingAudio = false;
        }
    });

    const hdElement = document.querySelector('.button.hd') as HTMLDivElement;
    const hdOnElement = hdElement.querySelector('.on') as HTMLImageElement;
    const hdOffElement = hdElement.querySelector('.off') as HTMLImageElement;

    let hdMode = false;

    hdElement.addEventListener('click', () => {
        if (!hdMode) {
            scope.enableHd();
            hdOnElement.classList.remove('hidden');
            hdOffElement.classList.add('hidden');
            hdElement.setAttribute('title', 'Disable HD');
            hdMode = true;
        } else {
            scope.disableHd();
            hdOnElement.classList.add('hidden');
            hdOffElement.classList.remove('hidden');
            hdElement.setAttribute('title', 'Enable HD');
            hdMode = false;
        }
    });

    function updateHd(): void {
        if (window.devicePixelRatio > 1) {
            hdElement.classList.remove('hidden');
        } else {
            hdElement.classList.add('hidden');
        }
    }

    updateHd();
    window.addEventListener('resize', updateHd);
}

function isMobile() {
    return window.orientation !== undefined
        || navigator.userAgent.toLowerCase().indexOf('mobile') !== -1;
}

function isWebGlSupported(): boolean {
    try {
        return 'WebGLRenderingContext' in window
            && !!document.createElement('canvas').getContext('webgl', {
                failIfMajorPerformanceCaveat: true,
            });
    } catch (e) {
        return false;
    }
}
