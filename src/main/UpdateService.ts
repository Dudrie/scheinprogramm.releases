import { ProgressInfo } from 'builder-util-runtime';
import UpdateEvents from 'common/UpdateEvents';
import { ipcMain, WebContents } from 'electron';
import log from 'electron-log';
import { autoUpdater, CancellationToken, UpdateInfo } from 'electron-updater';

const isDevelopment = process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

export abstract class UpdateService {
    private static sender: WebContents | undefined = undefined;
    private static cancellationToken: CancellationToken | undefined = undefined;
    private static isSilent: boolean = false;

    public static init() {
        if (isDevelopment) {
            console.log('UpdateService::init -- UpdateService will not react on events because the app is considered to be in the \'dev-mode\'. However it will simulate the prozess (except installation).');

            ipcMain.on(UpdateEvents.UPDATE_CHECK_FOR_UPDATES, this.simulateUpdate);
            return;
        }

        ipcMain.on(UpdateEvents.UPDATE_CHECK_FOR_UPDATES, UpdateService.checkForUpdate);
        ipcMain.on(UpdateEvents.UPDATE_DOWNLOAD_UPDATE, UpdateService.downloadUpdate);
        ipcMain.on(UpdateEvents.UPDATE_ABORT_DOWNLOAD_UPDATE, UpdateService.cancelUpdateDownload);
        ipcMain.on(UpdateEvents.UPDATE_RESTART_AND_INSTALL_UPDATE, UpdateService.restartAndInstallUpdate);

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
            if (UpdateService.sender) {
                UpdateService.sender.send(UpdateEvents.UPDATE_SEARCHING_FOR_UPDATES);
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
            UpdateService.sender.send(UpdateEvents.UPDATE_NO_NEW_VERSION_FOUND);
        }
    }

    private static onUpdateFound = (updateInfo: UpdateInfo) => {
        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_UPDATE_FOUND, updateInfo);
        }
    }

    private static downloadUpdate() {
        UpdateService.cancellationToken = new CancellationToken();

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_UPDATE);
        }

        autoUpdater.downloadUpdate(UpdateService.cancellationToken);
    }

    private static cancelUpdateDownload() {
        if (!UpdateService.cancellationToken) {
            // Nothing to cancel!
            return;
        }

        UpdateService.cancellationToken.cancel();

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_CANCELED);
        }
    }

    private static onUpdateProgress = (progInfo: ProgressInfo) => {
        let { bytesPerSecond, transferred, total, percent } = progInfo;
        log.info(`Progress received: ${bytesPerSecond}bytes/s, ${transferred}/${total}, ${percent}%`);

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_PROGRESS_UPDATE, progInfo);
        }
    }

    private static onUpdateDownloaded = () => {
        UpdateService.cancellationToken = undefined;

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_FINISHED);
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
            UpdateService.sender.send(UpdateEvents.UPDATE_UPDATE_ERROR);
        }
    }

    private static simulateUpdate = (ev: any, isSilent?: boolean) => {
        if (isSilent || (!ev.sender)) {
            return;
        }

        UpdateService.sender = ev.sender;

        ipcMain.once(UpdateEvents.UPDATE_DOWNLOAD_UPDATE, () => {
            UpdateService.cancellationToken = new CancellationToken();

            if (UpdateService.sender) {
                UpdateService.sender.send(UpdateEvents.UPDATE_DOWNLOAD_UPDATE);
            }

            let total: number = UpdateService.round(Math.random() * 50 + 50);
            let transferred: number = 0;
            
            // "Download the update"
            let interval = setInterval(() => {
                if (UpdateService.cancellationToken && UpdateService.cancellationToken.cancelled) {
                    clearInterval(interval);

                    return;
                }

                if (total <= transferred) {
                    clearInterval(interval);
                    UpdateService.onUpdateDownloaded();

                    return;
                }

                let mbPerSec: number = UpdateService.round(Math.random() * 10 + 2);
                
                transferred += mbPerSec;
                if (transferred > total) {
                    transferred = total;
                }

                let percent: number = UpdateService.round(transferred / total * 100);

                if (UpdateService.sender) {
                    let progUpdate: ProgressInfo = {
                        total: total * Math.pow(1000, 2),
                        transferred: transferred * Math.pow(1000, 2),
                        delta: -1,
                        percent,
                        bytesPerSecond: mbPerSec * (Math.pow(1000, 2))
                    };

                    UpdateService.sender.send(UpdateEvents.UPDATE_PROGRESS_UPDATE, progUpdate);
                }
            }, 1000);

        });

        ipcMain.once(UpdateEvents.UPDATE_ABORT_DOWNLOAD_UPDATE, UpdateService.cancelUpdateDownload);

        // "Search for an update"
        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.UPDATE_SEARCHING_FOR_UPDATES);
        }

        setTimeout(() => UpdateService.onUpdateFound({
            version: 'DEV-SIMULATE',
            files: [],
            path: '',
            sha512: '',
            releaseDate: ''
        }), 1000);
    }

    private static round(n: number): number {
        return Math.round(n * 100) / 100;
    }
}