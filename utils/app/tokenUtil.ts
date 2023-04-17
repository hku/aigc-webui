import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
// import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

export const config = {
  runtime: 'edge',
};

export let tokenUtil: {
  encoding: Tiktoken | null
  [key: string]: any
} = {encoding: null}

async function loadWasm() {
    const response = await fetch('/media/tiktoken_bg.wasm');
    const wasm = await response.arrayBuffer();
    await init((imports) => WebAssembly.instantiate(wasm, imports));

    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );
    
    tokenUtil.encoding = encoding
}

loadWasm()
