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

  function handleClickHost(host: string) {
    setNewHost(host);
  }

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

      <div className={styles.pathListItem}>
        <TextInput
          placeholder="Host"
          value={newHost}
          style={{ width: "100%" }}
          onChange={(e) => setNewHost(e.target.value)}
        />
        <TextInput
          placeholder="VSCode Path"
          value={newPath}
          style={{ width: "100%" }}
          onChange={(e) => setNewPath(e.target.value)}
        />
        <Button
          variant="primary"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleAddOrUpdate}
        >
          {isExistingHost(newHost) ? "Update mapping" : "Add mapping"}
        </Button>
      </div>

      {Object.entries(vscodePaths).map(([host, path]) => (
        <div key={host} className={styles.pathListItem}>
          <div>
            <strong
              className={styles.host}
              onClick={() => handleClickHost(host)}
            >
              {host}
            </strong>
            <div>{String(path)}</div>
          </div>
          <Button onClick={() => handleDelete(host)}>Delete</Button>
        </div>
      ))}
    </Stack>
  );
}

export default Options;
