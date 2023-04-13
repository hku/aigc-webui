import Replicate from "replicate";
import { Message } from '@/types/chat';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'replicate-riffusion',
    description: `
    this is the model agent for music generation powered by riffusion api on replicate.
The favorable language for this model is English.
`
}

export default async function generate(messages: Message[], prompt='') {


  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "funky synth solo"

  const output = await replicate.run(
    "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
    {
      input: {
        prompt_a: txt
      }
    }
  ) as {[key: string]: any};

  const {audio, spectrogram} = output
  
  return `
  <div>
    <audio controls="controls">
      <source type="audio/wav" src="${audio}"></source>
    </audio>
  </div>
  <div>
    <img src=${spectrogram} alt="spectrogram"/>
  </div>
  `
}


