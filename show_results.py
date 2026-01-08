
import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def run():
    # Start the preview server
    server = subprocess.Popen(["npm", "run", "preview", "--", "--port", "5000", "--host"],
                              stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE,
                              preexec_fn=os.setsid)

    # Give it a moment to start
    time.sleep(5)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Capture Vosne-Romanée (Expert Map)
        print("Navigating to Vosne-Romanée...")
        # We need to click the sidebar or search. Let's try direct interaction.
        # Since URL routing might not be deep-linked (it's a SPA), we visit root and click.
        await page.goto("http://localhost:5000")

        # Wait for sidebar to load
        await page.wait_for_selector("text=Select Village")

        # Click Vosne-Romanée button (using text match, knowing Korean name might be used)
        # In the code, I used koreanName: "본 로마네"
        await page.click("text=본 로마네")

        # Wait for map to load (look for SVG path)
        await page.wait_for_selector("svg path")
        # Give it a second for animation/rendering
        await page.wait_for_timeout(2000)

        await page.screenshot(path="result_vosne.png", full_page=False)
        print("Captured result_vosne.png")

        # 2. Capture Volnay (Placeholder Map)
        print("Navigating to Volnay...")
        # Click Volnay (Korean: 볼네)
        # We might need to scroll the sidebar or search. Search is reliable.
        await page.fill("input[type='text']", "Volnay")
        await page.wait_for_timeout(1000) # Wait for search debounce

        # Click the first search result
        await page.click(".cursor-pointer") # The search result item class I added

        await page.wait_for_selector("svg path")
        await page.wait_for_timeout(2000)

        await page.screenshot(path="result_volnay.png", full_page=False)
        print("Captured result_volnay.png")

        await browser.close()

    # Kill server
    os.killpg(os.getpgid(server.pid), 15)

if __name__ == "__main__":
    asyncio.run(run())
