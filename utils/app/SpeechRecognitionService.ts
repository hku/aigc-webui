class SpeechRecognitionService {
    private recognition: SpeechRecognition | null = null;
    private isListening = false;
    private onResultCallback: ((text: string) => void) = ()=>{};
    private onErrorCallback: ((error: string) => void) = ()=>{};
  
    constructor() {
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new SpeechRecognition();
      } else {
        console.error('Speech recognition is not supported in this browser.');
        return;
      }
  
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'auto';
      

      this.recognition.onresult = (event) => {
        if (this.onResultCallback) {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            this.onResultCallback(result[0].transcript.trim());
          }
        }
      };
      
      this.recognition.onerror = (event) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        if (this.isListening) {
          // Automatically restart the service if an error occurs while listening
          setTimeout(() => this.start(this.onResultCallback, this.onErrorCallback), 100);
        }
      };
    }
  
    public start(onResult: (text: string) => void, onError: (error: string) => void = ()=>{}): void {
      if (!this.recognition) {
        console.error('Speech recognition is not available.');
        return;
      }
  
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.isListening = true;
      this.recognition.start();
    }
    

    public restart(): void {
        try {
            if(this.recognition) {

                
                this.recognition.onend = ()=>{
                    console.log("ending")
                    this.recognition?.start()
                    this.recognition && (this.recognition.onend = () => {})
                }

                this.recognition.stop();
            }
        } catch(e) {
            console.log('restart failed')
        }
    }

    public stop(): void {
      if (this.recognition) {
        this.isListening = false;
        this.recognition.stop();
      }
    }
  
    public setLanguage(languageCode: string): void {
      if (this.recognition) {
        this.recognition.lang = languageCode;
      }
    }
  }
  
  export default SpeechRecognitionService;
  