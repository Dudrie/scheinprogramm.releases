import { ProgressInfo } from 'builder-util-runtime';
import { ipcMain, WebContents } from 'electron';
import log from 'electron-log';
import { autoUpdater, CancellationToken, UpdateInfo } from 'electron-updater';
import { Notification } from 'react-notification-system';
import Language from '../renderer/helpers/Language';
import { NotificationEventAddInfo, NotificationEvents } from '../renderer/helpers/NotificationService';

const isDevelopment = process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

export abstract class UpdateService {
    private static readonly NOTI_SEARCH_UPDATES_ID = 'UPDATE_SERVICE_SEARCH_FOR_UPDATES_NOTI';

    private static sender: WebContents | undefined = undefined;
    private static isSilent: boolean = false;

    public static init() {
        if (isDevelopment) {
            console.log('UpdateService::init -- UpdateService will not react on events because the app is considered to be in the \'dev-mode\'.');
            return;
        }

        this.onUpdateFound = this.onUpdateFound.bind(this);

        ipcMain.on(UpdateEvents.UPDATE_CHECK_FOR_UPDATES, this.checkForUpdate);
        ipcMain.on(UpdateEvents.UPDATE_DOWNLOAD_UPDATE, this.downloadUpdate);
        ipcMain.on(UpdateEvents.UPDATE_RESTART_AND_INSTALL_UPDATE, this.restartAndInstallUpdate);

        log.transports.file.level = 'info';

        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;

        autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
        autoUpdater.on('update-available', this.onUpdateFound);
        autoUpdater.on('download-progress', this.onUpdateProgress);
        autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
        autoUpdater.on('error', this.onUpdateError);
    }

    private static checkForUpdate = (ev: any, isSilent?: boolean) => {
        UpdateService.sender = ev.sender;

        if (isSilent != undefined) {
            UpdateService.isSilent = isSilent;
        }

        if (!UpdateService.isSilent) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_CHECKING_FOR_UPDATES_TITLE'),
                message: Language.getString('UPDATE_NOTI_CHECKING_FOR_UPDATES_MESSAGE'),
                autoDismiss: 0,
                level: 'info'
            };
            
            let addInfo: NotificationEventAddInfo = {
                id: UpdateService.NOTI_SEARCH_UPDATES_ID
            };
            
            if (UpdateService.sender) {
                UpdateService.sender.send(NotificationEvents.SHOW_NOTIFICATION, noti, addInfo);
            }
        }

        setImmediate(() => autoUpdater.checkForUpdates());
    }

    private static onUpdateNotAvailable = () => {
        if (UpdateService.isSilent) {
            // If we're checking for a silent update, don't show that there's no update.
            return;
        }

        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_TITLE'),
                message: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_MESSAGE'),
                level: 'info'
            };

            UpdateService.dismissNotification(UpdateService.NOTI_SEARCH_UPDATES_ID);
            UpdateService.sender.send(NotificationEvents.SHOW_NOTIFICATION, noti);
        }
    }

    private static onUpdateFound = (updateInfo: UpdateInfo) => {
        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_FOUND_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_FOUND_MESSAGE', updateInfo.version),
                level: 'info'
            };

            let addInfoShow: NotificationEventAddInfo = {
                action: {
                    label: Language.getString('UPDATE_NOTI_UPDATE_FOUND_ACTION_DOWNLOAD_LABEL'),
                    eventToSend: UpdateEvents.UPDATE_DOWNLOAD_UPDATE
                }
            };

            UpdateService.dismissNotification(UpdateService.NOTI_SEARCH_UPDATES_ID);
            UpdateService.sender.send(NotificationEvents.SHOW_NOTIFICATION, noti, addInfoShow);
        }
    }

    private static downloadUpdate() {
        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_UPDATE);
        }

        // TODO: Abbrechbar machen!
        autoUpdater.downloadUpdate(new CancellationToken());
    }

    private static onUpdateProgress = (progInfo: ProgressInfo) => {
        let { bytesPerSecond, transferred, total, percent } = progInfo;
        log.info(`Progress received: ${bytesPerSecond}bytes/s, ${transferred}/${total}, ${percent}%`);

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_PROGRESS_UPDATE, progInfo);
        }
    }

    private static onUpdateDownloaded = () => {
        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_FINISHED);

            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_MESSAGE'),
                autoDismiss: 0,
                level: 'info'
            };

            let addInfo: NotificationEventAddInfo = {
                action: {
                    label: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_ACTION_RESTART_AND_INSTALL_LABEL'),
                    eventToSend: UpdateEvents.UPDATE_RESTART_AND_INSTALL_UPDATE
                }
            };

            UpdateService.sender.send(NotificationEvents.SHOW_NOTIFICATION, noti, addInfo);
        }
    }

    private static restartAndInstallUpdate() {
        autoUpdater.quitAndInstall(false, true);
    }

    private static onUpdateError() {
        if (UpdateService.isSilent) {
            // If it's a silent update, don't show any errors (BUT they get logged in the log anyway)
            return;
        }

        if (UpdateService.sender) {
            let noti: Notification = {
                title: Language.getString('UPDATE_NOTI_UPDATE_ERROR_TITLE'),
                message: Language.getString('UPDATE_NOTI_UPDATE_ERROR_MESSAGE'),
                level: 'error'
            };

            UpdateService.dismissNotification(UpdateService.NOTI_SEARCH_UPDATES_ID);
            UpdateService.sender.send(NotificationEvents.SHOW_NOTIFICATION, noti);
        }
    }

    private static dismissNotification(notiId: string) {
        if (!UpdateService.sender) {
            return;
        }

        let addInfo: NotificationEventAddInfo = {
            id: notiId
        };

        UpdateService.sender.send(NotificationEvents.DISMISS_NOTIFICATION, addInfo);
    }

}

export abstract class UpdateEvents {
    public static UPDATE_CHECK_FOR_UPDATES = 'CHECK_FOR_UPDATES';
    public static UPDATE_UPDATE_FOUND = 'UPDATE_FOUND';
    public static UPDATE_DOWNLOAD_UPDATE = 'DOWNLOAD_UPDATE';
    public static UPDATE_PROGRESS_UPDATE = 'PROGRESS_UPDATE';
    public static UPDATE_DOWNLOAD_FINISHED = 'UPDATE_DOWNLOAD_FINISHED';
    public static UPDATE_RESTART_AND_INSTALL_UPDATE = 'INSTALL_UPDATE';
}