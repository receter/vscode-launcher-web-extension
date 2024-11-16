import "./App.css";

import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";

import styles from "./Popup.module.css";

async function getActiveTabUrlHost() {
  const [tab] = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = tab.url;

  if (!url) {
    return;
  }

  const urlObject = new URL(url);
  return urlObject.host;
}

function Popup() {
  const [vscodePath, setVscodePath] = useState("");

  const vscodeUrl = `vscode://${vscodePath}?windowId=_blank`;

  useEffect(() => {
    const loadVscodePath = async () => {
      const host = await getActiveTabUrlHost();
      if (!host) {
        return;
      }

      const result = await Browser.storage.local.get(host);
      const resultValue = result[host] ? String(result[host]) : "";
      if (resultValue) {
        setVscodePath(resultValue);
      }
    };

    loadVscodePath();
  }, []);

  const saveVscodePath = async () => {
    const host = await getActiveTabUrlHost();
    if (!host) {
      return;
    }
    if (vscodePath) {
      await Browser.storage.local.set({ [host]: vscodePath });
    } else {
      await Browser.storage.local.remove(host);
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
