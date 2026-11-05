const {defineConfig} = require('@playwright/test');
const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PLAYWRIGHT_PORT must be an integer between 1 and 65535');
const baseURL = `http://127.0.0.1:${port}`;
module.exports = defineConfig({
    testDir: './tests/browser', timeout: 60000, fullyParallel: false, workers: 1,
    use: {baseURL, viewport: {width: 1280, height: 1100}, screenshot: 'only-on-failure'},
    projects: [{name: 'chromium', use: {browserName: 'chromium'}}, {name: 'firefox', use: {browserName: 'firefox'}}],
    webServer: {command: `npm run preview -- --port ${port}`, url: baseURL, reuseExistingServer: false},
});
