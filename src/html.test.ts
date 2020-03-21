import { fetchHtml } from "./html";

describe('html', () => {
    it('is able to reach out an retrieve the html for a https page', async () => {
        const html = await fetchHtml('https://google.com');
        expect(html.length).toBeGreaterThan(0);
    });
});