import { AddonModel, AddonModelID } from '@/types/addon';
import { useTranslation } from 'next-i18next';
import { IconExternalLink } from '@tabler/icons-react';
import { FC } from 'react';

interface Props {
  model: AddonModel;
  models: AddonModel[];
  defaultModelId: AddonModelID;
  onModelChange: (model: AddonModel) => void;
}

export const ModelSelect: FC<Props> = ({
  model,
  models,
  defaultModelId,
  onModelChange,
}) => {
  const { t } = useTranslation('chat');

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <div className="relative group">
          <select
            className="w-full bg-transparent p-2"
            placeholder={t('Select a model') || ''}
            value={model?.id || defaultModelId}
            onChange={(e) => {
              onModelChange(
                models.find(
                  (model) => model.id === e.target.value,
                ) as AddonModel,
              );
            }}
          >
            {models.map((model) => (
              <option
                key={model.id}
                value={model.id}
                className="dark:bg-[#343541] dark:text-white"
              >
                {model.id === defaultModelId
                  ? `Default (${model.name})`
                  : model.name}
              </option>
            ))}
          </select>
          <div className="absolute top-0 -mt-12 px-2 py-1 text-xs text-white bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition duration-300">
                {model.description}
            </div>
        </div>
      </div>
      {['gpt3-5', 'gpt3-5-enhanced'].includes(model.id)?<div className="w-full mt-3 text-left text-neutral-700 dark:text-neutral-400 flex items-center">
        <a href="https://platform.openai.com/account/usage" target="_blank" className="flex items-center">
          <IconExternalLink size={18} className={"inline mr-1"} />
          {t('View Account Usage')}
        </a>
      </div>:<></>}
    </div>
  );
};
