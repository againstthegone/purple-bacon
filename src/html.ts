import { get } from 'https';

export async function fetchHtml(url: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        let body = '';
        get(url, (response) => {
            response.on('readable', () => body += response.read());
            response.on('end', () => resolve(body));
        }).on('error', ({message}) => reject(message));
    });
}