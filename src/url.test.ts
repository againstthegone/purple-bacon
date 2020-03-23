import { when } from 'jest-when';

import { fetchHtml } from './html';
import { fetchRecipeUrls } from './url';

jest.mock('./html');

describe('url', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('is able to fetch no recipes when there are none', async () => {
        when(fetchHtml as jest.Mock<Promise<string>>).calledWith('test-url/recipes/').mockResolvedValue('<!DOCTYPE html><body></body>');

        expect(await fetchRecipeUrls('test-url')).toEqual([]);
    });

    it('is able to fetch recipes over the pages', async () => {
        when(fetchHtml as jest.Mock<Promise<string>>).calledWith('test-url/recipes/')
            .mockResolvedValue('<!DOCTYPE html><body>'
                + '<h3 class="fit-post-title"><a href="test-url/recipe-0"></a></h3>'
                + '<h3 class="fit-post-title"><a href="external-link/another-recipe-with-different-url"></a></h3>'
                + '</body>');
        when(fetchHtml as jest.Mock<Promise<string>>).calledWith('test-url/recipes/page/2/')
            .mockResolvedValue('<!DOCTYPE html><body>'
                + '<h3 class="fit-post-title"><a href="test-url/another-recipe"></a></h3>'
                + '<h3 class="not-fit-post-title"><a href="shouldnt-exist"></a></h3>'
                + '</body>');
        when(fetchHtml as jest.Mock<Promise<string>>).calledWith('test-url/recipes/page/3/')
            .mockResolvedValue('<!DOCTYPE html><body></body>');

        expect(await fetchRecipeUrls('test-url')).toEqual(['test-url/recipe-0', 'external-link/another-recipe-with-different-url', 'test-url/another-recipe']);
    });
})