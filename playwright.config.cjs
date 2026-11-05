const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests/browser', timeout: 60000, fullyParallel: false, workers: 1,
    use: {baseURL: 'http://127.0.0.1:3000', viewport: {width: 1280, height: 1100}, screenshot: 'only-on-failure'},
    projects: [{name: 'chromium', use: {browserName: 'chromium'}}, {name: 'firefox', use: {browserName: 'firefox'}}],
    webServer: {command: 'npm run preview', url: 'http://127.0.0.1:3000', reuseExistingServer: false},
});
