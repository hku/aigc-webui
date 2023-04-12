import { FC, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { AddinModifier, AddinModifierID } from '@/types/addin';


interface Props {
  addinId: AddinModifierID | null;
  addinModifiers: AddinModifier[];
  onAddinChange: (addinId: AddinModifierID | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLSelectElement>) => void;
}

export const AddinSelect: FC<Props> = ({
  addinId,
  onAddinChange,
  addinModifiers,
  onKeyDown,
}) => {

  const { t } = useTranslation('chat');
//   const [desc, setDesc] = useState<string| null>(null)
  const selectRef = useRef<HTMLSelectElement>(null);

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
//     const selectElement = selectRef.current;
//     const optionCount = selectElement?.options.length || 0;

//     if (e.key === '/' && e.metaKey) {
//       e.preventDefault();
//       if (selectElement) {
//         selectElement.selectedIndex =
//           (selectElement.selectedIndex + 1) % optionCount;
//         selectElement.dispatchEvent(new Event('change'));
//       }
//     } else if (e.key === '/' && e.shiftKey && e.metaKey) {
//       e.preventDefault();
//       if (selectElement) {
//         selectElement.selectedIndex =
//           (selectElement.selectedIndex - 1 + optionCount) % optionCount;
//         selectElement.dispatchEvent(new Event('change'));
//       }
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (selectElement) {
//         selectElement.dispatchEvent(new Event('change'));
//       }

//       onAddinChange(
//         PluginList.find(
//           (plugin) =>
//             plugin.name === selectElement?.selectedOptions[0].innerText,
//         ) as Plugin,
//       );
//     } else {
//       onKeyDown(e);
//     }
//   };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, []);

//   useEffect(()=>{
//     const theAddin = addinModifiers.find(a => a.id === addinId)
//     const desc = theAddin?.description || null
//     setDesc(desc)
//   }, [addinModifiers, addinId])

  return (
    <div className="flex flex-col">
      <div className="relative group mb-1 w-full rounded border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          ref={selectRef}
          className="w-full cursor-pointer bg-transparent p-2"
          placeholder={t('Select a modifier') || ''}
          value={addinId || ''}
          onChange={(e) => {
            onAddinChange(e.target.value);
          }}
        >
          <option
            key="empty"
            value="Empty"
            className="dark:bg-[#343541] dark:text-white"
          >
            No Modifier
          </option>

          {addinModifiers.map((a) => (
            <option
              key={a.id}
              value={a.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {a.name}
            </option>
          ))}
        </select>
{/* 
        {desc?<div style={{
            minWidth: '300px',
            marginTop: '-50px'
        }} className="absolute top-0 px-2 py-1 text-xs text-white bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition duration-300">
            {desc}
        </div>:<></>} */}
      </div>
    </div>
  );
};
