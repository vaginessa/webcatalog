import { remote } from 'electron';
import getAllAppPath from './getAllAppPath';
import downloadIconAsync from './downloadIconAsync';

const installAppAsync = ({ appId, appName, appUrl }) =>
  downloadIconAsync(appId)
    .then((iconPath) => {
      const jsonContent = JSON.stringify({
        id: appId,
        name: appName,
        url: appUrl,
        version: remote.app.getVersion(),
      }); // data to track app info & version

      return new Promise((resolve, reject) => {
        const os = remote.require('os');
        const path = remote.require('path');
        switch (os.platform()) {
          case 'darwin':
          case 'linux': {
            const execFilePath = path.join(remote.app.getAppPath(), 'app', 'scripts', `applify-${os.platform()}.sh`);
            const { execFile } = remote.require('child_process');
            execFile(execFilePath, [
              appName,
              appUrl,
              iconPath,
              appId,
              jsonContent,
            ], (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            });
            break;
          }
          case 'win32':
          default: {
            const fs = remote.require('fs-extra');

            const iconPersistPath = path.join(remote.app.getPath('userData'), 'icons', `${appId}.ico`);

            fs.move(iconPath, iconPersistPath, { overwrite: true }, (moveIconErr) => {
              if (moveIconErr) {
                reject(moveIconErr);
                return;
              }

              const WindowsShortcuts = remote.require('windows-shortcuts');

              const allAppPath = getAllAppPath();
              const shortcutPath = path.join(allAppPath, `${appName}.lnk`);
              WindowsShortcuts.create(shortcutPath, {
                target: '%userprofile%/AppData/Local/Programs/WebCatalog/WebCatalog.exe',
                args: `--name="${appName}" --url="${appUrl}" --id="${appId}"`,
                icon: iconPersistPath,
                desc: jsonContent,
              }, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                // create desktop shortcut
                const desktopPath = remote.app.getPath('desktop');
                WindowsShortcuts.create(`${desktopPath}/${appName}.lnk`, {
                  target: '%userprofile%/AppData/Local/Programs/WebCatalog/WebCatalog.exe',
                  args: `--name="${appName}" --url="${appUrl}" --id="${appId}"`,
                  icon: iconPersistPath,
                  desc: jsonContent,
                }, (desktopShortcutErr) => {
                  if (desktopShortcutErr) {
                    reject(desktopShortcutErr);
                    return;
                  }

                  resolve();
                });
              });
            });
          }
        }
      });
    });

export default installAppAsync;
