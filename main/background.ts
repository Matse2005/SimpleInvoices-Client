import path from 'path'
import { app, ipcMain, BrowserWindow, dialog, shell, globalShortcut } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { autoUpdater } from "electron-updater"
import Store from 'electron-store'
import fs from 'fs';
import os from 'os';

autoUpdater.checkForUpdatesAndNotify()

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    frame: false, // Remove default frame
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#2f3241',
    //   symbolColor: '#74b1be',
    //   height: 60,
    // },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  })
  mainWindow.maximize();

  if (isProd) {
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setMenu(null)
    await mainWindow.loadURL('app://./welcome')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/welcome`)
    // mainWindow.webContents.openDevTools()
  }


  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.openDevTools()
  })

  // IPC handlers for window controls
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

ipcMain.on('data', async (event, data) => {
  console.log(`${data["type"].toUpperCase()}: Request accepte!`)
})

// type StoreType = {
//   config: {
//     server: string,
//     key: string,
//     author: {
//       id: number,
//       name: string
//     }
//   }
// }

const schema = {
  server: {
    type: 'string',
    // format: 'uri'
  },
  key: {
    type: 'string'
  },
  author: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        minimum: 1,
      },
      name: {
        type: 'string'
      }
    }
  }
};

const store = new Store({ name: 'config' })

ipcMain.on('get-config', (event) => {
  console.log('Get Executed');
  const config = store.get('config', {}) || {};
  event.reply('config', config);  // Send the current config back to the renderer process
});

ipcMain.on('get-printers', async (event) => {  // Make the callback function asynchronous
  let win = new BrowserWindow({
    show: false,
  });
  try {
    let printers = await win.webContents.getPrintersAsync();  // Await the promise
    event.reply('printers', printers);  // Send the actual printers data back to the renderer process
  } catch (error) {
    console.error("Failed to get printers:", error);
    event.reply('printers-error', error.message);  // Send error message back in case of failure
  } finally {
    win.close();  // Close the hidden window after use
  }
});

// Handle 'set-config' event to save the configuration
ipcMain.on('set-config', (event, arg) => {
  console.log('Set Executed');
  store.set('config', arg);
  // Optionally, send a confirmation or updated config back to the renderer
  event.reply('config', store.get('config') || {});  // Reply with the updated config
});

ipcMain.on('download', async (event, url, id) => {
  console.log(`Received download request for URL: ${url}`);

  // Open a "Save As" dialog to specify where to save the PDF
  const filepath = dialog.showSaveDialogSync({
    defaultPath: `factuur-${id}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (!filepath) {
    console.log('Save dialog cancelled');
    return;
  }

  console.log(`Saving PDF to: ${filepath}`);

  // Create a hidden BrowserWindow to load the URL
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Window is hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  try {
    console.log('Loading URL...');
    let fullUrl = ''
    if (url.startsWith('http'))
      fullUrl = url
    else if (isProd)
      fullUrl = 'app://.' + url;
    else
      fullUrl = `http://localhost:${process.argv[2]}` + url;

    await win.loadURL(fullUrl);
    console.log('URL loaded successfully.');

    // Generate a PDF from the loaded URL
    console.log('Generating PDF...');
    const pdfData = await win.webContents.printToPDF({});

    // Save the PDF data to the specified file path
    require('fs').writeFileSync(filepath, pdfData);
    console.log(`PDF saved to ${filepath}`);

  } catch (error) {
    console.error('An error occurred during the PDF download process:', error);
  } finally {
    // Close the window after saving the PDF or if an error occurs
    win.close();
  }
});


ipcMain.on('print', async (event, url, printer) => {
  console.log(`Received print request for URL: ${url}`);
  console.log(`Printer name: ${printer}`);

  // Create a hidden BrowserWindow to load the URL
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Window is hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  try {
    console.log('Loading URL...');
    await win.loadURL(url);
    console.log('URL loaded successfully.');

    // Generate a PDF from the loaded URL
    console.log('Generating PDF...');
    const pdfPath = path.join(__dirname, 'output.pdf');
    const pdfData = await win.webContents.printToPDF({});
    require('fs').writeFileSync(pdfPath, pdfData);
    console.log(`PDF generated and saved to ${pdfPath}`);

    // Print the generated PDF
    console.log('Printing the document...');
    win.webContents.print({ silent: true, printBackground: true, deviceName: printer, pageSize: 'A4', copies: 2 }, (success, errorType) => {
      if (success) {
        console.log('Print job submitted successfully.');
      } else {
        console.error(`Print job failed: ${errorType}`);
      }
      // Close the window after printing
      win.close();
    });

  } catch (error) {
    console.error('An error occurred during the print process:', error);
    win.close(); // Make sure the window is closed on error as well
  }
});

ipcMain.on('share', async (event, url, id) => {
  console.log(`Received upload request for URL: ${url}`);

  // Open a "Save As" dialog to specify where to save the PDF temporarily
  // const filepath = dialog.showSaveDialogSync({
  //   defaultPath: `factuur-${id}.pdf`,
  //   filters: [{ name: 'PDF', extensions: ['pdf'] }],
  // });

  // if (!filepath) {
  //   console.log('Save dialog cancelled');
  //   return;
  // }

  const filepath = path.join(__dirname, 'invoice.pdf');

  console.log(`Saving PDF temporarily to: ${filepath}`);

  // Create a hidden BrowserWindow to load the URL
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Window is hidden
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  try {
    console.log('Loading URL...');
    await win.loadURL(url);
    console.log('URL loaded successfully.');

    // Generate a PDF from the loaded URL
    console.log('Generating PDF...');
    const pdfData = await win.webContents.printToPDF({});

    // Save the PDF data to the specified file path
    fs.writeFileSync(filepath, pdfData);
    console.log(`PDF saved to ${filepath}`);

    // Upload the PDF to the server
    console.log('Uploading PDF to the server...');
    const uploadResponse = await uploadFileToServer(filepath, id);
    console.log('Upload response:', uploadResponse);
    console.log('Generating share url...');
    const shareResponse = await share('factuur-' + id + '.pdf');
    console.log('Upload response:', uploadResponse);

  } catch (error) {
    console.error('An error occurred during the PDF upload process:', error);
  } finally {
    // Close the window after saving the PDF or if an error occurs
    win.close();

    // Optionally delete the file after upload to clean up
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Temporary file deleted: ${filepath}`);
    }
  }
});

// Function to upload a file to the server using ky
async function uploadFileToServer(filepath, id) {
  const config = store.get('config', {});

  // Open the file as a Blob (using a suitable file handling library or API)
  const file = await fs.openAsBlob(filepath); // Ensure this method correctly reads the file as a Blob

  const formData = new FormData();
  formData.append('file', file); // Correctly append the file
  formData.append('name', 'factuur-' + id + '.pdf')

  const response = await fetch(config['server'] + "/api/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: "Bearer " + config['key'],
      // Optionally, you can set 'Content-Type': 'multipart/form-data' here, but generally, it's not necessary for FormData
    },
  });

  // Check response and handle errors or success
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error('Upload failed: ' + errorData.error);
  }

  return await response.json(); // Return the response as JSON
}

async function share(name) {
  const config = store.get('config', {});

  const url = "mailto:?body=%5BBericht%5DU%20kan%20factuur%20vinden%20op%20" + (config['server'] + '/facturen/' + name).toString() + "."
  console.log(url)
  shell.openExternal(url)
}