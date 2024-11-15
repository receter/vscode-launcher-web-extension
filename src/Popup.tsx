import "./App.css";

import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";

import styles from "./Popup.module.css";

function Popup() {
  const [vscodePath, setVscodePath] = useState("");

  const vscodeUrl = `vscode://${vscodePath}?windowId=_blank`;

  useEffect(() => {
    const loadVscodePath = async () => {
      const [tab] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const url = tab.url;

      const result = await Browser.storage.local.get(url);
      if (url && result[url]) {
        const value = result[url] as string;
        setVscodePath(value);
      }
    };

    loadVscodePath();
  }, []);

  const saveVscodePath = async () => {
    const [tab] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = tab.url;

    if (vscodePath) {
      if (url) {
        await Browser.storage.local.set({ [url]: vscodePath });
      }
    } else {
      if (url) {
        await Browser.storage.local.remove(url);
      }
    }
  };

  return (
    <div className={styles.popup}>
      <div>
        <input
          id="note"
          type="text"
          placeholder={`eg. vscode-remote/wsl+Ubuntu/home/username/project`}
          value={vscodePath}
          className={styles.inputVscodePath}
          onChange={(e) => setVscodePath(e.target.value)}
        />
      </div>
      <div className={styles.buttons}>
        <button onClick={saveVscodePath}>Save VSCode Path</button>
        <div>
          <button
            disabled={!vscodePath}
            onClick={async () => {
              const [tab] = await Browser.tabs.query({
                active: true,
                currentWindow: true,
              });
              await Browser.tabs.update(tab.id, { url: vscodeUrl });
            }}
          >
            Launch VSCode
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
