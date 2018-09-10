import { ipcMain, WebContents } from 'electron';
import log from 'electron-log';
import { autoUpdater, CancellationToken, UpdateInfo } from 'electron-updater';
import { Notification } from 'react-notification-system';
import EventNames from '../renderer/helpers/EventNames';
import { ProgressInfo } from 'builder-util-runtime';
import { NotificationEventAddInfo } from '../renderer/helpers/NotificationService';
import Language from '../renderer/helpers/Language';

export abstract class UpdateService {
    private static readonly NOTI_DOWLOAD_STARTED_ID = 'UPDATE_SERVICE_DOWNLOAD_STARTED_NOTI';
    private static sender: WebContents | undefined = undefined;

    public static init() {
        this.onUpdateFound = this.onUpdateFound.bind(this);

        ipcMain.on(EventNames.UPDATE_CHECK_FOR_UPDATES, this.checkForUpdate);
        ipcMain.on(EventNames.UPDATE_DOWNLOAD_UPDATE, this.downloadUpdate);
        ipcMain.on(EventNames.UPDATE_RESTART_AND_INSTALL_UPDATE, this.restartAndInstallUpdate);

        log.transports.file.file = __dirname + '/../log.txt';
        log.transports.file.level = 'info';

        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;

        autoUpdater.on('update-available', this.onUpdateFound);
        autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
        autoUpdater.on('error', this.onUpdateError);
        autoUpdater.signals.progress(this.onUpdateProgress);
        autoUpdater.signals.updateDownloaded(this.onUpdateDownloaded);
    }

    public static checkForUpdate = (ev: any) => {
        UpdateService.sender = ev.sender;
        autoUpdater.checkForUpdates();
    }

    public static onUpdateNotAvailable = () => {
        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_TITLE'),
                message: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_MESSAGE'),
                level: 'info'
            };

            UpdateService.sender.send(EventNames.SHOW_NOTIFICATION, noti);
        }
    }

    public static onUpdateFound = (updateInfo: UpdateInfo) => {
        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_FOUND_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_FOUND_MESSAGE', updateInfo.version),
                level: 'info'
            };

            let addInfo: NotificationEventAddInfo = {
                action: {
                    label: Language.getString('UPDATE_NOTI_UPDATE_FOUND_ACTION_DOWNLOAD_LABEL'),
                    eventToSend: EventNames.UPDATE_DOWNLOAD_UPDATE
                }
            };

            UpdateService.sender.send(EventNames.SHOW_NOTIFICATION, noti, addInfo);
        }
    }

    public static downloadUpdate() {
        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOAD_STARTED_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOAD_STARTED_MESSAGE'),
                level: 'info'
            };

            UpdateService.sender.send(EventNames.SHOW_NOTIFICATION, noti, { id: UpdateService.NOTI_DOWLOAD_STARTED_ID });
        }

        // TODO: Abbrechbar machen!
        autoUpdater.downloadUpdate(new CancellationToken());
    }

    public static onUpdateProgress = (progInfo: ProgressInfo) => {
        // TODO: Progressanzeige?
        // log.info(`Progress: ${progInfo.percent}% -- ${progInfo.bytesPerSecond} bytes/s`);
    }

    public static onUpdateDownloaded = () => {
        // log.info('Update downloaded');

        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_MESSAGE'),
                autoDismiss: 0,
                level: 'info'
            };

            let addInfo: NotificationEventAddInfo = {
                action: {
                    label: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_ACTION_RESTART_AND_INSTALL_LABEL'),
                    eventToSend: EventNames.UPDATE_RESTART_AND_INSTALL_UPDATE
                }
            };

            UpdateService.sender.send(EventNames.DISMISS_NOTIFICATION, { id: UpdateService.NOTI_DOWLOAD_STARTED_ID });
            UpdateService.sender.send(EventNames.SHOW_NOTIFICATION, noti, addInfo);
        }
    }

    public static restartAndInstallUpdate() {
        autoUpdater.quitAndInstall(false, true);
    }

    public static onUpdateError() {
        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_ERROR_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_ERROR_MESSAGE'),
                level: 'error'
            };

            UpdateService.sender.send(EventNames.SHOW_NOTIFICATION, noti);
        }
    }

}