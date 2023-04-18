// PDFButton.tsx
import React, { useRef, useState, useTransition } from 'react';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

interface Props {
  onChange: (f:File) => void
}

const PDFButton = ({onChange}: Props) => {

  const { t } = useTranslation('chat');


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onChange(file)
    }

    e.target.value = '';
  };

  const refInput = useRef<HTMLInputElement|null>(null)

  return (
    <>
        <button className="flex w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
            onClick={()=> refInput && refInput.current && refInput.current.click()}>
            <IconUpload size={18} className="mr-2"/> {t('Import File')}
        </button>
        <input ref={refInput} style={{width:0, height:0, visibility:"hidden"}}
            type="file"
            id="pdf-file"
            accept=".pdf, .doc, .docx, .xls, .xlsx"
            onChange={handleFileChange}
            className="hidden"
        />
    </>
    )
}

export default PDFButton