import { IconDefinition, library } from '@fortawesome/fontawesome-svg-core';
import { faBook as faBookL, faPen as faPenL } from '@fortawesome/pro-light-svg-icons';
import { faPlus, faTrashAlt, faBars, faAngleLeft, faPen } from '@fortawesome/pro-regular-svg-icons';
import { faInfo as faInfoS, faPlus as faPlusS, faBookOpen as faBookOpenS } from '@fortawesome/pro-solid-svg-icons';

const usedIcons: IconDefinition[] = [
    faAngleLeft,
    faBars,
    faPen,
    faPlus,
    faTrashAlt,
    faBookL,
    faPenL,
    faBookOpenS,
    faInfoS,
    faPlusS,
];

export function initFontAwesome() {
    library.add(...usedIcons);
    console.info('[INFO] initFontAwesome -- FontAwesome icons added to librabry.');
}