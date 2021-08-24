/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import SerialPort from "serialport";
import { dialog } from "electron";

console.log("Initialising");

let serialPorts: SerialPort.PortInfo[];
let selectedSerialPort: SerialPort.PortInfo;
const refreshSerialPorts = () => {
    console.log("Refreshing serial ports");

    for (let i = 0; i < serialPortsDiv.length; i++) serialPortsDiv.remove(i);
    SerialPort.list()
        .then(ports => {
            console.log("Serial ports received:", ports);
            serialPorts = ports;

            if (ports.length === 0) {
                const option = document.createElement('option') as HTMLOptionElement;
                option.text = "No serial ports detected";
                serialPortsDiv.add(option);
                return;
            } 

            ports.forEach(port => {
                const option = document.createElement('option') as HTMLOptionElement;
                option.text = port.path;
                serialPortsDiv.add(option);
            });
        })
        .catch(error => {
            dialog.showMessageBox({
                type: "error",
                title: `Serial ports error`,
                message: `Unable to list serial ports`,
                detail: error,
            })
        });
}

const serialPortsDiv = document.getElementById('serialports') as HTMLSelectElement;
serialPortsDiv.addEventListener('change', () => {
    console.log("New serial port index selected");
    const index = serialPortsDiv.selectedIndex;
    selectedSerialPort = serialPorts[index];
})

const refreshButton = document.getElementById('refresh') as HTMLButtonElement
refreshButton.addEventListener('click', () => {
    refreshSerialPorts();
})
refreshSerialPorts();

// window.open('https://github.com', '_blank', 'top=500,left=200,frame=false,nodeIntegration=no')
