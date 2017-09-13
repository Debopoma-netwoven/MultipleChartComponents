import { NeuroSharePage } from './app.po';

describe('neuro-share App', () => {
  let page: NeuroSharePage;

  beforeEach(() => {
    page = new NeuroSharePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
