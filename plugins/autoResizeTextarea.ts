import { defineNuxtPlugin } from '#app';

const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    const newHeight = el.scrollHeight + 8;
    el.style.height = newHeight + 'px';
};

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('autoresize', {
        mounted(el: HTMLElement) {
            if (el.tagName !== 'TEXTAREA') return;
            resizeTextarea(el as HTMLTextAreaElement);
            el.addEventListener('input', () => resizeTextarea(el as HTMLTextAreaElement));
        },
        updated(el: HTMLElement) {
            if (el.tagName !== 'TEXTAREA') return;
            resizeTextarea(el as HTMLTextAreaElement);
        }
    })
})
