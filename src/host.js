const CONTEXT_READY_POLL_MS = 50;
const HOST_READY_TIMEOUT_MS = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isTauriTavern() {
    return Boolean(window.__TAURITAVERN__ || window.__TAURITAVERN_MAIN_READY__);
}

export function getTauriHost() {
    return window.__TAURITAVERN__ && typeof window.__TAURITAVERN__ === 'object'
        ? window.__TAURITAVERN__
        : null;
}

async function waitForStContext(timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (typeof window.SillyTavern?.getContext === 'function') return true;
        await sleep(CONTEXT_READY_POLL_MS);
    }
    return false;
}

async function waitForTauriReady(timeoutMs) {
    if (!isTauriTavern()) return true;

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const host = getTauriHost();
        const ready = host?.ready || window.__TAURITAVERN_MAIN_READY__;
        if (ready) {
            if (typeof ready.then === 'function') {
                await Promise.race([
                    Promise.resolve(ready).catch(() => null),
                    sleep(Math.max(1, deadline - Date.now())),
                ]);
            }
            return true;
        }
        await sleep(CONTEXT_READY_POLL_MS);
    }
    return false;
}

export async function waitForHostReady() {
    const [contextReady, hostReady] = await Promise.all([
        waitForStContext(HOST_READY_TIMEOUT_MS),
        waitForTauriReady(HOST_READY_TIMEOUT_MS),
    ]);
    return contextReady && hostReady;
}

export function applyHostSurface(element, surface) {
    if (!(element instanceof HTMLElement) || !surface) return;
    element.dataset.ttMobileSurface = surface;
}
