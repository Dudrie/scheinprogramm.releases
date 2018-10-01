import { Theme } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as NotificationSystem from 'react-notification-system';
import { Notification, System } from 'react-notification-system';

export type Notification = Notification;
export type NotificationEventAddInfo = {
    action?: {
        label: string;
        eventToSend: string;
    },
    id?: string
};

interface Props {
    /**
     * Material-UI Theme which is used throughout the app. Used to generate the style of the notifications.
     */
    theme: Theme;
}

const generateStyle = (theme: Theme): NotificationSystem.Style => ({
    NotificationItem: {
        DefaultStyle: {
            // backgroundColor: theme.palette.background.paper,
            backgroundColor: blueGrey['900'],
            color: '#ffffff',
            fontFamily: theme.typography.fontFamily,
            // border: '1px solid ' + theme.palette.primary.main,
            borderTopWidth: '4px',
            borderRadius: 0,
            boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)'
        },
        info: {
            borderTopColor: theme.palette.primary.dark,
        }
    },

    Title: {
        DefaultStyle: {
            fontWeight: 500,
            borderBottom: '1px solid ' + theme.palette.grey['600'],
            paddingBottom: theme.spacing.unit / 2,
            marginBottom: theme.spacing.unit
        },
        info: {
            color: theme.palette.primary.light
        }
    },

    Dismiss: {
        DefaultStyle: {
            backgroundColor: 'transparent'
        }
    }
});

/**
 * Service, which bundles the NotificationSystem and corresponding functions into one component. It is used in two ways:
 * 1. The component to set the "location" of the NotificationSystem
 * 2. The static functions to actually display notifications.
 *
 * Make sure that you include and load this component somewhere in your app before calling any of the static methods.
 *
 * This component is based on the material-ui therefore a material-ui theme has to be provided via the properties. The style of the Notification will get generated from that given theme.
 */
export class NotificationService extends React.Component<Props, object> {
    private static readonly DEFAULT_POSITION = 'tr';

    private static isInitialized: boolean = false;
    private static notificationSystem: System | null = null;
    private static idToNotiMap: Map<string, Notification> = new Map();

    private notifcationStyle: NotificationSystem.Style;

    public static init() {
        if (this.isInitialized) {
            return;
        }

        ipcRenderer.on(NotificationEvents.SHOW_NOTIFICATION, this.onShowNotificationEvent);
        ipcRenderer.on(NotificationEvents.DISMISS_NOTIFICATION, this.onDismissNotificationEvent);

        this.isInitialized = true;
    }

    private static onShowNotificationEvent(_: any, noti: Notification, addInfo?: NotificationEventAddInfo) {
        if (addInfo) {
            if (addInfo.action) {
                let eventToSend = addInfo.action.eventToSend;
                
                noti = {
                    ...noti,
                    action: {
                        label: addInfo.action.label,
                        callback: function () {
                            ipcRenderer.send(eventToSend);
                        }
                    }
                };
            }

            if (addInfo.id) {
                if (NotificationService.idToNotiMap.has(addInfo.id)) {
                    console.error(`[ERROR] NotificationService::onShowNotificationEvent -- There is already a notification shown with the id '${addInfo.id}'. Make sure you either dismiss this one first or create a new unique id.`);
                    return;
                }

                let id = addInfo.id;
                let onRemove = noti.onRemove;

                noti = {
                    ...noti,
                    onRemove: (noti) => NotificationService.onNotificationRemoved(noti, id, onRemove)
                };
            }
        }

        let notiShown = NotificationService.showNotification(noti);

        if (addInfo && addInfo.id) {
            NotificationService.idToNotiMap.set(addInfo.id, notiShown);
        }
    }

    private static onDismissNotificationEvent(_: any, addInfo?: NotificationEventAddInfo) {
        if (!(addInfo && addInfo.id)) {
            console.error('[ERROR] NotificationServce::onDismissNotificationEvent -- The event needs to get an \'NotificationEventAddInfo\' object with the \'id\' attribute set.');
            return;
        }

        if (!NotificationService.idToNotiMap.has(addInfo.id)) {
            return;
        }

        let noti: Notification = NotificationService.idToNotiMap.get(addInfo.id)!;

        NotificationService.removeNotification(noti);
    }

    /**
     * Shows a Notification with the given settings. For more information on the settings refer to the settings page on the creator's GitHub.
     * @param notification Notification to show
     */
    public static showNotification(notification: Notification): Notification {
        if (!NotificationService.notificationSystem) {
            throw new Error('There is no NotificationSystem given. Did you include the component in your app at least once?');
        }

        // If there's no position set fall back to the default position.
        if (!notification.position) {
            notification.position = NotificationService.DEFAULT_POSITION;
        }

        return NotificationService.notificationSystem.addNotification(notification);
    }

    public static removeNotification(notification: Notification) {
        if (!NotificationService.notificationSystem) {
            throw new Error('There is no NotificationSystem given. Did you include the component in your app at least once?');
        }

        NotificationService.notificationSystem.removeNotification(notification);
    }

    public static editNotification(uidOrNotification: Notification | string | number, newProperties: Notification) {
        if (!NotificationService.notificationSystem) {
            throw new Error('There is no NotificationSystem given. Did you include the component in your app at least once?');
        }

        NotificationService.notificationSystem.editNotification(uidOrNotification, newProperties);
    }

    private static onNotificationRemoved(noti: Notification, id: string, onRemove?: (noti: Notification) => void) {
        NotificationService.idToNotiMap.delete(id);

        if (onRemove) {
            onRemove(noti);
        }
    }

    constructor(props: Props) {
        super(props);

        NotificationService.init();
        this.notifcationStyle = generateStyle(this.props.theme);
    }

    render() {
        return <NotificationSystem ref={this.onRef} style={this.notifcationStyle} />;
    }

    /**
     * Called when the NotificationSystem and a ref on it are created. Will set the static reference to the NotificationSystem.
     */
    private onRef = (system: System | null) => {
        if (!system) {
            return;
        }

        NotificationService.notificationSystem = system;
    }
}

// TODO: Entfernen - Der Main-Process sollte keine Notifications zeigen dürfen! Das übernimmt die App selbst.
export abstract class NotificationEvents {
    public static SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
    public static DISMISS_NOTIFICATION = 'DISMISS_NOTIFICATION';
}