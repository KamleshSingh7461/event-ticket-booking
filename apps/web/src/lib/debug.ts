import { appendFile } from 'fs/promises';
import { join } from 'path';

export async function logDebug(message: string, data?: any) {
    const logPath = join(process.cwd(), 'debug_log.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
    try {
        await appendFile(logPath, logEntry);
    } catch (err) {
        console.error('Failed to write to log file', err);
    }
}
