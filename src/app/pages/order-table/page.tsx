'use client'
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Menu from '@/app/components/menu/layout';

const Mesas = dynamic(() => import('./table-drag'), { ssr: false });

export default function Home() {
    return (
        <Menu>
            <DndProvider backend={HTML5Backend}>
                <Mesas />
            </DndProvider>
        </Menu>
    );
}
