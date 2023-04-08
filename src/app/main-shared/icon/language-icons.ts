import type { Languages } from '@core/utility/i18n/languages';
import type { Icon } from './icon.component';

export const languageIcons: Required<Languages<Icon>> = {
    eng: {
        svg: '<path fill="#00247d" d="M0 0h25v15H0z"/><path d="M0 0l25 15m0-15L0 15" stroke="#fff" stroke-width="3"/><path d="M12.5 0v15M0 7.5h25" stroke="#fff" stroke-width="5"/><path d="M12.5 0v15M0 7.5h25" stroke="#cf142b" stroke-width="3"/>',
        viewbox: '0 0 25 15',
    },
    ger: {
        svg: '<path fill="#000" d="M0 0h5v3H0z"/><path fill="#D00" d="M0 1h5v2H0z"/><path fill="#FFCE00" d="M0 2h5v1H0z"/>',
        viewbox: '0 0 5 3',
    },
};
