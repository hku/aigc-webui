import SpeechRecognitionService from "@/utils/app/SpeechRecognitionService";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react"
import { Stardos_Stencil } from "next/font/google";
import { useEffect, useState } from "react";



interface LanguageSelectorProps {
  languages: { code: string; label: string }[];
  disabled: boolean | undefined;
  selectedCode: string;
  onSelectLanguage: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ languages, disabled, selectedCode, onSelectLanguage }) => {
  return (
    <select disabled={disabled}
    className="flex w-1/2"
    value={selectedCode} onChange={(e) => onSelectLanguage(e.target.value)}>
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.label}
        </option>
      ))}
    </select>
  );
};


interface Result {
    lastContent: string; 
    text: string
}

interface Props{
    refbtn: React.MutableRefObject<HTMLButtonElement | null>
    prefix?: string
    onStart?: () => void 
    onResult: ({lastContent, text}: Result)=>void
}

const speechHistory: string[] = []

const SpeechButton = ({refbtn, prefix ='', onStart=()=>{}, onResult}: Props) => {
    let lastContent = prefix
    
    const [isListening, setIsListening] = useState(false);
    const [selectedCode, setSelectedCode] = useState('auto');
    const [speechRecognitionService, setSpeechRecognitionService] = useState<SpeechRecognitionService | null>(null);
  
    const languages = [
        { "code": "auto", "label": "auto detect" },
        { "code": "en-US", "label": "English (US)" },
        { "code": "zh-CN", "label": "中文（中国）" },
        { "code": "en-GB", "label": "English (UK)" },
        { "code": "hi-IN", "label": "हिन्दी" },
        { "code": "fr-FR", "label": "Français" },
        { "code": "de-DE", "label": "Deutsch" },
        { "code": "ru-RU", "label": "Русский" },
        { "code": "es-ES", "label": "Español (España)" },
        { "code": "es-419", "label": "Español (Latinoamérica)" },
        { "code": "pt-PT", "label": "Português (Portugal)" },
        { "code": "pt-BR", "label": "Português (Brasil)" },
        { "code": "id-ID", "label": "Bahasa Indonesia" },
        { "code": "ja-JP", "label": "日本語" },
    ]


    useEffect(() => {
      setSpeechRecognitionService(new SpeechRecognitionService());
    }, []);

    useEffect(() => {
        if (speechRecognitionService) {
          speechRecognitionService.setLanguage(selectedCode);
        }
    }, [selectedCode, speechRecognitionService]);


    function stopListening () {
        if (speechRecognitionService) {
            speechRecognitionService.stop();
            setIsListening(false);
          }
    }

    function startListening(){
        if (speechRecognitionService) {
            speechRecognitionService.start(
              (text) => {


                    if(/^(删除|撤回)/.test(text)) {
                        if(speechHistory.length > 0) {
                            lastContent = speechHistory.pop() || ''
                            onResult({lastContent, text: ''})
                        }
                        return 
                    }

                    if(/^\s*speak\s*Chinese/i.test(text)) {
                        console.log(`task: ${text}`)
                        setSelectedCode('zh-CN')
                        if (speechRecognitionService) {
                            speechRecognitionService.restart()
                        }                        
                        return 
                    }

                    if(/^(说英文|切换英文)/i.test(text)) {
                        console.log(`task: ${text}`)
                        setSelectedCode('en-US')
                        if (speechRecognitionService) {
                            speechRecognitionService.restart()
                        }
                        return 
                    }

                    onResult({lastContent, text})
                    speechHistory.push(lastContent)
                    lastContent =  lastContent + ' ' + text
                    console.log(text)
                },
              (error) => {
                console.error(`Error: ${error}`);
              }
            );
            setIsListening(true);

            //empty history before start
            speechHistory.splice(0, speechHistory.length);
            
            onStart()
        }
    }

    function toggleListening (){
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    };

    // function restartListening() {
    //     stopListening()
    //     startListening()
    // }

    
      return (<div className="flex w-full text-left px-4 py-2 text-gray-900">
        <button 
        ref={refbtn}
        onClick={toggleListening}
        onBlur={()=>{
            console.log("on blur")  
            stopListening()
        }}
        // onBlur={()=>{
        //     // speechRecognitionService && speechRecognitionService.restart()
        // }}
        className={`flex w-1/2 ${isListening?"text-green-500":"text-gray-900"} hover:text-white hover:bg-blue-500 `}>
            {isListening? <IconMicrophoneOff size={18} className="mr-2"/>:<IconMicrophone size={18} className="mr-2"/>} Speak 
        </button>
        <LanguageSelector
        disabled = {isListening?true:undefined}
        languages={languages}
        selectedCode={selectedCode}
        onSelectLanguage={(languageCode) => setSelectedCode(languageCode)}
      />

    </div>)
}

export default SpeechButton