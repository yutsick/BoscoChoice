import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import type React from 'react'
import { importMap } from './admin/importMap'
import { handleServerFunctions } from './serverAction'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

export default function PayloadLayout({ children }: Args) {
  return (
    {/* @ts-expect-error — server action type mismatch */}
    <RootLayout config={config} importMap={importMap} serverFunction={handleServerFunctions}>
      {children}
    </RootLayout>
  )
}
