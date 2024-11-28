'use client';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Mesas = dynamic(() => import('./table-drag'), { ssr: false });

export default function Home() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Mesas />
        </DndProvider>
    );
}
