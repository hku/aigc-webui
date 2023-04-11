import {
    IconPrompt,
    IconLanguage,
    IconPalette,
    IconBrandGoogle,
    IconPlayerStop,
    IconRepeat,
    IconSend,
  } from '@tabler/icons-react';
import { ReactElement } from 'react';

const ICONS_DICT: {[key: string]: ReactElement} = {
    IconLanguage: <IconLanguage size={20}/>,
    IconPalette: <IconPalette size={20}/>,
    IconPrompt: <IconPrompt size={20}/>
}

export default ICONS_DICT