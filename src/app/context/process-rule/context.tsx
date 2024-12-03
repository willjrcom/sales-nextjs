'use client';

import ProcessRule from '@/app/entities/process-rule/process-rule';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemsContextProps } from '../props';
import GetProcessRules from '@/app/api/process-rule/route';

const ContextProcessRule = createContext<ItemsContextProps<ProcessRule> | undefined>(undefined);

export const ProcessRuleProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<ProcessRule>({ getItems: GetProcessRules });

    return (
        <ContextProcessRule.Provider value={values}>
            {children}
        </ContextProcessRule.Provider>
    );
};

export const useProcessRules = () => {
    const context = useContext(ContextProcessRule);
    if (!context) {
        throw new Error('useProcessRules must be used within a ProcessRuleProvider');
    }
    return context;
};
