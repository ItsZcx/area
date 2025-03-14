'use client'

import React from 'react';
import { CryptoProcessor } from './components/CryptoProcessor';
import withAuth from '@/lib/withAuth';

function PlanPage() {
  return (
    <CryptoProcessor />
  )
}

export default withAuth(PlanPage);
