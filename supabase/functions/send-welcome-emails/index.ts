import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticateCronRequest } from '../_shared/cron-auth.ts'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

// Runs every minute via managed HTTP schedule. Sends the welcome email to
// users whose account was created more than 1 minute ago and who have not
// received it yet.

const DELAY_MS = 60_000
const BATCH_SIZE = 50

Deno.serve(async (request) => {
  const authFailure = authenticateCronRequest(request)
  if (authFailure) return authFailure

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const cutoff = new Date(Date.now() - DELAY_MS).toISOString()

  const { data: pending, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .is('welcome_email_sent_at', null)
    .not('email', 'is', null)
    .lte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    console.error('Failed to load pending welcome emails:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const user of pending ?? []) {
    try {
      const result = await sendTemplateEmail('welcome', user.email, {
        templateData: { name: user.full_name ?? undefined },
        idempotencyKey: `welcome-${user.id}`,
      })

      // Mark as handled on success and on suppression (never retry suppressed).
      await supabase
        .from('users')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      if (result.sent) sent++
      else skipped++
    } catch (err) {
      // Leave welcome_email_sent_at null so the next run retries.
      failed++
      console.error(`Welcome email failed for user ${user.id}:`, err)
    }
  }

  return Response.json({ success: true, processed: pending?.length ?? 0, sent, skipped, failed })
})
