// Registramos GSAP/ScrollTrigger/ScrollTo una sola vez y exportamos la instancia.
import { gsap as _gsap } from 'gsap';
import { ScrollTrigger as _ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin as _ScrollToPlugin } from 'gsap/ScrollToPlugin';

let didRegister = false;

export function setupGsap() {
  if (!didRegister) {
    _gsap.registerPlugin(_ScrollTrigger, _ScrollToPlugin);
    didRegister = true;
  }
}

export const gsap = _gsap;
export const ScrollTrigger = _ScrollTrigger;

export const ScrollToPlugin = _ScrollToPlugin;