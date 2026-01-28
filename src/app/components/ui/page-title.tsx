"use client";

import React from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import Tooltip from './tooltip';

interface PageTitleProps {
  title: string;
  tooltip: string;
}

const PageTitle = ({ title, tooltip }: PageTitleProps) => (
  <div className="flex items-center mb-4">
    <h1 className="text-2xl font-bold mr-2">{title}</h1>
    <Tooltip content={tooltip}>
      <HiInformationCircle className="text-gray-400 hover:text-gray-600" size={20} />
    </Tooltip>
  </div>
);

export default PageTitle;