import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server.js';
import { internal } from './_generated/api.js';
import type { Id } from './_generated/dataModel.js';
import { verifyHmacSignature } from './lib/crypto.js';

const http = httpRouter();

/**
 * GET /api/n8n/overdue
 * Exposes an authenticated HTTP endpoint for scheduled n8n workflows
 * to query overdue active loans.
 * Requires secret authentication via Bearer token or x-n8n-secret header.
 */
http.route({
    path: '/api/n8n/overdue',
    method: 'GET',
    handler: httpAction(async (ctx, request) => {
        // 1. Authenticate using shared secret
        const authHeader = request.headers.get('authorization');
        const secretHeader = request.headers.get('x-n8n-secret');
        const configuredSecret =
            process.env.N8N_CONVEX_SYNC_SECRET ||
            process.env.N8N_WEBHOOK_SECRET ||
            'lendloop_default_shared_secret';

        let token = '';
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else if (secretHeader) {
            token = secretHeader.trim();
        }

        if (!token || token !== configuredSecret) {
            return new Response(
                JSON.stringify({
                    error: 'Unauthorized: Invalid or missing authentication secret',
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // 2. Query overdue active loans from Convex
        const overdueLoans = await ctx.runQuery(
            internal.automation.getOverdueLoansQuery,
        );

        return new Response(
            JSON.stringify({
                success: true,
                count: overdueLoans.length,
                timestamp: Date.now(),
                overdueLoans,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }),
});

/**
 * POST /api/n8n/reminders/ack
 * Authenticated callback endpoint for n8n to record reminder execution idempotently.
 * Verifies HMAC-SHA256 signature and uses idempotencyKey to prevent duplicate updates.
 */
http.route({
    path: '/api/n8n/reminders/ack',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        // 1. Read raw body payload
        const rawBody = await request.text();
        const signature =
            request.headers.get('x-signature') ||
            request.headers.get('x-lendloop-signature');

        const configuredSecret =
            process.env.N8N_WEBHOOK_SECRET ||
            process.env.N8N_CONVEX_SYNC_SECRET ||
            'lendloop_default_shared_secret';

        // 2. Cryptographically verify HMAC-SHA256 signature
        const isValid = await verifyHmacSignature(
            rawBody,
            signature,
            configuredSecret,
        );

        if (!isValid) {
            return new Response(
                JSON.stringify({
                    error: 'Unauthorized: Invalid or missing HMAC signature',
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // 3. Parse JSON request body
        let bodyData: {
            loanId?: string;
            idempotencyKey?: string;
            channel?: string;
            reminderDate?: string;
        };

        try {
            bodyData = JSON.parse(rawBody);
        } catch {
            return new Response(
                JSON.stringify({ error: 'Bad Request: Invalid JSON body' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const { loanId, idempotencyKey, channel, reminderDate } = bodyData;

        if (!loanId || !idempotencyKey) {
            return new Response(
                JSON.stringify({
                    error: 'Validation error: Both loanId and idempotencyKey are required',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // 4. Record reminder acknowledgment idempotently in Convex
        try {
            const result = await ctx.runMutation(
                internal.automation.recordReminderAck,
                {
                    loanId: loanId as Id<'borrowRequests'>,
                    idempotencyKey,
                    channel,
                    reminderDate,
                },
            );

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : String(err);
            return new Response(
                JSON.stringify({
                    error: errorMessage,
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }
    }),
});

export default http;
