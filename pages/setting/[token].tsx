import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

type TokenNames = (string | null)[] 
type TokenValues = (string | null)[] 

const Setting = () => {
    const { t } = useTranslation('setting');

    const router = useRouter()
    let { token } = router.query
    let modelId  = token as string


    // const env =  {
    // "openai": [
    //     "OPENAI_API_KEY"
    // ]
    // } as {[key:string]: string[]}

    // if(!Object.keys(env).includes(modelId)) {
    //     modelId = "gpt3-5"
    // }


    const [tokenNames, setTokenNames] = useState<TokenNames>([])
    const [tokenValues, setTokenValues] = useState<TokenValues>([])


    const handleChange = (e: any, idx: number) => {
        const _tokenValues = tokenValues.slice(0)
        _tokenValues[idx] = e.target.value
        setTokenValues(_tokenValues)
    } 


    const handleClear=()=>{
        setTokenValues(tokenValues.map(v => ''))

        tokenNames.forEach((n, idx)=>{
            localStorage.removeItem(n as string)
        })
    }

    const handleSave=()=>{
        tokenNames.forEach((n, idx)=>{
            localStorage.setItem(n as string, tokenValues[idx] as string)
        })
        if(tokenValues.some(v => !v?.trim())) {
            alert("some value is empty.")
        } else {
            alert("token saved, you may close the page now.")

        }
    }

    useEffect(()=>{

        const getTokenValues = async (tokenNames: string[]) => {
                    
            const res  = await fetch('/api/env', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tokenNames
                }),
            })

            const result = (await res.json()).result      
            
            return result
        }

        const initTokens = async (modelId: string)=>{

            let _tokenNames: TokenNames = []
             
            try {
                const scriptModule = await import(`../../addons/${modelId}/model`);
                _tokenNames = scriptModule.metadata.env
            } catch(e) {
                console.log(e)
                return 
            }
            const _tokenValues: TokenValues = _tokenNames.map(n => localStorage.getItem(n as string))
            
            setTokenNames(_tokenNames)
            setTokenValues(_tokenValues)
       
            if (_tokenValues.some(v=>!v)) {
                const _values = await getTokenValues(_tokenNames as string[])

                for(let i=0; i<_tokenValues.length; i++) {
                    _tokenValues[i] = _tokenValues[i] || _values[i]
                }
                setTokenValues(_tokenValues)
                setTimeout(handleSave , 1000)
            }
        }

        initTokens(modelId)


    }, [])



    return (<>
    <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-96">
            <h1 className="text-2xl font-bold mb-6 text-center">{token} Setting</h1>
            {
                tokenNames.map((n, idx) => {
                    return (
                    <div className="mb-4" key={idx}>
                        <label className="block text-sm font-medium text-gray-700">{n}</label>
                        <input id="openai_token"
                        value={tokenValues[idx] || ""}
                        onChange={e => handleChange(e, idx)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:border-indigo-500"/>
                    </div>
                    )
                })

            }

                <button 
                    onClick={handleClear}                
                 className="w-full bg-gray-500 text-white py-2 px-4 mb-2 rounded hover:bg-indigo-600 focus:outline-none">{t('clear')}</button>

                <button 
                    onClick={handleSave}                
                 className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 focus:outline-none">{t('save')}</button>

        </div>
    </div>

        {/* {tokenNames.map((n, idx) => {
            return <textarea 
            key={idx}
            className="m-0 w-full border-0 bg-gray-500 text-white dark:bg-white dark:text-white md:py-3 md:pl-10" />
        })} */}
    </>)





  
}


export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
    props: {
        ...(await serverSideTranslations(locale ?? 'en', [
          'setting',
        ])),
      },
    };
}
export default Setting