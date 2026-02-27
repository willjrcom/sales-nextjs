'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Script from 'next/script';

export interface ParsedAddress {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    uf: string;
    cep: string;
}

interface Suggestion {
    label: string;
    placePrediction: google.maps.places.PlacePrediction;
}

interface AddressAutocompleteProps {
    onAddressSelected: (address: ParsedAddress) => void;
    onCepChange?: (cep: string) => void;
    onManualEntry?: () => void;
    placeholder?: string;
    defaultValue?: string;
    defaultCep?: string;
}

const GCP_KEY = process.env.NEXT_PUBLIC_GCP_KEY || '';

export default function AddressAutocomplete({
    onAddressSelected,
    onCepChange,
    onManualEntry,
    placeholder = 'Buscar endereço...',
    defaultValue = '',
    defaultCep = '',
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [displayCep, setDisplayCep] = useState(defaultCep);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mapsReady, setMapsReady] = useState(false);
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        // Check if maps is already ready on mount
        if (typeof window !== 'undefined' && window.google?.maps) {
            setMapsReady(true);
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getOrCreateSessionToken = useCallback(() => {
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        }
        return sessionTokenRef.current;
    }, []);

    const fetchSuggestions = useCallback(async (input: string) => {
        if (!input.trim() || input.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const { AutocompleteSuggestion } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
            const token = getOrCreateSessionToken();

            const { suggestions: raw } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                sessionToken: token,
                includedRegionCodes: ['br'],
                includedPrimaryTypes: ['geocode', 'street_address'],
            });

            setSuggestions(raw.map(s => ({
                label: s.placePrediction?.text?.toString() || '',
                placePrediction: s.placePrediction!,
            })));
            setIsOpen(true);
        } catch (err) {
            console.error('Autocomplete error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getOrCreateSessionToken]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    }, [fetchSuggestions]);

    const handleSelect = useCallback(async (suggestion: Suggestion) => {
        setInputValue(suggestion.label);
        setIsOpen(false);
        setSuggestions([]);

        try {
            const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
            const token = sessionTokenRef.current;

            // Invalidate token after selection (billing session ends here)
            sessionTokenRef.current = null;

            const place = suggestion.placePrediction.toPlace();
            await place.fetchFields({
                fields: ['addressComponents', 'formattedAddress'],
            });

            const get = (type: string, short = false) => {
                const comp = place.addressComponents?.find(c => c.types.includes(type));
                return comp ? (short ? comp.shortText : comp.longText) ?? '' : '';
            };

            onAddressSelected({
                street: get('route'),
                number: get('street_number'),
                neighborhood: get('sublocality_level_1') || get('sublocality') || get('neighborhood'),
                city: get('administrative_area_level_2'),
                uf: get('administrative_area_level_1', true),
                cep: get('postal_code').replace(/\D/g, ''),
            });
            const parsedCep = get('postal_code').replace(/\D/g, '');
            setDisplayCep(parsedCep);
        } catch (err) {
            console.error('Place details error:', err);
        }
    }, [onAddressSelected]);

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${GCP_KEY}&loading=async&language=pt-BR&region=BR`}
                strategy="afterInteractive"
                onLoad={() => setMapsReady(true)}
            />
            <div ref={containerRef} className="w-full relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar endereço
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInput}
                        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                        placeholder={mapsReady ? placeholder : 'Carregando Maps...'}
                        disabled={!mapsReady}
                        autoComplete="off"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   text-sm bg-white transition-all disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                </div>

                {isOpen && suggestions.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                onMouseDown={() => handleSelect(s)}
                                className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer flex items-start gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {s.label}
                            </li>
                        ))}
                    </ul>
                )}

                <p className="text-xs text-gray-400 mt-1">
                    Digite o endereço e selecione uma sugestão para preencher automaticamente
                </p>

                {onManualEntry && (
                    <button
                        type="button"
                        onClick={onManualEntry}
                        className="mt-1 text-xs text-blue-500 hover:text-blue-700 underline"
                    >
                        Não encontrei meu endereço
                    </button>
                )}

                <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">CEP</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        value={displayCep || defaultCep}
                        onChange={e => {
                            setDisplayCep(e.target.value);
                            onCepChange?.(e.target.value.replace(/\D/g, ''));
                        }}
                        placeholder="00000-000"
                        className="w-40 px-3 py-1.5 border border-gray-300 rounded-md text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       bg-white transition-all"
                    />
                </div>
            </div>
        </>
    );
}
