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

            if (ports.length === 1) {
                selectedSerialPort = serialPorts[0];
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

let controllerPorts: Gamepad[];
let selectedControllerPort: number;
const refreshControllers = () => {
    for (let i = 0; i < controllerDiv.length; i++) controllerDiv.remove(i);

    controllerPorts = Array.from(navigator.getGamepads()).filter(controller => controller != null)
    if (controllerPorts.length === 0) {
        const option = document.createElement('option') as HTMLOptionElement;
        option.text = "No controllers detected";
        controllerDiv.add(option);
        return;
    }

    if (controllerPorts.length === 1) {
        selectedControllerPort = 0;
    }

    controllerPorts.forEach(controller => {
        const option = document.createElement('option') as HTMLOptionElement;
        option.text = controller.id;
        controllerDiv.add(option);
    });
}

const axisBuffer = Buffer.alloc(4);
const buttonBuffer = Buffer.alloc(4);
let serialPort: SerialPort;
const readController = () => {
    if (selectedControllerPort == undefined) return;
    console.log('Sending');

    const gamepad = navigator.getGamepads()[selectedControllerPort];
    const axes = gamepad.axes.map(axes => Math.round((axes + 1) / 2 * 255));
    axes.forEach((axe, index) => axisBuffer[index] = axe)

    const buttons = gamepad.buttons.map(button => button.pressed ? 1 : 0);

    buttons.forEach((button, index) => {
        const i = Math.floor(index / 8);
        buttonBuffer[i] = (buttonBuffer[i] & ~(1 << (index % 8))) | (button << (index % 8))
    })

    const toSend = Buffer.concat([axisBuffer, buttonBuffer])
    if (serialPort === undefined) {
        serialPort = new SerialPort(selectedSerialPort.path, { baudRate: 115200 })
    }
    serialPort.write(toSend);
}

const serialPortsDiv = document.getElementById('serialports') as HTMLSelectElement;
serialPortsDiv.addEventListener('change', () => {
    console.log("New serial port index selected");
    const index = serialPortsDiv.selectedIndex;
    selectedSerialPort = serialPorts[index];
})

const refreshSerialButton = document.getElementById('refreshserial') as HTMLButtonElement
refreshSerialButton.addEventListener('click', () => {
    refreshSerialPorts();
})
refreshSerialPorts();

const controllerDiv = document.getElementById('controllers') as HTMLSelectElement;
controllerDiv.addEventListener('change', () => {
    console.log("New controller port index selected");
    selectedControllerPort = controllerDiv.selectedIndex;
})

const refreshControllerButton = document.getElementById('refreshcontrollers') as HTMLButtonElement
refreshControllerButton.addEventListener('click', () => {
    refreshControllers();
})
refreshControllers();

setInterval(readController, 20);