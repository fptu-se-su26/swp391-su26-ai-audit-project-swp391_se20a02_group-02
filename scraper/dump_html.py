import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://www.mioto.vn/city/ho-chi-minh", wait_until="networkidle")
        await asyncio.sleep(5)  # Wait for dynamic content
        html = await page.content()
        with open("mioto_dump.html", "w", encoding="utf-8") as f:
            f.write(html)
        await browser.close()
        print("HTML dumped successfully.")

asyncio.run(main())
