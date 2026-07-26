const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const BASE_URL = "http://moonlake-editor.test";
let qaBrowser;

(async () => {
  const browser = await chromium.launch({ headless: true });
  qaBrowser = browser;
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const sceneEditorSource = fs.readFileSync("src/tools/sceneEditor.js", "utf8");
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/src/tools/sceneEditor.js") {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: sceneEditorSource
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body></body></html>"
    });
  });
  await page.goto(BASE_URL);
  const result = await page.evaluate(async () => {
    document.body.replaceChildren();
    const { enableEditorMode } = await import("/src/tools/sceneEditor.js");
    const listeners = {};
    const scale = {
      x: 1,
      y: 1,
      set(x, y = x) {
        this.x = x;
        this.y = y;
      }
    };
    const object = {
      x: 100,
      y: 200,
      zIndex: 4,
      alpha: 1,
      scale,
      parent: { toLocal: (point) => point },
      __sceneEditor: {
        id: "campfire_left",
        texturePath: "campfire.png",
        editorEnabled: true
      },
      on(name, callback) {
        listeners[name] = callback;
      }
    };
    const stage = { children: [object] };
    enableEditorMode(stage);
    listeners.pointerdown({
      stopPropagation() {},
      global: { x: 100, y: 200 }
    });

    const panel = document.getElementById("dev-scene-mobile-panel");
    const buttons = [...panel.querySelectorAll("button")];
    const buttonByLabel = (label) =>
      buttons.find((button) => button.getAttribute("aria-label") === label);

    buttonByLabel("放大選取物件").click();
    buttonByLabel("向右移動").click();
    buttonByLabel("向下移動").click();

    const exportPayload = window.__NEXUS_SCENE_EDITOR_EXPORT__();
    const beforeReset = {
      x: object.x,
      y: object.y,
      scale: object.scale.x
    };
    document.getElementById("dev-reset-objects").click();

    buttonByLabel("收合調整面板").click();
    const collapsed = panel.hidden;
    document.getElementById("dev-scene-mobile-toggle").click();

    return {
      panelWidth: panel.getBoundingClientRect().width,
      selectedLabel: panel.querySelector("strong").textContent,
      beforeReset,
      reset: {
        x: object.x,
        y: object.y,
        scale: object.scale.x
      },
      exportEntry: exportPayload.objects[0],
      collapsed,
      expanded: !panel.hidden,
      buttonHeights: buttons.map((button) =>
        button.getBoundingClientRect().height
      )
    };
  });

  assert.ok(result.panelWidth <= 374);
  assert.equal(result.selectedLabel, "已選：campfire_left");
  assert.deepEqual(result.beforeReset, { x: 104, y: 204, scale: 1.06 });
  assert.deepEqual(result.reset, { x: 100, y: 200, scale: 1 });
  assert.equal(result.exportEntry.id, "campfire_left");
  assert.equal(result.exportEntry.x, 104);
  assert.equal(result.exportEntry.y, 204);
  assert.equal(result.exportEntry.scale.x, 1.06);
  assert.equal(result.collapsed, true);
  assert.equal(result.expanded, true);
  assert.ok(Math.min(...result.buttonHeights) >= 44);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  await browser.close();
  console.log("Moonlake mobile scene editor: 12/12 PASS");
})().catch((error) => {
  console.error(error);
  qaBrowser?.close();
  process.exitCode = 1;
});
