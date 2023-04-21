import { Message } from '@/types/chat';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconBrandReddit,
  IconUser,
  IconStar,
  IconStarFilled,
  IconCircle,
  IconCircleMinus,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, memo, useEffect, useRef, useState } from 'react';
import rehypeMathjax from 'rehype-mathjax';
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { MAX_TOKEN_COUNT } from '@/utils/app/const';

interface Props {
  message: Message;
  messageIndex: number;
  hasMarker?: boolean;
  onEditMessage: (message: Message, messageIndex: number, update?: boolean) => void;
  onDeleteMessage: (messageIndex: number) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({ message, messageIndex, onEditMessage, onDeleteMessage, hasMarker=false}) => {
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const toggleEditing = () => {
      setIsEditing(!isEditing);
    };

    const handleInputChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setMessageContent(event.target.value);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const handleEditMessage = () => {
      if (message.content != messageContent) {
        onEditMessage({ ...message, content: messageContent }, messageIndex);
      }
      setIsEditing(false);
    };


    const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
        e.preventDefault();
        handleEditMessage();
      }
    };

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(message.content).then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    return (
      <div
        className={`group px-4 ${
          message.role === 'assistant'
            ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
            : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
        }`}
        style={{ overflowWrap: 'anywhere' }}
      >
        <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className="min-w-[40px] text-right font-bold">
            {message.role === 'assistant' ? (
              <IconBrandReddit size={30} />
            ) : (
              <IconUser size={30} />
            )}
          </div>

          <div className="prose mt-[-2px] w-full dark:prose-invert">
            {message.role === 'user' ? (
              <div className="flex w-full">
                {isEditing ? (
                  <div className="flex w-full flex-col">
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
                      value={messageContent}
                      onChange={handleInputChange}
                      onKeyDown={handlePressEnter}
                      onCompositionStart={() => setIsTyping(true)}
                      onCompositionEnd={() => setIsTyping(false)}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        padding: '0',
                        margin: '0',
                        overflow: 'hidden',
                      }}
                    />

                    <div className="mt-10 flex justify-center space-x-4">
                      <button
                        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleEditMessage}
                        disabled={messageContent.trim().length <= 0}
                      >
                        {t('Save & Submit')}
                      </button>
                      <button
                        className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setMessageContent(message.content);
                          setIsEditing(false);
                        }}
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // <div className="prose whitespace-pre-wrap dark:prose-invert">
                  //   {message.content}
                  // </div>
                  <MemoizedReactMarkdown
                  className={`prose dark:prose-invert ${message.metadata?.marked?"text-green-500":hasMarker?"text-gray-500":""}`}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeMathjax, rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');

                      return !inline ? (
                        <CodeBlock
                          key={Math.random()}
                          language={(match && match[1]) || ''}
                          value={String(children).replace(/\n$/, '')}
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                          {children}
                        </table>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="break-words border border-black px-3 py-1 dark:border-white">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.metadata?.tokenCount>MAX_TOKEN_COUNT?message.content.slice(0, 1000) + '....':message.content}
                </MemoizedReactMarkdown>
                )}

                {(!isEditing) && (
                  <div
                    className={`absolute ${
                      window.innerWidth < 640
                        ? 'bottom-1 right-3'
                        : 'right-0 top-[26px] m-0'
                    }`}
                  > 
                  <button
                    className={`translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300`}
                    onClick={toggleEditing}
                  >
                    <IconEdit size={20} />
                  </button>
                  
                  <div className='relative inline-block'>
                  <button
                    className="translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={()=>{
                      const marked = !message.metadata?.marked
                      const metadata = {...(message.metadata || {}), marked}
                      onEditMessage({...message, metadata}, messageIndex, false);
                    }}
                  >
                    <IconStarFilled size={20} className={`translate-x-2 ${message.metadata?.marked?"text-green-500":""}`}/>
                  </button>                
                  <div className="absolute w-48 left-10 -mt-24 px-2 py-1 text-xs text-white bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition duration-300">
                    when some of the green Lanterns are lighted, the gpt answer will focus on the lighted messages.
                    </div>
                  </div>
                  
                  

                  </div>
                )}

                {(!isEditing) && (
                  <div
                    className={`absolute ${
                      window.innerWidth < 640
                        ? 'bottom-1 left-0'
                        : 'left-[-100px] top-[26px] m-0'
                    }`}
                  > 
                  <button
                    className={`translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300`}
                    onClick={()=> {onDeleteMessage(messageIndex)}}
                  >
                    <IconCircleMinus size={20} />
                  </button>
                  </div>
                )}
              </div>
            ) : (
              <>

              
                <div
                    className={`absolute ${
                      window.innerWidth < 640
                        ? 'bottom-1 left-0'
                        : 'left-[-100px] top-[26px] m-0'
                    }`}
                  > 
                  <button
                    className={`translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300`}
                    onClick={()=> {onDeleteMessage(messageIndex)}}
                  >
                    <IconCircleMinus size={20} />
                  </button>
                </div>
                
                <div
                  className={`absolute ${
                    window.innerWidth < 640
                      ? 'bottom-1 right-3'
                      : 'right-0 top-[26px] m-0'
                  }`}
                >

                  <button
                      className="translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={copyOnClick}
                    >
                    {messagedCopied ? (
                    <IconCheck
                      size={20}
                      className="text-green-500 dark:text-green-400"
                    />
                    ) : (
                        <IconCopy size={20} />
                    )}
                  </button>
                  <div className='relative inline-block'>
                  <button
                      className="translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={()=>{
                        const marked = !message.metadata?.marked
                        const metadata = {...(message.metadata || {}), marked}
                        onEditMessage({...message, metadata}, messageIndex, false);
                      }}
                  >
                    <IconStarFilled size={20} className={`translate-x-2 ${message.metadata?.marked?"text-green-500":""}`}/>
                  </button>

                    <div className="absolute w-48 left-10 -mt-24 px-2 py-1 text-xs text-white bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition duration-300">
                    when some of the green Lanterns are lighted, the gpt answer will focus on the lighted messages.
                    </div>
                  </div>
                </div>

                <MemoizedReactMarkdown
                  className={`prose dark:prose-invert ${message.metadata?.marked?"text-green-500":hasMarker?"text-gray-500":""}`}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeMathjax, rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');

                      return !inline ? (
                        <CodeBlock
                          key={Math.random()}
                          language={(match && match[1]) || ''}
                          value={String(children).replace(/\n$/, '')}
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                          {children}
                        </table>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="break-words border border-black px-3 py-1 dark:border-white">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </MemoizedReactMarkdown>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';
