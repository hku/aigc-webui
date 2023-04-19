import { Message, MessageMetadata } from '@/types/chat';
import { AddonModel } from '@/types/addon';
import { Prompt } from '@/types/prompt';
import {
  IconPrompt,
  IconLanguage,
  IconBolt,
  IconBrandGoogle,
  IconPlayerStop,
  IconRepeat,
  IconSend,
  IconUpload,
  IconMicrophone,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  FC,
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';
import { AddinModifier, AddinModifierID, FileLoader } from '@/types/addin';
import { AddinSelect } from './AddinSelect';
import ICONS_DICT from '../../config/icons';
import { IconDots } from '@tabler/icons-react';
import PDFButton from './pdfButton';
import pdf2text from '@/utils/app/pdf2text';
import { tokenUtil } from '@/utils/app/tokenUtil';
import { MAX_TOKEN_COUNT } from '@/utils/app/const';
import { toast } from 'react-hot-toast';
import promptModifier from '@/addins';
import SpeechButton from './speechButton';

interface Props {
  messageIsStreaming: boolean;
  model: AddonModel;
  addinModifiers: AddinModifier[];
  fileLoaderDict: {[key: string]: FileLoader},
  conversationIsEmpty: boolean;
  prompts: Prompt[];
  onSend: (message: Message, addinId: AddinModifierID | null) => void;
  onRegenerate: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: FC<Props> = ({
  messageIsStreaming,
  model,
  addinModifiers,
  fileLoaderDict,
  conversationIsEmpty,
  prompts,
  onSend,
  onRegenerate,
  stopConversationRef,
  textareaRef,
}) => {

  const { t } = useTranslation('chat');

  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAddinSelect, serShowAddinSelect] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [addinId, setAddinId] = useState<AddinModifierID | null>(null);

  const promptListRef = useRef<HTMLUListElement | null>(null);
  const refPDFButton = useRef<HTMLButtonElement|null>(null)
  const refSpeechButton = useRef<HTMLButtonElement|null>(null)
  
  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    updatePromptListVisibility(value);
  };

  


  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }


    const metadata: MessageMetadata = {}
    if(tokenUtil.encoding) {
      const tokens = tokenUtil.encoding.encode(content)
      let tokenCount = tokens.length;
      metadata.tokenCount = tokenCount
    }

    onSend({role: 'user', content,  metadata}, addinId);

    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const _handleSpeechSend = (content: string) => {
    // if (messageIsStreaming) {
    //   return;
    // }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }


    const metadata: MessageMetadata = {}
    if(tokenUtil.encoding) {
      const tokens = tokenUtil.encoding.encode(content)
      let tokenCount = tokens.length;
      metadata.tokenCount = tokenCount
    }

    onSend({role: 'user', content,  metadata}, addinId);

    setContent('');

    if (refSpeechButton && refSpeechButton.current) {
        // triggle onblur
        refSpeechButton.current.blur()
        setTimeout(()=>{
          if(refSpeechButton && refSpeechButton.current) {
            //for triggle blur next time
            refSpeechButton.current.focus()
            //start speech recg again
            refSpeechButton.current.click()
          }
        },2000)
    }
  }; 
  
  const handleFileChange = async (file: File) => {

    if (messageIsStreaming) {
      return;
    }



    // const matches = /application\/(\w*)$/.exec(file.type)
    // const fileType = matches && matches[1]

    const fileType = (file.name).split('.').slice(-1)[0]



    const fileLoader = fileLoaderDict && fileLoaderDict[fileType as string]

    console.log(file.name)

    if (fileLoader) {
      try {
        const {content, metadata} = await promptModifier.load_content(file, fileLoader.id)
        
        onSend({role: 'user', content,  metadata}, addinId);

      } catch(e) {
        toast.error('failed load the file')
        return
      }

    //   let content = (await pdf2text(file)).trim();


    //   if (!content) {
    //     alert(t('Please enter a message'));
    //     return;
    //   }

    //   const metadata: MessageMetadata = {}
    //   if(tokenUtil.encoding) {
    //     const tokens = tokenUtil.encoding.encode(content)
    //     let tokenCount = tokens.length;
    //     metadata.tokenCount = tokenCount
    //     metadata.fromFile = file.name
    //   }

    //   content = `## ${file.name}\n\n${content}`

    } else {
      toast.error("file not supported")
    }

  }

  const handleSpeechResult = ({lastContent, text}: {lastContent: string, text: string}) => {
    console.log(`handleSpeech:${text}`)    
    text = text.replace(/嗯|呃/g, '')

    const speechCmds: ({reg: RegExp, cmd: ()=> void})[] = [
      {
        reg: /^(开始干活)|(回答问题)/,
        cmd: () => _handleSpeechSend(lastContent)
      }
    ]

    for(const {reg, cmd} of speechCmds) {
      if(reg.test(text)) { 
        cmd(); 
        return 
      }
    }
    setContent(lastContent + ' ' + text)

  }

  const handleStopConversation = () => {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 1000);
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex];
    if (selectedPrompt) {
      setContent((prevContent) => {
        const newContent = prevContent?.replace(
          /\/\w*$/,
          selectedPrompt.content,
        );
        return newContent;
      });
      handlePromptSelect(selectedPrompt);
    }
    setShowPromptList(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === '/' && e.metaKey) {
      e.preventDefault();
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent?.replace(/\/\w*$/, prompt.content);
        return updatedContent;
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = content?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setContent(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 30;
    }
  }, [activePromptIndex]);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        promptListRef.current &&
        !promptListRef.current.contains(e.target as Node)
      ) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const getAddinIcon = (addinId: AddinModifierID | null) => {
    if(addinId) {

      const theAddin = addinModifiers.find(a=>a.id===addinId)
      if(theAddin && theAddin.icon && ICONS_DICT[theAddin.icon]) {
        
        return ICONS_DICT[theAddin.icon]
      }
    }
    return ICONS_DICT["IconPrompt"] || <IconPrompt size={20} />
  }

  const getAddinDesc = (addinId: AddinModifierID | null) => {
    const theAddin = addinModifiers.find(a => a.id === addinId)
    const desc = theAddin?.description || "no description available"
    return desc
  } 



  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {messageIsStreaming && (
          <button
            className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} /> {t('Stop Generating')}
          </button>
        )}

        {!messageIsStreaming && !conversationIsEmpty && (
          <button
            className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={onRegenerate}
          >
            <IconRepeat size={16} /> {t('Regenerate response')}
          </button>
        )}

        <div className="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:mx-4">
        <div className="relative group">
          <button
            className="absolute left-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => serShowAddinSelect(!showAddinSelect)}
            onKeyDown={(e) => {}}
          >
            {getAddinIcon(addinId)}
          </button>

          <div className="absolute top-0 -mt-10 px-2 py-1 text-xs text-white bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition duration-300">
                {getAddinDesc(addinId)}
            </div>
        </div>



          {showAddinSelect && (
            <div className="absolute left-0 bottom-14 rounded bg-white dark:bg-[#343541]">
              <AddinSelect
                addinModifiers = {addinModifiers}
                addinId={addinId}
                onKeyDown={(e: any) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    serShowAddinSelect(false);
                    textareaRef.current?.focus();
                  }
                }}
                 onAddinChange={(addinId: AddinModifierID | null) => {
                  setAddinId(addinId);
                  serShowAddinSelect(false);

                  if (textareaRef && textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 py-2 pr-8 pl-10 text-black dark:bg-transparent dark:text-white md:py-3 md:pl-10"
            style={{
              resize: 'none',
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: '400px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 400
                  ? 'auto'
                  : 'hidden'
              }`,
            }}
            placeholder={
              t('Type a message or type "/" to select a prompt...') || ''
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          {showMore && (
            <div
              className="absolute bottom-full right-10 w-64 py-0 bg-white shadow-md border border-gray-200"
              // onMouseEnter={() => setShowMore(true)}
              // onMouseLeave={() => setShowMore(false)}
            >
              <PDFButton refbtn={refPDFButton} onChange={handleFileChange}/>
              <SpeechButton refbtn={refSpeechButton} prefix={content || ''} 
              onResult={(res) => handleSpeechResult(res)}/>
            </div>
          )}

          <button
            className="absolute right-10 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
          >
            {messageIsStreaming ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconDots size={18} 
              onClick={() => setShowMore(!showMore)}
              />
            )}
          </button>

          <button
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={handleSend}
          >
            {messageIsStreaming ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>

          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptList
                activePromptIndex={activePromptIndex}
                prompts={filteredPrompts}
                onSelect={handleInitModal}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}

          {isModalVisible && (
            <VariableModal
              prompt={prompts[activePromptIndex]}
              variables={variables}
              onSubmit={handleSubmit}
              onClose={() => setIsModalVisible(false)}
            />
          )}
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
        <a
          href="https://github.com/hku/aigc-webui"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          AIGC-webui
        </a>
        .{' '}
        {t(
          "AIGC-webui is an universal webui for AI Content Generation.",
        )}
      </div>
    </div>
  );
};
