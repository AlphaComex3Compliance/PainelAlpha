'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import AlphaSchoolsWelcome from './AlphaSchoolsWelcome';
import SalaDeAulaAlpha from './SaladeAula';
import { getTema } from "@/lib/temas";
import { getPresetCompletoAction } from '@/actions/questoes';
import { buscarProgressosUsuario } from '@/actions/questoes';

export default function PaginaAlphaSchools() {
    const { data: session } = useSession();
    const [view, setView] = useState<'welcome' | 'sala'>('welcome');
    const [presetData, setPresetData] = useState<any>(null);
    const [idsAssistidos, setIdsAssistidos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const temaNome = (session?.user as any)?.tema_interface || "blue";
    const style = getTema(temaNome);

    const entrarNaSala = async () => {
        const user = session?.user as any;
        const presetId = user?.presetId;

        if (presetId && user?.id) {
            setLoading(true);
            const data = await getPresetCompletoAction(presetId);
            
            if (data) {
                const videoIds = data.videos?.map((v: any) => v.id) || [];
                const assistidos = await buscarProgressosUsuario(user.id, videoIds);
                
                setIdsAssistidos(assistidos);
                setPresetData(data);
                setView('sala');
            }
            setLoading(false);
        }
    };

    if (view === 'sala' && presetData) {
        return (
            <SalaDeAulaAlpha
                preset={presetData}
                temaConfig={style}
                userId={(session?.user as any).id}
                progressosIniciais={idsAssistidos}
                onVoltar={() => setView('welcome')}
            />
        );
    }

    return (
        <AlphaSchoolsWelcome onEnter={entrarNaSala} loading={loading} />
    );
}