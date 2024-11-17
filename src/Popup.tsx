import "./App.css";

import { Button, Label, Stack, TextInput } from "@sys42/ui";
import { produce } from "immer";
import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";

import styles from "./Popup.module.css";

type VscodePath = string;
type Pathname = string;
type HostPathnameMap = [Pathname, VscodePath];
type HostValue = HostPathnameMap[];

function Popup() {
  const [hostValue, setHostValue] = useState<HostValue>();
  const [currentHost, setCurrentHost] = useState<string>();
  const [currentPathname, setCurrentPathname] = useState<string>();

  useEffect(() => {
    (async () => {
      const [host, pathname] = await getActiveTabUrlHostAndPathname();
      if (!host) {
        return;
      }
      const result = await Browser.storage.local.get(host);
      let value = [];
      try {
        value = JSON.parse(String(result[host]));
      } catch (error) {
        console.error(error);
      }
      setCurrentHost(host);
      setCurrentPathname(pathname);
      setHostValue(value);
    })();
  }, []);

  useEffect(() => {
    const updateHostValue = async (host: string, hostValue?: HostValue) => {
      const hostValueToSave = hostValue?.filter(
        ([pathname, vscodePath]) => pathname && vscodePath,
      );
      if (hostValueToSave?.length) {
        await Browser.storage.local.set({
          [host]: JSON.stringify(hostValueToSave),
        });
      } else {
        await Browser.storage.local.remove(host);
      }
    };
    if (currentHost) {
      updateHostValue(currentHost, hostValue);
    }
  }, [hostValue, currentHost]);

  const currentPathnameArray = String(currentPathname)
    .split("/")
    .filter(Boolean);

  let matchingVscodePath = "";
  let matchingHostValueIndex = -1;
  let currentPathnameArrayMatchingIndex = -1;
  if (hostValue) {
    const matchIndex = hostValue.findIndex((entry) => entry[0] === "/");
    if (matchIndex !== -1) {
      matchingHostValueIndex = matchIndex;
      matchingVscodePath = hostValue[matchIndex][1];
    }

    let key = "";
    currentPathnameArray.forEach((pathnameItem, currentPathnameArrayIndex) => {
      key += "/" + pathnameItem;
      const matchIndex = hostValue.findIndex((entry) => entry[0] === key);
      if (matchIndex !== -1) {
        currentPathnameArrayMatchingIndex = currentPathnameArrayIndex;
        matchingHostValueIndex = matchIndex;
        matchingVscodePath = hostValue[matchIndex][1];
      }
    });
  }

  function handleClickExtendPathname() {
    if (currentPathnameArray.length < 1) {
      return;
    }
    if (currentPathnameArrayMatchingIndex >= currentPathnameArray.length - 1) {
      return;
    }
    const newPathnameIndex = currentPathnameArrayMatchingIndex + 1;

    if (hostValue) {
      setHostValue([
        ...hostValue,
        [
          "/" + currentPathnameArray.slice(0, newPathnameIndex + 1).join("/"),
          "",
        ],
      ]);
    }
  }

  function handleChangeVscodePath(event: React.ChangeEvent<HTMLInputElement>) {
    if (!hostValue) {
      return;
    }
    const newHostValue = produce(hostValue, (draft) => {
      if (matchingHostValueIndex === -1) {
        draft.push(["/", event.target.value]);
      } else {
        draft[matchingHostValueIndex][1] = event.target.value;
      }
    });
    setHostValue(newHostValue);
  }

  const vscodeUrl = `vscode://${matchingVscodePath}?windowId=_blank`;

  return (
    <Stack className={styles.popup}>
      <Label htmlFor="vscode-path">
        {currentHost}/
        {currentPathnameArray
          .slice(0, Math.max(0, currentPathnameArrayMatchingIndex + 1))
          .join("/")}{" "}
        <button
          onClick={handleClickExtendPathname}
          className={styles.buttonExtendPathname}
        >
          Extend pathname
        </button>
      </Label>
      <div>{currentPathname}</div>
      <TextInput
        id="vscode-path"
        type="text"
        placeholder={`eg. vscode-remote/wsl+Ubuntu/home/username/project`}
        value={matchingVscodePath}
        className={styles.textInputVscodePath}
        onChange={handleChangeVscodePath}
      />
      <Button
        className={styles.buttonLaunchVscode}
        variant="primary"
        disabled={!hostValue}
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

async function getActiveTabUrlHostAndPathname() {
  const [tab] = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = tab.url;

  if (!url) {
    return [];
  }

  const urlObject = new URL(url);
  return [urlObject.host, urlObject.pathname];
}

export default Popup;
