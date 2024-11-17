import { Button, Stack, TextInput } from "@sys42/ui";
import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";

import styles from "./Options.module.css";

function Options() {
  const [vscodePaths, setVscodePaths] = useState<{ [host: string]: unknown }>(
    {},
  );
  const [newHost, setNewHost] = useState<string>("");
  const [newPath, setNewPath] = useState<string>("");

  useEffect(() => {
    (async () => {
      const result = await Browser.storage.local.get();
      setVscodePaths(result);
    })();
  }, []);

  const handleAddOrUpdate = async () => {
    if (newHost && newPath) {
      const updatedPaths = { ...vscodePaths, [newHost]: newPath };
      setVscodePaths(updatedPaths);
      await Browser.storage.local.set({ [newHost]: newPath });
      setNewHost("");
      setNewPath("");
    }
  };

  const handleDelete = async (host: string) => {
    if (window.confirm(`Are you sure you want to delete ${host}?`)) {
      const updatedPaths = { ...vscodePaths };
      delete updatedPaths[host];
      setVscodePaths(updatedPaths);
      await Browser.storage.local.remove(host);
    }
  };

  const isExistingHost = (host: string) => {
    return Object.prototype.hasOwnProperty.call(vscodePaths, host);
  };

  return (
    <Stack className={styles.options}>
      <h1>Edit VSCode Path Mappings</h1>
      <Stack>
        {Object.entries(vscodePaths).map(([host, path]) => (
          <div key={host} className={styles.pathListItem}>
            <TextInput value={host} readOnly disabled />
            <TextInput
              value={typeof path === "string" ? path : ""}
              readOnly
              disabled
            />
            <Button onClick={() => handleDelete(host)}>Delete</Button>
          </div>
        ))}
      </Stack>
      <Stack>
        <div className={styles.pathListItem}>
          <TextInput
            placeholder="Host"
            value={newHost}
            onChange={(e) => setNewHost(e.target.value)}
          />
          <TextInput
            placeholder="VSCode Path"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
          <Button onClick={handleAddOrUpdate}>
            {isExistingHost(newHost) ? "Update mapping" : "Add mapping"}
          </Button>
        </div>
      </Stack>
    </Stack>
  );
}

export default Options;
