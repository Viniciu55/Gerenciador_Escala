'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const hasEnvVars = () => {
    return (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  const runMigrations = async () => {
    setIsLoading(true)
    setStatus('loading')
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('✓ Database tables created successfully! You can now use the application.')
      } else {
        setStatus('error')
        setMessage(`✗ Migration failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configuração do Sistema</h1>
          <p className="text-muted-foreground">
            Siga os passos abaixo para configurar o banco de dados
          </p>
        </div>

        <div className="space-y-4">
          {/* Environment Variables Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasEnvVars() ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                Variáveis de Ambiente
              </CardTitle>
              <CardDescription>
                Configuração do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>NEXT_PUBLIC_SUPABASE_URL</span>
                </div>
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                </div>
              </div>

              {!hasEnvVars() && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Adicione as variáveis de ambiente do Supabase no arquivo `.env.local` ou nas configurações do projeto.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Database Migrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                Criar Tabelas do Banco de Dados
              </CardTitle>
              <CardDescription>
                Execute as migrações SQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Este passo criará as tabelas necessárias no Supabase:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>members_louvor, schedule_entries_louvor</li>
                  <li>members_sonoplastia, schedule_entries_sonoplastia</li>
                  <li>members_midia, schedule_entries_midia</li>
                  <li>built_schedules</li>
                </ul>
              </div>

              {message && (
                <Alert className={status === 'success' ? 'bg-green-50' : 'bg-red-50'}>
                  <AlertDescription className={status === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={runMigrations}
                disabled={!hasEnvVars() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Executar Migrações'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Adicione as variáveis de ambiente do Supabase</p>
              <p>2. Clique em "Executar Migrações" acima</p>
              <p>3. Navegue para <a href="/" className="text-blue-600 hover:underline">a página inicial</a></p>
              <p>4. Comece a usar o sistema de escalas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
