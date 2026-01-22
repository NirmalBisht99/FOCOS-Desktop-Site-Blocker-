import sudo from 'sudo-prompt';
import { app, BrowserWindow, ipcMain } from 'electron';
import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import os from 'os';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { is } from '@electron-toolkit/utils';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: resolve(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (is.dev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(resolve(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

const getHostsPath = () =>
  os.platform() === 'win32'
    ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
    : '/etc/hosts';

// ✅ Block Sites Handler
ipcMain.handle('block-sites', async (event, sites) => {
  const hostsPath = getHostsPath();

  try {
    let data = readFileSync(hostsPath, 'utf8');
    const markerStart = '# FOCOS START';
    const markerEnd = '# FOCOS END';

    const blockLines = sites
      .map(site => `127.0.0.1 ${site}\n127.0.0.1 www.${site}`)
      .join('\n');

    const newBlock = `${markerStart}\n${blockLines}\n${markerEnd}`;
    const regex = new RegExp(`${markerStart}[\s\S]*?${markerEnd}`, 'gm');

    if (regex.test(data)) {
      data = data.replace(regex, newBlock);
    } else {
      data += `\n\n${newBlock}\n`;
    }

    // Write to temp file first
    const tempPath = join(tmpdir(), `focos-hosts-${randomUUID()}.tmp`);
    writeFileSync(tempPath, data, 'utf8');

    const command = os.platform() === 'win32'
      ? `move /Y "${tempPath}" "${hostsPath}"`
      : `mv "${tempPath}" "${hostsPath}"`;

    const options = { name: 'FOCOS Site Blocker' };

    return new Promise((resolve) => {
      sudo.exec(command, options, (error) => {
        if (error) {
          console.error('❌ Block failed:', error.message);
          resolve({ success: false, error: error.message });
        } else {
          console.log('✅ Sites successfully blocked');
          resolve({ success: true });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ✅ Unblock Sites Handler
ipcMain.handle('unblock-sites', async () => {
  const hostsPath = getHostsPath();

  try {
    let data = readFileSync(hostsPath, 'utf8');
    const cleaned = data.replace(
      /# FOCOS START[\s\S]*?# FOCOS END/g,
      '# FOCOS START\n# FOCOS END'
    );

    // Write to temp file first
    const tempPath = join(tmpdir(), `focos-hosts-${randomUUID()}.tmp`);
    writeFileSync(tempPath, cleaned, 'utf8');

    const command = os.platform() === 'win32'
      ? `move /Y "${tempPath}" "${hostsPath}"`
      : `mv "${tempPath}" "${hostsPath}"`;

    const options = { name: 'FOCOS Site Blocker' };

    return new Promise((resolve) => {
      sudo.exec(command, options, (error) => {
        if (error) {
          console.error('❌ Unblock failed:', error.message);
          resolve({ success: false, error: error.message });
        } else {
          console.log('✅ Sites successfully unblocked');
          resolve({ success: true });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
});
