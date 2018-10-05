import { library } from '@fortawesome/fontawesome-svg-core';
import { fal } from '@fortawesome/pro-light-svg-icons';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

/**
 * Initialzies the Font Awesome icon library.
 */
export function initFontAwesome() {
    library.add(fal, far, fas, fab);
    console.info('[INFO] initFontAwesome -- FontAwesome icons added to librabry.');
}