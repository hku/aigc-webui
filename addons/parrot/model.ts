import { Message } from "@/types/chat"

export const metadata = {
    name: 'parrot',
    description: `
This is an addon example, which simply repeat your text input... 
`
}

export default async function generate(messages: Message[], prompt='') {

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "?"  
  return txt

}



