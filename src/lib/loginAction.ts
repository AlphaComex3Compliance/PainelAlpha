'use server'    

import { signIn } from "../../auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export default async function loginAction(_prevState: any, formData: FormData){
    
    try{
        await signIn('credentials', {
            email: formData.get('email') as string,
            senha: formData.get('senha') as string,
            redirect: true,
            redirectTo: '/PainelAlpha'
        });
        
        return {success: true}

    }catch (e: any){
        if(isRedirectError(e)){
            throw e;
        }

        if(e.type === 'CredentialsSignin')
        return {success: false, message: 'Dados de Login Incorretos'}
    }

    return {success: false, message: 'Ops, algum erro aconteceu!!'}
}