'use client'
import { useEffect, useState } from 'react'
import { usePrintAgent } from './print'
import React from 'react'
import { notifyError, notifySuccess } from "./../../../utils/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Page() {
    const [mounted, setMounted] = useState(false)
    const { connected, printers, getPrinters, print } = usePrintAgent()
    const [selected, setSelected] = useState('')
    const [text, setText] = useState('Teste de impressão via WebSocket\nLinha 2\nLinha 3')
    const [loading, setLoading] = useState(false)

    // Previne problemas de hidratação SSR
    useEffect(() => {
        setMounted(true)
    }, [])


    useEffect(() => {
        if (connected) {
            getPrinters()
            notifySuccess('Conectado ao Print Agent')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected])

    const handlePrint = async () => {
        if (!text.trim()) {
            notifyError('Digite um texto para imprimir')
            return
        }

        setLoading(true)
        try {
            print({ printer: selected, text })
            notifySuccess(`Impressão enviada${selected ? ` para ${selected}` : ' para impressora padrão'}`)
        } catch (error) {
            notifyError('Erro ao enviar impressão')
        } finally {
            setTimeout(() => setLoading(false), 1000)
        }
    }

    const handleSelectPrinter = (printer: string) => {
        setSelected(printer)
        notifySuccess(`Impressora selecionada: ${printer || 'Padrão'}`)
    }

    // Retorna estrutura vazia durante SSR para evitar diferenças de hidratação
    if (!mounted) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-gray-500">Carregando...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl" suppressHydrationWarning>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Sistema de Impressão</h1>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                        <span className="font-semibold">{connected ? 'Conectado' : 'Desconectado'}</span>
                    </div>
                    <button
                        onClick={getPrinters}
                        disabled={!connected}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        🔄 Atualizar Impressoras
                    </button>
                </div>
            </div>

            <Tabs defaultValue="test" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="test">🧪 Testar Impressão</TabsTrigger>
                    <TabsTrigger value="download">📥 Download Print Agent</TabsTrigger>
                </TabsList>

                <TabsContent value="test" className="space-y-6">
                    {/* Printer Selection */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Selecione a Impressora</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Impressora Padrão */}
                            <button
                                onClick={() => handleSelectPrinter('')}
                                className={`p-4 rounded-lg border-2 transition-all ${selected === ''
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`text-3xl ${selected === '' ? 'scale-110' : ''} transition-transform`}>
                                        🖨️
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Padrão</div>
                                        <div className="text-sm text-gray-500">Impressora padrão do sistema</div>
                                    </div>
                                </div>
                                {selected === '' && (
                                    <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                                        ✓ Selecionada
                                    </div>
                                )}
                            </button>

                            {/* Lista de Impressoras */}
                            {printers.length === 0 && connected && (
                                <div className="col-span-full p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                                    Nenhuma impressora encontrada. Clique em &quot;Atualizar Impressoras&quot;
                                </div>
                            )}

                            {printers.map((printer) => (
                                <button
                                    key={printer}
                                    onClick={() => handleSelectPrinter(printer)}
                                    className={`p-4 rounded-lg border-2 transition-all ${selected === printer
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`text-3xl ${selected === printer ? 'scale-110' : ''} transition-transform`}>
                                            🖨️
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-semibold truncate" title={printer}>
                                                {printer}
                                            </div>
                                            <div className="text-sm text-gray-500">Disponível</div>
                                        </div>
                                    </div>
                                    {selected === printer && (
                                        <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                                            ✓ Selecionada
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Editor */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Conteúdo para Impressão</h2>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={8}
                            placeholder="Digite o texto que deseja imprimir..."
                            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                            {text.length} caracteres · {text.split('\n').length} linhas
                        </div>
                    </div>

                    {/* Print Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrint}
                            disabled={!connected || loading || !text.trim()}
                            className="flex-1 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Enviando...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    🖨️ Imprimir
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setText('')}
                            disabled={!text}
                            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        >
                            🗑️ Limpar
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-1">Informações</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• O Print Agent precisa estar rodando em <code className="bg-white px-1 rounded">localhost:8089</code></li>
                                    <li>• Se &quot;Padrão&quot; estiver selecionada, será usada a impressora padrão do sistema</li>
                                    <li>• Você pode selecionar uma impressora específica clicando nos cards acima</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="download">
                    {/* Download Print Agent */}
                    <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="text-5xl mb-4">📥</div>
                            <h2 className="text-2xl font-bold mb-2">Instalar Print Agent</h2>
                            <p className="text-gray-600 mb-8">
                                Escolha o seu sistema operacional para baixar e instalar o gerenciador de impressões.
                                Ele é necessário para conectar suas impressoras locais ao sistema.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href="https://drive.google.com/file/d/1b_s1p2vIyujJsLsmawohzjLImhNyLadr/view?usp=sharing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 p-5 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm hover:shadow-lg group"
                                >
                                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">🪟</span>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-800">Windows</div>
                                        <div className="text-xs text-gray-500">Download .exe</div>
                                    </div>
                                </a>

                                <a
                                    href="https://drive.google.com/file/d/1wpEPPGixJ_BMZCszW3Rgi36vK29c64bS/view?usp=sharing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all shadow-sm hover:shadow-lg group"
                                >
                                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">🍎</span>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-800">macOS</div>
                                        <div className="text-xs text-gray-500">Download .dmg</div>
                                    </div>
                                </a>
                            </div>

                            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-lg text-left">
                                <p className="text-sm text-orange-800">
                                    <strong>Nota:</strong> Após instalar, certifique-se de que o aplicativo está aberto. O status no topo da página mudará para <span className="text-green-600 font-bold">Conectado</span> automaticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}