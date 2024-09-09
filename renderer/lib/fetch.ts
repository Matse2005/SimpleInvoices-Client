import ky from "ky";

const config = () => {
  return {
    server: 'http://localhost:8000',
    key: ':Na.0u_WtZ65nhJRybPBA!ara2xhAVCd'
  }
}

const getConfig = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.ipc) {
      // Send a request to get the config from the main process
      window.ipc.send('get-config', {});

      // Listen for the 'config' event to receive the configuration data
      const removeListener = window.ipc.on('config', (config: any) => {
        if (config) {  // Ensure config is not undefined
          resolve(config); // Resolve the promise with the received config
        } else {
          reject(new Error('Failed to receive config from main process.'));
        }
        removeListener(); // Correctly remove the listener after usage
      });
    } else {
      reject(new Error("This code must run in the Electron renderer process."));
    }
  });
};

const getPrinters = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.ipc) {
      // Send a request to get the config from the main process
      window.ipc.send('get-printers', {});

      // Listen for the 'config' event to receive the configuration data
      const removeListener = window.ipc.on('printers', (printers: any) => {
        if (printers) {  // Ensure config is not undefined
          resolve(printers); // Resolve the promise with the received config
        } else {
          reject(new Error('Failed to receive printers from main process.'));
        }
        removeListener(); // Correctly remove the listener after usage
      });
    } else {
      reject(new Error("This code must run in the Electron renderer process."));
    }
  });
};

const getInvoice = async (config, id): Promise<any> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/invoice/" + id, {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

const byDate = async (config): Promise<any[]> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/invoices/by/date", {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any[]>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

const byAuthor = async (config, authorId): Promise<any[]> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/invoices/by/author/" + authorId, {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any[]>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

const byLocation = async (config, locationId): Promise<any[]> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/invoices/by/location/" + locationId, {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any[]>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

const byYear = async (config, year): Promise<any[]> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/invoices/by/year/" + year, {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any[]>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

const locations = async (config): Promise<any[]> => {
  try {
    const json = await ky
      .get(config['server'] + "/api/locations", {
        headers: {
          Authorization: "Bearer " + config['key'],
        },
      })
      .json<any[]>();

    return json;
  } catch (e) {
    console.log("Error: " + e);
  }
};

export default { getInvoice, byDate, byLocation, byAuthor, byYear, locations, getConfig, getPrinters };