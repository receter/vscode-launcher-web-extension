import "./App.css";

import { Button, Stack, TextInput } from "@sys42/ui";
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
  const [vscodePath, setVscodePath] = useState<string>();
  const [currentHost, setCurrentHost] = useState<string>();

  useEffect(() => {
    (async () => {
      const host = await getActiveTabUrlHost();
      if (!host) {
        return;
      }
      const result = await Browser.storage.local.get(host);
      const resultValue = result[host] ? String(result[host]) : "";
      setCurrentHost(host);
      setVscodePath(resultValue);
    })();
  }, []);

  useEffect(() => {
    const updateVscodePath = async (host: string, vscodePath?: string) => {
      console.log("saveVscodePath", host, vscodePath);
      if (vscodePath) {
        await Browser.storage.local.set({ [host]: vscodePath });
      } else {
        await Browser.storage.local.remove(host);
      }
    };
    if (currentHost) {
      updateVscodePath(currentHost, vscodePath);
    }
  }, [vscodePath, currentHost]);

  const vscodeUrl = `vscode://${vscodePath}?windowId=_blank`;

  return (
    <Stack className={styles.popup}>
      <TextInput
        id="note"
        type="text"
        placeholder={`eg. vscode-remote/wsl+Ubuntu/home/username/project`}
        value={vscodePath ?? ""}
        className={styles.textInputVscodePath}
        onChange={(e) => setVscodePath(e.target.value)}
      />
      <Button
        className={styles.buttonLaunchVscode}
        variant="primary"
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
      </Button>
    </Stack>
  );
}

export default Popup;
