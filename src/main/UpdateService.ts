import { ipcMain, WebContents } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import EventNames from '../renderer/helpers/EventNames';
import { Notification } from 'react-notification-system';

export abstract class UpdateService {
    private static sender: WebContents | undefined = undefined;

    public static init() {
        this.checkForUpdate = this.checkForUpdate.bind(this);
        this.onUpdateFound = this.onUpdateFound.bind(this);

        ipcMain.on(EventNames.UPDATE_CHECK_FOR_UPDATES, this.checkForUpdate);

        autoUpdater.autoDownload = false;
        autoUpdater.on('update-available', this.onUpdateFound);
    }

    public static checkForUpdate(ev: any) {
        this.sender = ev.sender;
        autoUpdater.checkForUpdates();
    }

    public static onUpdateFound(updateInfo: UpdateInfo) {
        if (this.sender) {
            let noti: Notification = {
                title: 'Update gefunden',
                message: 'Es wurde ein Update gefunden',
                level: 'info'
            };

            this.sender.send(EventNames.PRINT_TO_CONSOLE, updateInfo);
            this.sender.send(EventNames.SHOW_NOTIFICATION, noti);
        }
    }
}